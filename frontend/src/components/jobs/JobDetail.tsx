import React from 'react';
import { format } from 'date-fns';
import { BriefcaseIcon, BuildingOfficeIcon, GlobeAltIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { JobSummary } from '@/types/job';

interface JobDetailProps {
  job: JobSummary | null;
  canApply: boolean;
  onApplyClick: (job: JobSummary) => void;
  onManageApplications?: () => void;
  isOwnPosting?: boolean;
}

const labelMap: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  temporary: 'Temporary',
  internship: 'Internship',
  freelance: 'Freelance',
  onsite: 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
};

export function JobDetail({ job, canApply, onApplyClick, onManageApplications, isOwnPosting }: JobDetailProps) {
  if (!job) {
    return (
      <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center h-full flex flex-col justify-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900">Select a job to preview</h3>
        <p className="text-gray-500 mt-2">Browse opportunities and tap a listing to see the full description.</p>
      </div>
    );
  }

  const employmentLabel = labelMap[job.employmentType] || job.employmentType;
  const workplaceLabel = labelMap[job.workplaceType] || job.workplaceType;
  const formattedDeadline = job.applicationDeadline
    ? format(new Date(job.applicationDeadline), 'PPP')
    : null;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm h-full overflow-hidden flex flex-col">
      <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-white via-white to-primary-50/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{job.title}</h1>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-4 w-4 text-primary-500" />
                <span>
                  {job.organizationName || job.organization?.organizationName ||
                    [job.organization?.firstName, job.organization?.lastName].filter(Boolean).join(' ')}
                </span>
              </div>
              {job.location && (
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="h-4 w-4 text-primary-500" />
                  <span>{job.location}</span>
                </div>
              )}
            </div>
          </div>
          {job.organizationLogo && (
            <img
              src={job.organizationLogo}
              alt={job.organizationName || 'Organization logo'}
              className="h-14 w-14 rounded-xl object-cover border border-gray-100"
            />
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
            <BriefcaseIcon className="h-4 w-4" />
            {employmentLabel}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
            {workplaceLabel}
          </span>
          {job.experienceLevel && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
              {job.experienceLevel}
            </span>
          )}
          {job.seniority && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm font-medium">
              {job.seniority}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {Boolean(job.salaryMin || job.salaryMax) && (
            <div className="font-medium">
              Salary:
              <span className="ml-2 text-gray-900">
                {job.salaryCurrency || 'USD'} {job.salaryMin ? job.salaryMin.toLocaleString() : '—'} – {job.salaryMax ? job.salaryMax.toLocaleString() : '—'}
              </span>
            </div>
          )}
          {formattedDeadline && (
            <div className="font-medium">
              Apply by:
              <span className="ml-2 text-gray-900">{formattedDeadline}</span>
            </div>
          )}
          <div className="font-medium">
            {job.applicationCount ?? 0} applicant{(job.applicationCount ?? 0) === 1 ? '' : 's'}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
          {canApply && job.isActive && !job.hasApplied && (
            <button
              onClick={() => onApplyClick(job)}
              className="px-5 py-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition"
            >
              Apply now
            </button>
          )}
          {canApply && job.hasApplied && (
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 font-semibold">
              ✅ You applied
            </span>
          )}
          {!job.isActive && (
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-200 text-gray-600 font-semibold">
              Closed
            </span>
          )}
          {isOwnPosting && onManageApplications && (
            <button
              onClick={onManageApplications}
              className="px-5 py-2.5 rounded-full border border-primary-200 text-primary-700 hover:bg-primary-50 transition"
            >
              View applicants
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About the role</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
        </section>

        {job.responsibilities?.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key responsibilities</h3>
            <ul className="space-y-2 text-gray-700">
              {job.responsibilities.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-1 text-primary-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {job.requirements?.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
            <ul className="space-y-2 text-gray-700">
              {job.requirements.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-1 text-primary-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {job.benefits?.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
            <ul className="space-y-2 text-gray-700">
              {job.benefits.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-1 text-primary-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="border-t border-gray-100 bg-gray-50 px-8 py-6 text-sm text-gray-600">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {job.contactEmail && (
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="h-5 w-5 text-primary-500" />
              <a href={`mailto:${job.contactEmail}`} className="text-primary-700 hover:underline">
                {job.contactEmail}
              </a>
            </div>
          )}
          {job.applicationUrl && (
            <a
              href={job.applicationUrl.startsWith('http') ? job.applicationUrl : `https://${job.applicationUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Apply on company site →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
