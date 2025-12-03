'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/articles" className="text-sm font-medium text-stone-600 hover:text-primary-800 transition-smooth">Articles</Link>
              <Link href="/communities" className="text-sm font-medium text-stone-600 hover:text-primary-800 transition-smooth">Communities</Link>
              <Link href="/about" className="text-sm font-medium text-primary-800 transition-smooth">About</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-stone-700 hover:text-primary-900 px-4 py-2 rounded-lg hover:bg-primary-50 transition-smooth">
              Sign in
            </Link>
            <Link href="/register" className="text-sm font-semibold text-white bg-primary-800 px-5 py-2.5 rounded-lg hover:bg-primary-900 transition-smooth shadow-md hover:shadow-lg">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About ProNet</h1>
          <p className="text-xl text-primary-100 leading-relaxed">
            The professional network designed for meaningful connections and career growth
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-stone-900 mb-6">Our Mission</h2>
            <p className="text-lg text-stone-600 leading-relaxed mb-8">
              ProNet is built on the belief that professional networking should be about quality, not quantity. 
              We're creating a platform where professionals can form genuine connections, share knowledge, 
              and grow together in specialized communities that matter to them.
            </p>

            <h2 className="text-3xl font-bold text-stone-900 mb-6 mt-12">What Makes ProNet Different</h2>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                <div className="w-12 h-12 bg-primary-700 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Community-Focused</h3>
                <p className="text-stone-600">
                  Join specialized communities based on your industry, interests, and career goals. 
                  Connect with peers who truly understand your challenges and aspirations.
                </p>
              </div>

              <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Knowledge Sharing</h3>
                <p className="text-stone-600">
                  Publish articles, share insights, and establish yourself as a thought leader. 
                  Our platform makes it easy to showcase your expertise and learn from others.
                </p>
              </div>

              <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Real-Time Collaboration</h3>
                <p className="text-stone-600">
                  Connect instantly with messaging, participate in community discussions, 
                  and collaborate on projects with professionals around the world.
                </p>
              </div>

              <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                <div className="w-12 h-12 bg-primary-700 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Privacy & Security</h3>
                <p className="text-stone-600">
                  Your data is yours. We prioritize privacy and security, giving you full control 
                  over your profile visibility and connection preferences.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-stone-900 mb-6 mt-12">Our Vision</h2>
            <p className="text-lg text-stone-600 leading-relaxed mb-8">
              We envision a world where professional networking transcends superficial connections. 
              ProNet is building a platform where every interaction has the potential to spark collaboration, 
              drive innovation, and accelerate careers. We believe in the power of communities to bring 
              together like-minded professionals who can learn from each other, support one another, 
              and achieve more together than they ever could alone.
            </p>

            <h2 className="text-3xl font-bold text-stone-900 mb-6 mt-12">Key Features</h2>
            <ul className="space-y-4 text-lg text-stone-600 mb-8">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-primary-700 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Professional Profiles:</strong> Showcase your experience, education, skills, and achievements</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-primary-700 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Specialized Communities:</strong> Join or create communities around industries, technologies, and interests</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-primary-700 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Article Publishing:</strong> Write and share long-form content to establish thought leadership</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-primary-700 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Real-Time Messaging:</strong> Connect instantly with your network through direct messages</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-primary-700 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Smart Feed:</strong> Discover relevant content and connections based on your interests</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-primary-700 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Advanced Search:</strong> Find professionals, communities, and content that matter to you</span>
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-stone-900 mb-6 mt-12">Join Our Growing Community</h2>
            <p className="text-lg text-stone-600 leading-relaxed mb-8">
              ProNet is trusted by over 10,000 professionals across 120+ countries. Whether you're 
              looking to expand your network, find new opportunities, or share your expertise, 
              ProNet provides the tools and community to help you succeed.
            </p>

            <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-2xl p-8 text-center mt-12">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to get started?</h3>
              <p className="text-primary-100 mb-6">
                Join thousands of professionals building the future of work
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center px-8 py-4 bg-white text-primary-900 font-bold rounded-xl hover:bg-primary-50 transition-smooth shadow-lg"
              >
                Create Your Free Account
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Logo className="mb-6" size="md" />
              <p className="text-sm">
                Empowering professionals to connect, grow, and succeed together.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/articles" className="hover:text-white transition-colors">Articles</Link></li>
                <li><Link href="/communities" className="hover:text-white transition-colors">Communities</Link></li>
                <li><Link href="/discover" className="hover:text-white transition-colors">Discover</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-800 text-center text-sm">
            &copy; {new Date().getFullYear()} ProNet Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
