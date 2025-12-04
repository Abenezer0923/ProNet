import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { JobApplicationSummary } from '@/types/job';
import { formatDistanceToNow } from 'date-fns';

interface JobApplicantsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applications: JobApplicationSummary[];
  jobTitle?: string;
}

const statusPalette: Record<JobApplicationSummary['status'], { label: string; bg: string; text: string }> = {
  submitted: { label: 'Submitted', bg: 'bg-blue-50', text: 'text-blue-600' },
  under_review: { label: 'Under review', bg: 'bg-amber-50', text: 'text-amber-600' },
  interview: { label: 'Interview', bg: 'bg-purple-50', text: 'text-purple-600' },
  offer: { label: 'Offer extended', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-600' },
};

export function JobApplicantsDrawer({ isOpen, onClose, applications, jobTitle }: JobApplicantsDrawerProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg h-full bg-white shadow-2xl border-l border-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-primary-50/40">
          <div>
            <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">Applicants</p>
            <h2 className="text-xl font-semibold text-gray-900 leading-snug">
              {applications.length} candidate{applications.length === 1 ? '' : 's'}
            </h2>
            {jobTitle && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{jobTitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {applications.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <div className="text-4xl mb-3">🗂️</div>
              <p>No applicants yet. Share this job with your network to attract candidates.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {applications.map((application) => {
                const statusStyle = statusPalette[application.status];
                const submittedAgo = formatDistanceToNow(new Date(application.createdAt), {
                  addSuffix: true,
                });
                const applicantName = application.applicant
                  ? [application.applicant.firstName, application.applicant.lastName].filter(Boolean).join(' ') || 'Applicant'
                  : 'Applicant';

                return (
                  <li key={application.id} className="px-6 py-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-gray-900">{applicantName}</p>
                        {application.applicant?.profession && (
                          <p className="text-sm text-gray-500">{application.applicant.profession}</p>
                        )}
                        {application.applicant?.location && (
                          <p className="text-xs text-gray-400 mt-1">{application.applicant.location}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                    </div>

                    {application.coverLetter && (
                      <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-700">
                        <p className="font-medium text-gray-900 mb-1">Cover letter</p>
                        <p className="leading-relaxed whitespace-pre-line">{application.coverLetter}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Applied {submittedAgo}</span>
                      {application.resumeUrl && (
                        <a
                          href={application.resumeUrl.startsWith('http') ? application.resumeUrl : `https://${application.resumeUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 font-medium hover:text-primary-700"
                        >
                          View resume →
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobApplicantsDrawer;
