'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type TabType = 'about' | 'experience' | 'education' | 'skills' | 'communities';

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfileByUsername();
    }
  }, [username, currentUser]);

  const fetchProfileByUsername = async () => {
    try {
      const response = await api.get(`/users/in/${username}`);
      setProfile(response.data);
      
      if (currentUser) {
        const isOwn = response.data.id === currentUser.id || 
                      response.data.username === currentUser.username;
        setIsOwnProfile(isOwn);
        
        if (!isOwn) {
          checkFollowStatus(response.data.id);
        }
      }
      
      try {
        const statsResponse = await api.get(`/users/connections/stats/${response.data.id}`);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/404');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (userId: string) => {
    try {
      const response = await api.get(`/users/connections/is-following/${userId}`);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${profile.id}`);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await api.post(`/users/follow/${profile.id}`);
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  if (!profile) return null;

  const tabs = [
    { id: 'about', label: 'About', icon: '📝' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '🎯' },
    { id: 'communities', label: 'Communities', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="relative">
        <div 
          className="h-96 bg-gradient-to-r from-primary-700 via-primary-600 to-amber-600"
          style={{
            backgroundImage: profile.coverPhoto ? `url(${profile.coverPhoto})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Profile Header Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-32">
            {/* Profile Photo */}
            <div className="flex items-end space-x-5">
              <div className="relative">
                <img
                  src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&size=200&background=5e372b&color=fff`}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover"
                />
              </div>
              
              {/* Name and Title */}
              <div className="flex-1 pb-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </h1>
                      {profile.profession && (
                        <p className="text-lg text-gray-600 mt-1">{profile.profession}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        {profile.location && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {profile.location}
                          </span>
                        )}
                        {profile.website && (
                          <a 
                            href={profile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary-700 hover:text-primary-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            {profile.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-4 text-sm">
                        <Link href="#" className="text-gray-700 hover:text-primary-800 font-medium">
                          <span className="font-semibold text-gray-900">{stats.followers}</span> followers
                        </Link>
                        <Link href="#" className="text-gray-700 hover:text-primary-800 font-medium">
                          <span className="font-semibold text-gray-900">{stats.following}</span> following
                        </Link>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      {currentUser && !isOwnProfile ? (
                        <>
                          <button
                            onClick={handleFollow}
                            className={`px-6 py-2 rounded-full font-semibold transition ${
                              isFollowing
                                ? 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                                : 'bg-primary-700 text-white hover:bg-primary-800'
                            }`}
                          >
                            {isFollowing ? 'Following' : 'Follow'}
                          </button>
                          <Link
                            href={`/chat?user=${profile.id}`}
                            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 font-semibold transition"
                          >
                            Message
                          </Link>
                        </>
                      ) : (
                        <Link
                          href="/login"
                          className="px-6 py-2 bg-primary-700 text-white rounded-full hover:bg-primary-800 font-semibold transition"
                        >
                          Follow
                        </Link>
                      )}
                      <button className="p-2 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition
                  ${activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'about' && <AboutTab profile={profile} />}
        {activeTab === 'experience' && <ExperienceTab experiences={profile.experiences || []} />}
        {activeTab === 'education' && <EducationTab educations={profile.educations || []} />}
        {activeTab === 'skills' && <SkillsTab skills={profile.skills || []} />}
        {activeTab === 'communities' && <CommunitiesTab userId={profile.id} />}
      </div>
    </div>
  );
}

// About Tab Component
function AboutTab({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      {/* Bio Section */}
      {profile.bio && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
        <div className="space-y-3">
          {profile.email && profile.showEmail && (
            <div className="flex items-center gap-3 text-gray-700">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{profile.email}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                {profile.website}
              </a>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-3 text-gray-700">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Profile views</p>
            <p className="text-2xl font-bold text-gray-900">{profile.profileViews || 0}</p>
            <p className="text-xs text-gray-400">last 90 days</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Member since</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Experience Tab Component
function ExperienceTab({ experiences }: { experiences: any[] }) {
  if (!experiences || experiences.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0h5l-1 12a2 2 0 01-2 2H6a2 2 0 01-2-2L3 6h5m8 0H8" />
        </svg>
        <p className="text-gray-500">No experience added yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
      {experiences.map((exp) => (
        <div key={exp.id} className="p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0h5l-1 12a2 2 0 01-2 2H6a2 2 0 01-2-2L3 6h5m8 0H8" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
              <p className="text-gray-600">{exp.company} · {exp.employmentType || 'Full-time'}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                {exp.currentlyWorking ? ' Present' : ' ' + new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
              {exp.location && (
                <p className="text-sm text-gray-500">{exp.location}</p>
              )}
              {exp.description && (
                <p className="text-gray-700 mt-3">{exp.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Education Tab Component
function EducationTab({ educations }: { educations: any[] }) {
  if (!educations || educations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
        <p className="text-gray-500">No education added yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
      {educations.map((edu) => (
        <div key={edu.id} className="p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{edu.school}</h3>
              <p className="text-gray-600">
                {edu.degree}
                {edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                {edu.currentlyStudying ? ' Present' : ' ' + new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
              {edu.grade && (
                <p className="text-sm text-gray-500">Grade: {edu.grade}</p>
              )}
              {edu.activities && (
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-medium">Activities:</span> {edu.activities}
                </p>
              )}
              {edu.description && (
                <p className="text-gray-700 mt-3">{edu.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skills Tab Component
function SkillsTab({ skills }: { skills: any[] }) {
  if (!skills || skills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <p className="text-gray-500">No skills added yet</p>
      </div>
    );
  }

  const getProficiencyStars = (level: string) => {
    const levels = { beginner: 1, intermediate: 2, expert: 3 };
    return levels[level.toLowerCase() as keyof typeof levels] || 2;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Skills & Endorsements</h2>
      <div className="grid gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{skill.skillName}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < getProficiencyStars(skill.proficiencyLevel) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 capitalize">{skill.proficiencyLevel}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Communities Tab Component
function CommunitiesTab({ userId }: { userId: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p className="text-gray-500">Communities feature coming soon</p>
    </div>
  );
}
