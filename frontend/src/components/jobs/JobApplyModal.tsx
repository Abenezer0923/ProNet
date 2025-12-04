import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ApplyJobPayload, JobSummary } from '@/types/job';

interface JobApplyModalProps {
  job: JobSummary | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ApplyJobPayload) => Promise<void>;
}

export function JobApplyModal({ job, isOpen, isSubmitting, onClose, onSubmit }: JobApplyModalProps) {
  const [form, setForm] = useState({
    coverLetter: '',
    resumeUrl: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ coverLetter: '', resumeUrl: '' });
      setError(null);
    }
  }, [isOpen, job?.id]);

  if (!isOpen || !job) {
    return null;
  }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.coverLetter.trim() && !form.resumeUrl.trim()) {
      setError('Please include a short message or a resume link so the team can follow up.');
      return;
    }

    try {
      await onSubmit({
        coverLetter: form.coverLetter.trim() || undefined,
        resumeUrl: form.resumeUrl.trim() || undefined,
      });
    } catch (submitError: any) {
      setError(submitError?.message || 'Unable to submit your application right now.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-primary-50/40">
          <div>
            <p className="text-sm font-medium text-primary-700 mb-1">Applying for</p>
            <h2 className="text-2xl font-semibold text-gray-900 leading-snug">{job.title}</h2>
            <p className="text-sm text-gray-600 mt-2">
              {job.organizationName || job.organization?.organizationName ||
                [job.organization?.firstName, job.organization?.lastName].filter(Boolean).join(' ')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personal note</label>
            <textarea
              name="coverLetter"
              value={form.coverLetter}
              onChange={handleChange}
              rows={6}
              placeholder="Introduce yourself, highlight relevant experience, and share why you're excited about this role."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-400 mt-2">Optional but highly encouraged. A thoughtful message helps you stand out.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resume or portfolio link</label>
            <input
              name="resumeUrl"
              value={form.resumeUrl}
              onChange={handleChange}
              placeholder="https://"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-400 mt-2">Link to a resume, portfolio, or LinkedIn profile.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobApplyModal;
