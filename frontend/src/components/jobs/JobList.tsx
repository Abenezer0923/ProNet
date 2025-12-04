import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { JobSummary } from '@/types/job';

interface JobListProps {
  jobs: JobSummary[];
  selectedJobId: string | null;
  onSelect: (job: JobSummary) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const employmentLabelMap: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  temporary: 'Temporary',
  internship: 'Internship',
  freelance: 'Freelance',
};

const workplaceLabelMap: Record<string, string> = {
  onsite: 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
};

export function JobList({ jobs, selectedJobId, onSelect, loading, emptyMessage }: JobListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((skeleton) => (
          <div key={skeleton} className="animate-pulse bg-white border border-gray-100 rounded-2xl p-4">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">💼</div>
        <p className="text-gray-600 font-medium">
          {emptyMessage || 'No job opportunities available yet.'}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Follow organizations to get notified when new roles are posted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const isSelected = job.id === selectedJobId;
        const postedAgo = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true });
        const employmentLabel = employmentLabelMap[job.employmentType] || job.employmentType;
        const workplaceLabel = workplaceLabelMap[job.workplaceType] || job.workplaceType;

        return (
          <button
            key={job.id}
            onClick={() => onSelect(job)}
            className={`w-full text-left bg-white border rounded-2xl p-5 transition-all ${
              isSelected
                ? 'border-primary-500 shadow-lg shadow-primary-100/40'
                : 'border-gray-100 hover:border-primary-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {job.organizationName || job.organization?.organizationName || job.organization?.firstName}
                </p>
              </div>
              <span className="text-xs font-medium text-gray-500">{postedAgo}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
              {job.location && (
                <span className="px-3 py-1 bg-gray-100 rounded-full">{job.location}</span>
              )}
              <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full">
                {employmentLabel}
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                {workplaceLabel}
              </span>
              {job.experienceLevel && (
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full">
                  {job.experienceLevel}
                </span>
              )}
            </div>

            {Boolean(job.salaryMin || job.salaryMax) && (
              <div className="mt-3 text-sm font-medium text-gray-700">
                {job.salaryCurrency || 'USD'}{' '}
                {job.salaryMin ? job.salaryMin.toLocaleString() : '—'}{' '}
                • {' '}
                {job.salaryMax ? job.salaryMax.toLocaleString() : '—'}
              </div>
            )}

            {job.hasApplied && (
              <div className="mt-3 inline-flex items-center text-xs text-emerald-600 font-semibold">
                <span className="mr-1 text-base">✅</span> Applied
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default JobList;
