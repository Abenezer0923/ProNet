'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is ProNet?",
      answer: "ProNet is a professional networking platform designed to connect industry professionals, facilitate knowledge sharing, and foster career growth through specialized communities."
    },
    {
      question: "How do I join a community?",
      answer: "After signing up, you can browse available communities based on your profession or interests. Simply click 'Join' on any community that matches your professional goals."
    },
    {
      question: "Is ProNet free to use?",
      answer: "Yes, ProNet offers a free tier with access to core features including community participation, messaging, and profile creation. Premium features may be available in the future."
    },
    {
      question: "How do I connect with other professionals?",
      answer: "You can send connection requests to other members, join communities, participate in discussions, and engage with posts to expand your professional network."
    },
    {
      question: "Can I message other members?",
      answer: "Yes, once you're connected with another member, you can send direct messages and have real-time conversations through our chat feature."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-semibold text-blue-600">ProNet</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 hidden md:block">Articles</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 hidden md:block">People</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 hidden md:block">Learning</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 hidden md:block">Jobs</a>
              <div className="flex items-center space-x-3">
                <a href="/login" className="px-6 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-full transition">
                  Sign in
                </a>
                <a href="/register" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition">
                  Join now
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
                Build connections that matter for your career
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Join a thriving network of professionals, collaborate on meaningful projects, and unlock new opportunities together.
              </p>
              
              {/* Google Sign Up Button */}
              <div className="space-y-4 max-w-md">
                <button 
                  onClick={() => {
                    // OAuth goes directly to user service, not through API gateway
                    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';
                    window.location.href = `${authUrl}/auth/google`;
                  }}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-3.5 bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50 transition shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-semibold text-gray-700">Continue with Google</span>
                </button>
                
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-sm text-gray-500">or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <a 
                  href="/register"
                  className="block w-full text-center px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition"
                >
                  Sign up with email
                </a>
                
                <p className="text-sm text-gray-600">
                  Already on ProNet? <a href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</a>
                </p>
              </div>
            </div>
            
            <div className="hidden md:block">
              <img 
                src="/Web_Devlopment_Illustration_01.jpg" 
                alt="Professional networking" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              Discover what makes ProNet different
            </h2>
            <p className="text-xl text-gray-600">
              A platform designed to empower professionals with the tools and connections they need to succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg hover:shadow-lg transition">
                <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect with professionals</h3>
                <p className="text-gray-600 mb-4">
                  Build meaningful relationships with industry peers and expand your professional network globally.
                </p>
                <span className="text-blue-600 font-semibold group-hover:underline">Learn more →</span>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-lg hover:shadow-lg transition">
                <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Learn new skills</h3>
                <p className="text-gray-600 mb-4">
                  Access expert insights, industry trends, and professional development resources to advance your career.
                </p>
                <span className="text-purple-600 font-semibold group-hover:underline">Explore learning →</span>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg hover:shadow-lg transition">
                <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Find opportunities</h3>
                <p className="text-gray-600 mb-4">
                  Discover job openings, projects, and collaborations that align with your professional goals.
                </p>
                <span className="text-green-600 font-semibold group-hover:underline">Browse jobs →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Communities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="/web design_#4.jpg" 
                alt="Join communities" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
                Join industry-specific communities
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Connect with like-minded professionals in specialized groups. Share knowledge, ask questions, and collaborate on projects within your field.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Access exclusive content and discussions</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Network with industry leaders and experts</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Stay updated with the latest industry trends</span>
                </li>
              </ul>
              <a href="/register" className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition">
                Get started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about ProNet
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === index ? 'transform rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            Your next career breakthrough starts here
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Be part of a dynamic community where professionals connect, collaborate, and grow together
          </p>
          <a href="/register" className="inline-block px-10 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition text-lg">
            Join ProNet today
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Advertising</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Safety Center</a></li>
                <li><a href="#" className="hover:text-white transition">Community Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">© 2024 ProNet Corporation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
