import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateJobDto } from './dto/create-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Request() req, @Body() createJobDto: CreateJobDto) {
    return this.jobsService.createJob(req.user.sub, createJobDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.jobsService.findAll(req.user.sub);
  }

  @Get('mine')
  findMine(@Request() req) {
    return this.jobsService.findOrganizationJobs(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.jobsService.findOne(id, req.user.sub);
  }

  @Post(':id/apply')
  apply(
    @Param('id') id: string,
    @Request() req,
    @Body() applyJobDto: ApplyJobDto,
  ) {
    return this.jobsService.applyToJob(id, req.user.sub, applyJobDto);
  }

  @Get(':id/applications')
  getApplications(@Param('id') id: string, @Request() req) {
    return this.jobsService.getJobApplications(id, req.user.sub);
  }
}
