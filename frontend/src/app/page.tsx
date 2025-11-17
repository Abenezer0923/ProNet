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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ProNet</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 hidden md:block font-medium transition">Features</a>
              <a href="#communities" className="text-gray-700 hover:text-indigo-600 hidden md:block font-medium transition">Communities</a>
              <a href="#faq" className="text-gray-700 hover:text-indigo-600 hidden md:block font-medium transition">FAQ</a>
              <div className="flex items-center space-x-3">
                <a href="/login" className="px-5 py-2.5 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-xl transition">
                  Sign in
                </a>
                <a href="/register" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition">
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                  🚀 Join 10,000+ Professionals
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Build connections that
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> matter</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Join a thriving network of professionals, collaborate on meaningful projects, and unlock new opportunities together.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';
                    window.location.href = `${authUrl}/auth/google`;
                  }}
                  className="group flex items-center justify-center space-x-3 px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="font-semibold text-gray-700 group-hover:text-gray-900">Continue with Google</span>
                </button>

                <a
                  href="/register"
                  className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Get Started Free
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>

              <p className="text-sm text-gray-500">
                Already have an account? <a href="/login" className="text-indigo-600 font-semibold hover:underline">Sign in →</a>
              </p>
            </div>

            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl transform rotate-3 opacity-10"></div>
              <img
                src="/Web_Devlopment_Illustration_01.jpg"
                alt="Professional networking"
                className="relative w-full h-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Everything you need to <span className="text-indigo-600">succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A platform designed to empower professionals with the tools and connections they need to thrive.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white border-2 border-gray-100 p-8 rounded-3xl hover:border-indigo-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect Globally</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Build meaningful relationships with industry peers and expand your professional network across the globe.
                </p>
                <a href="#" className="inline-flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                  Learn more
                  <svg className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white border-2 border-gray-100 p-8 rounded-3xl hover:border-purple-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Grow Your Skills</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Access expert insights, industry trends, and professional development resources to advance your career.
                </p>
                <a href="#" className="inline-flex items-center text-purple-600 font-semibold group-hover:gap-2 transition-all">
                  Explore learning
                  <svg className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white border-2 border-gray-100 p-8 rounded-3xl hover:border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Opportunities</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Discover job openings, projects, and collaborations that align with your professional goals.
                </p>
                <a href="#" className="inline-flex items-center text-green-600 font-semibold group-hover:gap-2 transition-all">
                  Browse jobs
                  <svg className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Communities Section */}
      <section id="communities" className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl transform -rotate-6 opacity-20"></div>
              <img
                src="/web design_#4.jpg"
                alt="Join communities"
                className="relative w-full h-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 transform hover:scale-110 transition-transform">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">500+ Communities</p>
                    <p className="text-xs text-gray-500">Active & Growing</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Communities</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
                Join your <span className="text-indigo-600">tribe</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with like-minded professionals in specialized groups. Share knowledge, ask questions, and collaborate on projects within your field.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-start group">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Exclusive Content</h4>
                    <p className="text-gray-600">Access premium discussions and industry insights</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Expert Network</h4>
                    <p className="text-gray-600">Connect with industry leaders and mentors</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Stay Updated</h4>
                    <p className="text-gray-600">Get the latest trends and opportunities</p>
                  </div>
                </div>
              </div>

              <a href="/register" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                Explore Communities
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Got questions? We've got <span className="text-indigo-600">answers</span>
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about ProNet
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="group border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-indigo-200 transition-all duration-300">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-indigo-50/50 transition-colors"
                >
                  <span className="font-bold text-gray-900 text-lg pr-8">{faq.question}</span>
                  <div className={`w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${openFaq === index ? 'bg-indigo-600 rotate-180' : 'group-hover:bg-indigo-200'}`}>
                    <svg
                      className={`w-5 h-5 transition-colors ${openFaq === index ? 'text-white' : 'text-indigo-600'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-8 py-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-t-2 border-indigo-100">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a href="#" className="inline-flex items-center text-indigo-600 font-semibold hover:gap-2 transition-all">
              Contact our support team
              <svg className="w-4 h-4 ml-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnpNNiAzNGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold">
              ✨ Limited Time Offer
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-wh mb-6 leading-tight">
            Your next career breakthrough<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">starts here</span>
          </h2>

          <p className="text-xl md:text-2xl text-indigo-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Be part of a dynamic community where professionals connect, collaborate, and grow together
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/register" className="group px-10 py-5 bg-white text-indigo-600 font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg">
              Join ProNet Free
              <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>

            <a href="#features" className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300 text-lg">
              Learn More
            </a>
          </div>

          <p className="mt-8 text-indigo-200 text-sm">
            🎉 Join 10,000+ professionals already on ProNet • No credit card required
          </p>
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
            <p className="text-sm">© 2025 ProNet Corporation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
