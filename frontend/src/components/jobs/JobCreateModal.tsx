import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CreateJobPayload } from '@/types/job';

const employmentOptions = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
];

const workplaceOptions = [
  { value: 'onsite', label: 'On-site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

interface JobCreateModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateJobPayload) => Promise<void>;
}

function normalizeList(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function JobCreateModal({ isOpen, isSubmitting, onClose, onSubmit }: JobCreateModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    employmentType: 'full_time',
    workplaceType: 'onsite',
    location: '',
    experienceLevel: '',
    seniority: '',
    salaryCurrency: '',
    salaryMin: '',
    salaryMax: '',
    contactEmail: '',
    applicationUrl: '',
    applicationDeadline: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm({
        title: '',
        description: '',
        employmentType: 'full_time',
        workplaceType: 'onsite',
        location: '',
        experienceLevel: '',
        seniority: '',
        salaryCurrency: '',
        salaryMin: '',
        salaryMax: '',
        contactEmail: '',
        applicationUrl: '',
        applicationDeadline: '',
        responsibilities: '',
        requirements: '',
        benefits: '',
      });
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError('Please provide a job title.');
      return;
    }

    if (!form.description.trim()) {
      setError('Please add a description for the role.');
      return;
    }

    const payload: CreateJobPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      employmentType: form.employmentType,
      workplaceType: form.workplaceType,
      location: form.location.trim() || undefined,
      experienceLevel: form.experienceLevel.trim() || undefined,
      seniority: form.seniority.trim() || undefined,
      salaryCurrency: form.salaryCurrency.trim() || undefined,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      applicationUrl: form.applicationUrl.trim() || undefined,
      applicationDeadline: form.applicationDeadline || undefined,
      responsibilities: normalizeList(form.responsibilities),
      requirements: normalizeList(form.requirements),
      benefits: normalizeList(form.benefits),
    };

    if (
      payload.salaryMin !== undefined &&
      payload.salaryMax !== undefined &&
      payload.salaryMax < payload.salaryMin
    ) {
      setError('Maximum salary should be greater than minimum salary.');
      return;
    }

    try {
      await onSubmit(payload);
    } catch (submitError: any) {
      setError(submitError?.message || 'Unable to create job right now.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-primary-50/40">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Create a new job</h2>
            <p className="text-sm text-gray-500 mt-1">Share opportunities with your network and attract top talent.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job title *</label>
              <input
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Senior Product Designer"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment type *</label>
              <select
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {employmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workplace preference *</label>
              <select
                name="workplaceType"
                value={form.workplaceType}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {workplaceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City, Country or Remote"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience level</label>
              <input
                name="experienceLevel"
                value={form.experienceLevel}
                onChange={handleChange}
                placeholder="e.g. 5+ years, Mid-level"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seniority</label>
              <input
                name="seniority"
                value={form.seniority}
                onChange={handleChange}
                placeholder="e.g. Lead, Senior, Manager"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary currency</label>
              <input
                name="salaryCurrency"
                value={form.salaryCurrency}
                onChange={handleChange}
                placeholder="e.g. USD"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary min</label>
                <input
                  type="number"
                  min={0}
                  name="salaryMin"
                  value={form.salaryMin}
                  onChange={handleChange}
                  placeholder="e.g. 60000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary max</label>
                <input
                  type="number"
                  min={0}
                  name="salaryMax"
                  value={form.salaryMax}
                  onChange={handleChange}
                  placeholder="e.g. 80000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact email</label>
              <input
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="Where should applications go?"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">External application link</label>
              <input
                name="applicationUrl"
                value={form.applicationUrl}
                onChange={handleChange}
                placeholder="https://company.com/careers"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application deadline</label>
              <input
                type="date"
                name="applicationDeadline"
                value={form.applicationDeadline}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role description *</label>
              <textarea
                name="description"
                required
                minLength={20}
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Paint a compelling picture of the role, responsibilities, and impact."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
                <p className="text-xs text-gray-400">One item per line will become a bullet point.</p>
              </div>
              <textarea
                name="responsibilities"
                value={form.responsibilities}
                onChange={handleChange}
                rows={6}
                placeholder={`Define product roadmaps\nPartner with cross-functional teams\nMeasure outcomes and iterate`}
                className="md:col-span-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <p className="text-xs text-gray-400">Highlight must-have skills and experience.</p>
              </div>
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={6}
                placeholder={`5+ years in product design\nProficiency in Figma\nExperience launching B2B products`}
                className="md:col-span-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                <p className="text-xs text-gray-400">Optional: share perks that stand out.</p>
              </div>
              <textarea
                name="benefits"
                value={form.benefits}
                onChange={handleChange}
                rows={6}
                placeholder={`Equity and performance bonuses\nRemote-friendly culture\nWellness stipend`}
                className="md:col-span-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
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
              {isSubmitting ? 'Publishing…' : 'Publish job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobCreateModal;
