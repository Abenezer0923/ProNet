"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { JobList } from '@/components/jobs/JobList';
import { JobDetail } from '@/components/jobs/JobDetail';
import { JobCreateModal } from '@/components/jobs/JobCreateModal';
import { JobApplyModal } from '@/components/jobs/JobApplyModal';
import { JobApplicantsDrawer } from '@/components/jobs/JobApplicantsDrawer';
import { ApplyJobPayload, CreateJobPayload, JobApplicationSummary, JobSummary } from '@/types/job';
import { SparklesIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface BannerState {
  type: 'success' | 'error';
  message: string;
}

export default function JobsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobSummary | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyTarget, setApplyTarget] = useState<JobSummary | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicantsDrawer, setShowApplicantsDrawer] = useState(false);
  const [applications, setApplications] = useState<JobApplicationSummary[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [myJobs, setMyJobs] = useState<JobSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [workplaceFilter, setWorkplaceFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [banner, setBanner] = useState<BannerState | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await api.get('/jobs');
      const jobList: JobSummary[] = response.data;
      setJobs(jobList);
      if (jobList.length > 0) {
        setSelectedJob((prev) =>
          prev && jobList.some((job) => job.id === prev.id) ? prev : jobList[0],
        );
      } else {
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setBanner({ type: 'error', message: 'Unable to load jobs right now. Please try again later.' });
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadMyJobs = async () => {
    if (!user || user.profileType !== 'organizational') {
      return;
    }

    try {
      const response = await api.get('/jobs/mine');
      setMyJobs(response.data);
    } catch (error) {
      console.error('Error loading organization jobs:', error);
    }
  };

  const loadApplications = async (jobId: string) => {
    if (!user || user.profileType !== 'organizational') {
      return;
    }

    setLoadingApplicants(true);
    try {
      const response = await api.get(`/jobs/${jobId}/applications`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error loading job applications:', error);
      setApplications([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadJobs();
      loadMyJobs();
    }
  }, [user]);

  useEffect(() => {
    if (
      user &&
      user.profileType === 'organizational' &&
      selectedJob &&
      selectedJob.organizationId === user.id
    ) {
      loadApplications(selectedJob.id);
    } else {
      setApplications([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJob?.id, user?.id, user?.profileType]);

  const filteredJobs = useMemo(() => {
    let results = jobs;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter((job) =>
        job.title.toLowerCase().includes(term) ||
        (job.organizationName || '').toLowerCase().includes(term) ||
        (job.location || '').toLowerCase().includes(term),
      );
    }

    if (workplaceFilter) {
      results = results.filter((job) => job.workplaceType === workplaceFilter);
    }

    if (typeFilter) {
      results = results.filter((job) => job.employmentType === typeFilter);
    }

    return results;
  }, [jobs, searchTerm, workplaceFilter, typeFilter]);

  useEffect(() => {
    if (!filteredJobs.length) {
      setSelectedJob(null);
      return;
    }
    if (!selectedJob || !filteredJobs.some((job) => job.id === selectedJob.id)) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleCreateJob = async (payload: CreateJobPayload) => {
    setIsCreating(true);
    try {
      await api.post('/jobs', payload);
      setShowCreateModal(false);
      setBanner({ type: 'success', message: 'Job published successfully – followers have been notified.' });
      await Promise.all([loadJobs(), loadMyJobs()]);
    } catch (error: any) {
      console.error('Error creating job:', error);
      const message = error?.response?.data?.message || 'Could not publish job. Please try again.';
      setBanner({ type: 'error', message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleApply = async (payload: ApplyJobPayload) => {
    if (!applyTarget) return;

    setIsApplying(true);
    try {
      await api.post(`/jobs/${applyTarget.id}/apply`, payload);
      setShowApplyModal(false);
      setBanner({ type: 'success', message: 'Your application was sent to the hiring team.' });
      await loadJobs();
    } catch (error: any) {
      console.error('Error applying to job:', error);
      const message = error?.response?.data?.message || 'Could not submit application. Please try again.';
      setBanner({ type: 'error', message });
    } finally {
      setIsApplying(false);
    }
  };

  const openApplyModal = (job: JobSummary) => {
    setApplyTarget(job);
    setShowApplyModal(true);
  };

  const openApplicants = () => {
    if (selectedJob && selectedJob.organizationId === user.id) {
      setShowApplicantsDrawer(true);
    }
  };

  const summaryCards = (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary-100 p-2 text-primary-700">
            <SparklesIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Smart matches</h3>
            <p className="text-sm text-gray-500 mt-1">
              We surface roles based on the communities and connections you follow.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter(null);
              setWorkplaceFilter(null);
            }}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Search</label>
            <div className="mt-1 relative">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Role, company, or location"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <FunnelIcon className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Workplace</label>
            <div className="mt-2 space-y-2">
              {[
                { value: null, label: 'All workplaces' },
                { value: 'onsite', label: 'On-site' },
                { value: 'remote', label: 'Remote' },
                { value: 'hybrid', label: 'Hybrid' },
              ].map((option) => (
                <label key={option.label} className={`flex items-center gap-2 text-sm font-medium ${option.value === workplaceFilter ? 'text-primary-600' : 'text-gray-600'}`}>
                  <input
                    type="radio"
                    className="text-primary-600 focus:ring-primary-500"
                    checked={option.value === workplaceFilter}
                    onChange={() => setWorkplaceFilter(option.value as string | null)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Job type</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { value: null, label: 'All' },
                { value: 'full_time', label: 'Full-time' },
                { value: 'part_time', label: 'Part-time' },
                { value: 'contract', label: 'Contract' },
                { value: 'internship', label: 'Internship' },
                { value: 'freelance', label: 'Freelance' },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => setTypeFilter(option.value as string | null)}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold transition ${
                    option.value === typeFilter
                      ? 'border-primary-300 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-primary-200'
                  }`}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {user.profileType === 'organizational' && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-primary-600" />
            Your postings
          </div>
          <div className="text-3xl font-bold text-gray-900">{myJobs.length}</div>
          <p className="text-sm text-gray-500">
            Active openings visible to the network. Keep them fresh to attract more applicants.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discover jobs</h1>
            <p className="text-sm text-gray-500 mt-2">Curated roles from organizations you follow and the wider ProNet community.</p>
          </div>
          {user.profileType === 'organizational' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition"
            >
              <SparklesIcon className="h-5 w-5" />
              Post a job
            </button>
          )}
        </div>

        {banner && (
          <div
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm font-medium ${
              banner.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {banner.message}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <aside className="hidden xl:block xl:col-span-3 space-y-6">{summaryCards}</aside>

          <section className="xl:col-span-5">
            <JobList
              jobs={filteredJobs}
              selectedJobId={selectedJob?.id || null}
              onSelect={(job) => setSelectedJob(job)}
              loading={loadingJobs}
              emptyMessage={jobs.length ? 'No jobs match your filters yet.' : undefined}
            />
          </section>

          <section className="xl:col-span-4">
            <JobDetail
              job={selectedJob}
              canApply={user.profileType === 'personal'}
              onApplyClick={openApplyModal}
              onManageApplications={openApplicants}
              isOwnPosting={selectedJob ? selectedJob.organizationId === user.id : false}
            />
            {selectedJob && loadingApplicants && selectedJob.organizationId === user.id && (
              <div className="mt-4 text-sm text-gray-500">Loading applicants…</div>
            )}
          </section>
        </div>
      </main>

      <JobCreateModal
        isOpen={showCreateModal}
        isSubmitting={isCreating}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateJob}
      />

      <JobApplyModal
        job={applyTarget}
        isOpen={showApplyModal}
        isSubmitting={isApplying}
        onClose={() => setShowApplyModal(false)}
        onSubmit={handleApply}
      />

      <JobApplicantsDrawer
        isOpen={showApplicantsDrawer}
        onClose={() => setShowApplicantsDrawer(false)}
        applications={applications}
        jobTitle={selectedJob?.title}
      />
    </div>
  );
}
