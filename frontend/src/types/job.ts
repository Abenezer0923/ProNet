export interface JobOrganizationProfile {
  id: string;
  profileType?: 'personal' | 'organizational';
  organizationName?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  avatar?: string;
  username?: string;
  location?: string;
}

export interface JobSummary {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  employmentType: string;
  workplaceType: string;
  location?: string;
  salaryCurrency?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  seniority?: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  applicationUrl?: string;
  contactEmail?: string;
  applicationDeadline?: string;
  organizationName?: string;
  organizationLogo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organization?: JobOrganizationProfile | null;
  applicationCount?: number;
  hasApplied?: boolean;
}

export interface JobApplicationSummary {
  id: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: 'submitted' | 'under_review' | 'interview' | 'offer' | 'rejected';
  createdAt: string;
  applicant?: {
    id: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    avatar?: string;
    profession?: string;
    location?: string;
  } | null;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  employmentType: string;
  workplaceType: string;
  location?: string;
  salaryCurrency?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  seniority?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  applicationUrl?: string;
  contactEmail?: string;
  applicationDeadline?: string;
}

export interface ApplyJobPayload {
  coverLetter?: string;
  resumeUrl?: string;
}
