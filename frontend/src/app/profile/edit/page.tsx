'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    profession: '',
    bio: '',
    location: '',
    website: '',
    profilePicture: '',
    coverPhoto: '',
  });
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('intermediate');
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  // Experience state
  const [experienceList, setExperienceList] = useState<any[]>([]);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expYears, setExpYears] = useState('');
  const [editExpIdx, setEditExpIdx] = useState<number | null>(null);

  // Education state
  const [educationList, setEducationList] = useState<any[]>([]);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [eduDegree, setEduDegree] = useState('');
  const [eduSchool, setEduSchool] = useState('');
  const [eduYears, setEduYears] = useState('');
  const [editEduIdx, setEditEduIdx] = useState<number | null>(null);

  // Experience handlers
  const handleExperienceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editExpIdx !== null) {
      const updated = [...experienceList];
      updated[editExpIdx] = { title: expTitle, company: expCompany, years: expYears };
      setExperienceList(updated);
      setEditExpIdx(null);
    } else {
      setExperienceList([...experienceList, { title: expTitle, company: expCompany, years: expYears }]);
    }
    setExpTitle('');
    setExpCompany('');
    setExpYears('');
    setShowExperienceForm(false);
  };
  const handleEditExperience = (idx: number) => {
    setEditExpIdx(idx);
    setExpTitle(experienceList[idx].title);
    setExpCompany(experienceList[idx].company);
    setExpYears(experienceList[idx].years);
    setShowExperienceForm(true);
  };
  const handleDeleteExperience = (idx: number) => {
    setExperienceList(experienceList.filter((_: any, i: number) => i !== idx));
  };

  // Education handlers
  const handleEducationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editEduIdx !== null) {
      const updated = [...educationList];
      updated[editEduIdx] = { degree: eduDegree, school: eduSchool, years: eduYears };
      setEducationList(updated);
      setEditEduIdx(null);
    } else {
      setEducationList([...educationList, { degree: eduDegree, school: eduSchool, years: eduYears }]);
    }
    setEduDegree('');
    setEduSchool('');
    setEduYears('');
    setShowEducationForm(false);
  };
  const handleEditEducation = (idx: number) => {
    setEditEduIdx(idx);
    setEduDegree(educationList[idx].degree);
    setEduSchool(educationList[idx].school);
    setEduYears(educationList[idx].years);
    setShowEducationForm(true);
  };
  const handleDeleteEducation = (idx: number) => {
    setEducationList(educationList.filter((_: any, i: number) => i !== idx));
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const profile = response.data;
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        profession: profile.profession || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        profilePicture: profile.profilePicture || '',
        coverPhoto: profile.coverPhoto || '',
      });
      setSkills(profile.skills || []);
      setUsername(profile.username || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update profile data
      await api.put('/users/profile', formData);
      
      // Update username if it changed
      if (username && username !== user?.username) {
        if (!usernameAvailable) {
          alert('Please choose an available username');
          setLoading(false);
          return;
        }
        await api.patch('/users/username', { username });
        alert('Profile updated successfully! Redirecting...');
        window.location.href = `/in/${username}`;
      } else {
        alert('Profile updated successfully!');
        // Redirect to username-based profile if available
        if (user?.username) {
          router.push(`/in/${user.username}`);
        } else {
          router.push('/profile');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      const response = await api.post('/users/skills', {
        skillName: newSkill,
        proficiencyLevel,
      });
      setSkills([...skills, response.data]);
      setNewSkill('');
      setProficiencyLevel('intermediate');
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await api.delete(`/users/skills/${skillId}`);
      setSkills(skills.filter((s) => s.id !== skillId));
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  const checkUsernameAvailability = async (newUsername: string) => {
    if (!newUsername || newUsername === user?.username) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }

    // Validate username format
    if (!/^[a-z0-9-]+$/.test(newUsername)) {
      setUsernameError('Username can only contain lowercase letters, numbers, and hyphens');
      setUsernameAvailable(false);
      return;
    }

    if (newUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setUsernameAvailable(false);
      return;
    }

    if (newUsername.length > 30) {
      setUsernameError('Username must be less than 30 characters');
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    setUsernameError('');

    try {
      const response = await api.get(`/users/username/${newUsername}/available`);
      setUsernameAvailable(response.data.available);
      if (!response.data.available) {
        setUsernameError('Username is already taken');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Failed to check username availability');
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setUsername(newUsername);
    
    // Debounce the availability check
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(newUsername);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your data, including posts, connections, and messages. Continue?')) {
      return;
    }

    try {
      await api.delete('/users/account');
      alert('Your account has been deleted successfully.');
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete account');
    }
  };



  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">ProNet</span>
            </Link>
            <Link
              href={user?.username ? `/in/${user.username}` : '/profile'}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>
      </header>

      {/* Edit Form */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profession
              </label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                placeholder="e.g. Software Developer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <ImageUpload
                type="profile"
                label="Profile Picture"
                currentImage={formData.profilePicture}
                onUploadComplete={(url) => setFormData({ ...formData, profilePicture: url })}
              />
            </div>

            <div>
              <ImageUpload
                type="cover"
                label="Cover Photo"
                currentImage={formData.coverPhoto}
                onUploadComplete={(url) => setFormData({ ...formData, coverPhoto: url })}
              />
            </div>
          </div>

          {/* Username Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile URL</h2>
            <p className="text-sm text-gray-600 mb-4">
              Your custom profile URL: <span className="font-mono text-indigo-600">pro-net-ten.vercel.app/in/{username || 'your-username'}</span>
              {username !== user?.username && <span className="text-orange-600 ml-2">(will update when you save)</span>}
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="your-username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                  />
                  {checkingUsername && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                    </div>
                  )}
                  {!checkingUsername && usernameAvailable === true && username !== user?.username && (
                    <div className="absolute right-3 top-3 text-green-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <div className="absolute right-3 top-3 text-red-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              {usernameError && (
                <p className="mt-2 text-sm text-red-600">{usernameError}</p>
              )}
              {usernameAvailable === true && username !== user?.username && (
                <p className="mt-2 text-sm text-green-600">✓ Username is available!</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Username can only contain lowercase letters, numbers, and hyphens (3-30 characters)
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>

            {/* Current Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium flex items-center space-x-2"
                >
                  <span>{skill.skillName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add Skill */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <select
                value={proficiencyLevel}
                onChange={(e) => setProficiencyLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience</h2>
            {experienceList.map((exp: any, idx: number) => (
              <div key={idx} className="mb-2 flex justify-between items-center">
                <span>{exp.title} at {exp.company} ({exp.years})</span>
                <button onClick={() => handleEditExperience(idx)} className="text-primary-600">Edit</button>
                <button onClick={() => handleDeleteExperience(idx)} className="text-red-500 ml-2">Delete</button>
              </div>
            ))}
            {showExperienceForm ? (
              <form onSubmit={handleExperienceSubmit} className="mt-4">
                <input type="text" placeholder="Title" value={expTitle} onChange={e => setExpTitle(e.target.value)} className="border rounded px-2 py-1 mr-2" required />
                <input type="text" placeholder="Company" value={expCompany} onChange={e => setExpCompany(e.target.value)} className="border rounded px-2 py-1 mr-2" required />
                <input type="text" placeholder="Years" value={expYears} onChange={e => setExpYears(e.target.value)} className="border rounded px-2 py-1 mr-2" required />
                <button type="submit" className="bg-primary-600 text-white px-3 py-1 rounded">{editExpIdx !== null ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => setShowExperienceForm(false)} className="ml-2 px-3 py-1 rounded border">Cancel</button>
              </form>
            ) : (
              <button type="button" onClick={() => setShowExperienceForm(true)} className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition mt-4">+ Add Experience</button>
            )}
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
            {educationList.map((edu: any, idx: number) => (
              <div key={idx} className="mb-2 flex justify-between items-center">
                <span>{edu.degree} at {edu.school} ({edu.years})</span>
                <button onClick={() => handleEditEducation(idx)} className="text-primary-600">Edit</button>
                <button onClick={() => handleDeleteEducation(idx)} className="text-red-500 ml-2">Delete</button>
              </div>
            ))}
            {showEducationForm ? (
              <form onSubmit={handleEducationSubmit} className="mt-4">
                <input type="text" placeholder="Degree" value={eduDegree} onChange={e => setEduDegree(e.target.value)} className="border rounded px-2 py-1 mr-2" required />
                <input type="text" placeholder="School" value={eduSchool} onChange={e => setEduSchool(e.target.value)} className="border rounded px-2 py-1 mr-2" required />
                <input type="text" placeholder="Years" value={eduYears} onChange={e => setEduYears(e.target.value)} className="border rounded px-2 py-1 mr-2" required />
                <button type="submit" className="bg-primary-600 text-white px-3 py-1 rounded">{editEduIdx !== null ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => setShowEducationForm(false)} className="ml-2 px-3 py-1 rounded border">Cancel</button>
              </form>
            ) : (
              <button type="button" onClick={() => setShowEducationForm(true)} className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition mt-4">+ Add Education</button>
            )}
          </div>

          {/* Certifications Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add your certifications and licenses (Coming soon - will be fully functional in next update)
            </p>
            <button
              type="button"
              className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition"
            >
              + Add Certification
            </button>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link
              href={user?.username ? `/in/${user.username}` : '/profile'}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Danger Zone - Outside the form */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-200 mt-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Delete Account
          </button>
        </div>
      </main>
    </div>
  );
}
