import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { JobApplication } from './entities/job-application.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';
import { User } from '../users/entities/user.entity';
import { Connection } from '../users/entities/connection.entity';
import { NotificationsService } from '../notifications/notifications.service';

interface JobResponseOptions {
  applicationCount?: number;
  hasApplied?: boolean;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobApplication)
    private readonly jobApplicationRepository: Repository<JobApplication>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Connection)
    private readonly connectionRepository: Repository<Connection>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private sanitizeList(values?: string[]): string[] {
    if (!values) {
      return [];
    }

    return values
      .map((value) => (value ?? '').toString().trim())
      .filter((value) => value.length > 0)
      .slice(0, 20);
  }

  private buildJobResponse(job: Job, options: JobResponseOptions = {}) {
    const organizationProfile = job.organization
      ? {
          id: job.organization.id,
          profileType: job.organization.profileType,
          organizationName: job.organization.organizationName,
          firstName: job.organization.firstName,
          lastName: job.organization.lastName,
          profilePicture: job.organization.profilePicture,
          avatar: job.organization.avatar,
          username: job.organization.username,
          location: job.organization.location,
        }
      : null;

    return {
      id: job.id,
      organizationId: job.organizationId,
      title: job.title,
      description: job.description,
      employmentType: job.employmentType,
      workplaceType: job.workplaceType,
      location: job.location,
      salaryCurrency: job.salaryCurrency,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      experienceLevel: job.experienceLevel,
      seniority: job.seniority,
      responsibilities: job.responsibilities ?? [],
      requirements: job.requirements ?? [],
      benefits: job.benefits ?? [],
      applicationUrl: job.applicationUrl,
      contactEmail: job.contactEmail,
      applicationDeadline: job.applicationDeadline,
      organizationName: job.organizationName,
      organizationLogo: job.organizationLogo,
      isActive: job.isActive,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      organization: organizationProfile,
      applicationCount: options.applicationCount ?? 0,
      hasApplied: options.hasApplied ?? false,
    };
  }

  private async decorateJobs(
    jobs: Job[],
    currentUserId?: string,
    options: { includeHasApplied?: boolean } = {},
  ) {
    if (jobs.length === 0) {
      return [];
    }

    const jobIds = jobs.map((job) => job.id);

    const rawCounts = await this.jobApplicationRepository
      .createQueryBuilder('application')
      .select('application.jobId', 'jobId')
      .addSelect('COUNT(*)', 'count')
      .where('application.jobId IN (:...jobIds)', { jobIds })
      .groupBy('application.jobId')
      .getRawMany();

    const countMap = new Map<string, number>(
      rawCounts.map((row) => [row.jobId, parseInt(row.count, 10)]),
    );

    let appliedSet = new Set<string>();
    if (currentUserId && options.includeHasApplied !== false) {
      const myApplications = await this.jobApplicationRepository.find({
        where: { jobId: In(jobIds), applicantId: currentUserId },
        select: ['jobId'],
      });
      appliedSet = new Set(myApplications.map((app) => app.jobId));
    }

    return jobs.map((job) =>
      this.buildJobResponse(job, {
        applicationCount: countMap.get(job.id) ?? 0,
        hasApplied:
          options.includeHasApplied === false ? false : appliedSet.has(job.id),
      }),
    );
  }

  async createJob(organizationId: string, dto: CreateJobDto) {
    const organization = await this.userRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('User not found');
    }

    if (organization.profileType !== 'organizational') {
      throw new ForbiddenException('Only organizational accounts can post jobs');
    }

    if (
      dto.salaryMin !== undefined &&
      dto.salaryMax !== undefined &&
      dto.salaryMin !== null &&
      dto.salaryMax !== null &&
      Number(dto.salaryMax) < Number(dto.salaryMin)
    ) {
      throw new BadRequestException('Maximum salary must be greater than minimum salary');
    }

    const job = this.jobRepository.create({
      title: dto.title.trim(),
      description: dto.description.trim(),
      organizationId,
      employmentType: dto.employmentType,
      workplaceType: dto.workplaceType,
      location: dto.location?.trim() || null,
      salaryCurrency: dto.salaryCurrency?.trim() || null,
      salaryMin: dto.salaryMin ?? null,
      salaryMax: dto.salaryMax ?? null,
      experienceLevel: dto.experienceLevel?.trim() || null,
      seniority: dto.seniority?.trim() || null,
      responsibilities: this.sanitizeList(dto.responsibilities),
      requirements: this.sanitizeList(dto.requirements),
      benefits: this.sanitizeList(dto.benefits),
      applicationUrl: dto.applicationUrl?.trim() || null,
      contactEmail: dto.contactEmail?.trim() || organization.email,
      applicationDeadline: dto.applicationDeadline
        ? new Date(dto.applicationDeadline)
        : null,
      organizationName:
        organization.organizationName ||
        [organization.firstName, organization.lastName].filter(Boolean).join(' ').trim() ||
        'Hiring team',
      organizationLogo: organization.profilePicture || organization.avatar || null,
      isActive: true,
    });

    const savedJob = await this.jobRepository.save(job);
    const jobWithOrganization = await this.jobRepository.findOne({
      where: { id: savedJob.id },
      relations: ['organization'],
    });

    const followerConnections = await this.connectionRepository.find({
      where: { followingId: organizationId },
      relations: ['follower'],
    });

    const organizationDisplayName =
      jobWithOrganization?.organizationName || job.organizationName;

    await Promise.all(
      followerConnections
        .filter(
          (connection) =>
            connection.follower &&
            connection.follower.profileType !== 'organizational',
        )
        .map((connection) =>
          this.notificationsService.createJobPostedNotification(
            organizationId,
            connection.followerId,
            savedJob.id,
            organizationDisplayName,
            job.title,
          ),
        ),
    );

    if (!jobWithOrganization) {
      return this.buildJobResponse(job, { applicationCount: 0, hasApplied: false });
    }

    return this.buildJobResponse(jobWithOrganization, {
      applicationCount: 0,
      hasApplied: false,
    });
  }

  async findAll(currentUserId: string) {
    const jobs = await this.jobRepository.find({
      where: { isActive: true },
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });

    return this.decorateJobs(jobs, currentUserId);
  }

  async findOrganizationJobs(organizationId: string) {
    const organization = await this.userRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('User not found');
    }

    if (organization.profileType !== 'organizational') {
      throw new ForbiddenException('Only organizational accounts can view posted jobs');
    }

    const jobs = await this.jobRepository.find({
      where: { organizationId },
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });

    return this.decorateJobs(jobs, organizationId, { includeHasApplied: false });
  }

  async findOne(jobId: string, currentUserId: string) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['organization'],
    });

    if (!job || (!job.isActive && job.organizationId !== currentUserId)) {
      throw new NotFoundException('Job not found');
    }

    const [decoratedJob] = await this.decorateJobs([job], currentUserId);
    return decoratedJob;
  }

  async applyToJob(jobId: string, applicantId: string, dto: ApplyJobDto) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, isActive: true },
      relations: ['organization'],
    });

    if (!job) {
      throw new NotFoundException('Job not found or inactive');
    }

    const applicant = await this.userRepository.findOne({
      where: { id: applicantId },
    });

    if (!applicant) {
      throw new NotFoundException('User not found');
    }

    if (applicant.profileType !== 'personal') {
      throw new ForbiddenException('Only personal accounts can apply to jobs');
    }

    const existingApplication = await this.jobApplicationRepository.findOne({
      where: { jobId, applicantId },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied to this job');
    }

    const application = this.jobApplicationRepository.create({
      jobId,
      applicantId,
      coverLetter: dto.coverLetter?.trim() || null,
      resumeUrl: dto.resumeUrl?.trim() || null,
    });

    await this.jobApplicationRepository.save(application);

    const applicantName =
      [applicant.firstName, applicant.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || applicant.email;

    await this.notificationsService.createJobApplicationNotification(
      applicantId,
      job.organizationId,
      job.id,
      applicantName,
      job.title,
    );

    const [updatedJob] = await this.decorateJobs([job], applicantId);

    return {
      message: 'Application submitted successfully',
      job: updatedJob,
    };
  }

  async getJobApplications(jobId: string, requestorId: string) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.organizationId !== requestorId) {
      throw new ForbiddenException('You are not allowed to view these applications');
    }

    const applications = await this.jobApplicationRepository.find({
      where: { jobId },
      relations: ['applicant'],
      order: { createdAt: 'DESC' },
    });

    return applications.map((application) => ({
      id: application.id,
      coverLetter: application.coverLetter,
      resumeUrl: application.resumeUrl,
      status: application.status,
      createdAt: application.createdAt,
      applicant: application.applicant
        ? {
            id: application.applicant.id,
            firstName: application.applicant.firstName,
            lastName: application.applicant.lastName,
            profilePicture: application.applicant.profilePicture,
            avatar: application.applicant.avatar,
            profession: application.applicant.profession,
            location: application.applicant.location,
          }
        : null,
    }));
  }
}
