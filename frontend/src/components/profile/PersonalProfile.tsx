import Link from 'next/link';

interface PersonalProfileProps {
    profile: any;
    isOwnProfile?: boolean;
}

export const PersonalProfile = ({ profile, isOwnProfile = false }: PersonalProfileProps) => {
    return (
        <div className="space-y-6">
            {/* Experience Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Experience</h2>
                    {isOwnProfile && (
                        <Link href="/profile/edit" className="text-gray-400 hover:text-indigo-600 transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </Link>
                    )}
                </div>

                {/* Placeholder Experience Item */}
                {profile.experiences && profile.experiences.length > 0 ? (
                    <div className="relative pl-8 border-l-2 border-gray-100 space-y-8">
                        {profile.experiences.map((exp: any) => (
                            <div key={exp.id} className="relative">
                                <div className="absolute -left-[41px] bg-white p-1">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                                    <p className="text-gray-600 font-medium">{exp.company}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                                    </p>
                                    {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                                    {exp.description && (
                                        <p className="mt-3 text-gray-600 leading-relaxed">
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No experience added yet.</p>
                    </div>
                )}
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Education</h2>
                    {isOwnProfile && (
                        <Link href="/profile/edit" className="text-gray-400 hover:text-indigo-600 transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </Link>
                    )}
                </div>

                {profile.educations && profile.educations.length > 0 ? (
                    <div className="space-y-6">
                        {profile.educations.map((edu: any) => (
                            <div key={edu.id} className="flex gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{edu.school}</h3>
                                    <p className="text-gray-600">{edu.degree}, {edu.fieldOfStudy}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No education added yet.</p>
                    </div>
                )}
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Skills</h2>
                    {isOwnProfile && (
                        <Link href="/profile/edit" className="text-gray-400 hover:text-indigo-600 transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </Link>
                    )}
                </div>

                {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill: any) => (
                            <div key={skill.id} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-medium border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition cursor-default">
                                {skill.skillName}
                                {skill.proficiencyLevel && (
                                    <span className="ml-2 text-xs text-gray-500 border-l border-gray-300 pl-2">
                                        {skill.proficiencyLevel}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 mb-2">No skills added yet</p>
                        {isOwnProfile && (
                            <Link href="/profile/edit" className="text-indigo-600 font-medium hover:underline">
                                Add skills to showcase your expertise
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
