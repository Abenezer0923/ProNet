"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { JobDetail } from '@/components/jobs/JobDetail';
import { JobApplyModal } from '@/components/jobs/JobApplyModal';
import { JobApplicantsDrawer } from '@/components/jobs/JobApplicantsDrawer';
import { ApplyJobPayload, JobApplicationSummary, JobSummary } from '@/types/job';

interface JobDetailPageProps {
  params: { id: string };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<JobSummary | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [recommendations, setRecommendations] = useState<JobSummary[]>([]);
  const [banner, setBanner] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applications, setApplications] = useState<JobApplicationSummary[]>([]);
  const [showApplicantsDrawer, setShowApplicantsDrawer] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadJob = async () => {
    setLoadingJob(true);
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job detail:', error);
      setBanner('We could not load this job. It may have been removed.');
    } finally {
      setLoadingJob(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await api.get('/jobs');
      const jobs: JobSummary[] = response.data;
      setRecommendations(jobs.filter((listing) => listing.id !== id).slice(0, 4));
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadApplications = async () => {
    if (!user || user.profileType !== 'organizational') {
      return;
    }

    try {
      const response = await api.get(`/jobs/${id}/applications`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    }
  };

  useEffect(() => {
    if (user) {
      loadJob();
      loadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  useEffect(() => {
    if (job && user && user.profileType === 'organizational' && job.organizationId === user.id) {
      loadApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, user?.profileType, user?.id]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleApply = async (payload: ApplyJobPayload) => {
    if (!job) return;

    setIsApplying(true);
    try {
      await api.post(`/jobs/${job.id}/apply`, payload);
      setShowApplyModal(false);
      setBanner('Your application was sent to the hiring team.');
      await loadJob();
    } catch (error: any) {
      console.error('Error applying to job:', error);
      const message = error?.response?.data?.message || 'We could not send your application. Please try again.';
      setBanner(message);
    } finally {
      setIsApplying(false);
    }
  };

  const recommendationsList = recommendations.map((listing) => (
    <div key={listing.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition">
      <Link href={`/jobs/${listing.id}`} className="text-base font-semibold text-gray-900 hover:text-primary-700">
        {listing.title}
      </Link>
      <p className="text-sm text-gray-500 mt-1">
        {listing.organizationName || listing.organization?.organizationName || 'Hiring team'}
      </p>
      <p className="text-xs text-gray-400 mt-2">{listing.location || listing.workplaceType}</p>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Link href="/jobs" className="hover:text-primary-600">← Back to jobs</Link>
          {job && <span className="text-gray-300">/</span>}
          {job && <span className="font-medium text-gray-700">{job.title}</span>}
        </div>

        {banner && (
          <div className="rounded-2xl border border-primary-200 bg-primary-50/70 px-4 py-3 text-sm font-medium text-primary-700">
            {banner}
          </div>
        )}

        {loadingJob ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center text-gray-500">
            Loading job details…
          </div>
        ) : job ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <JobDetail
                job={job}
                canApply={user.profileType === 'personal'}
                onApplyClick={() => setShowApplyModal(true)}
                onManageApplications={() => setShowApplicantsDrawer(true)}
                isOwnPosting={job.organizationId === user.id}
              />
            </div>
            <aside className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Similar roles</h3>
                <p className="text-sm text-gray-500 mt-1">Explore more opportunities from ProNet organizations.</p>
                <div className="mt-4 space-y-3">
                  {recommendationsList.length ? recommendationsList : (
                    <p className="text-sm text-gray-400">More recommendations will appear soon.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center text-gray-500">
            This job is no longer available.
          </div>
        )}
      </main>

      <JobApplyModal
        job={job}
        isOpen={showApplyModal}
        isSubmitting={isApplying}
        onClose={() => setShowApplyModal(false)}
        onSubmit={handleApply}
      />

      <JobApplicantsDrawer
        isOpen={showApplicantsDrawer}
        onClose={() => setShowApplicantsDrawer(false)}
        applications={applications}
        jobTitle={job?.title}
      />
    </div>
  );
}
