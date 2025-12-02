'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { HeroIllustration } from '@/components/HeroIllustration';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed');
    }
  }, [user, loading, router]);

  const faqs = [
    {
      question: "What makes ProNet different?",
      answer: "ProNet focuses on meaningful professional connections through specialized communities, rather than just a feed of updates. We prioritize quality interactions and knowledge sharing."
    },
    {
      question: "Is it free to join?",
      answer: "Yes, getting started is completely free. You can create a profile, join communities, and connect with other professionals at no cost."
    },
    {
      question: "How do communities work?",
      answer: "Communities are focused groups based on industries, interests, or goals. You can join discussions, share articles, and network with peers in your specific field."
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-stone-600 hover:text-primary-800 transition-smooth">Features</a>
              <a href="#communities" className="text-sm font-medium text-stone-600 hover:text-primary-800 transition-smooth">Communities</a>
              <a href="#about" className="text-sm font-medium text-stone-600 hover:text-primary-800 transition-smooth">About</a>
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
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-800 text-xs font-semibold uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
                New: Article Publishing
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.1]">
                Connect. <br />
                Collaborate. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-800 to-amber-600">
                  Grow Together.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-600 max-w-lg leading-relaxed">
                The professional network designed for meaningful interactions. Join specialized communities, share your expertise, and accelerate your career.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="inline-flex justify-center items-center px-8 py-4 text-base font-bold text-white bg-primary-800 rounded-xl hover:bg-primary-900 transition-smooth shadow-lg hover:shadow-primary-900/20 hover:-translate-y-0.5">
                  Join for Free
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a href="#features" className="inline-flex justify-center items-center px-8 py-4 text-base font-bold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-smooth">
                  Learn More
                </a>
              </div>
              <div className="pt-8 flex items-center gap-4 text-sm text-stone-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p>Trusted by 10,000+ professionals</p>
              </div>
            </div>
            <div className="relative lg:h-[600px] w-full flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-100/50 to-amber-100/50 rounded-full blur-3xl opacity-60 transform translate-x-10"></div>
              <div className="relative z-10 w-full max-w-lg">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Everything you need to excel</h2>
            <p className="text-lg text-stone-600">We provide the tools to help you build your network, showcase your work, and find new opportunities.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Specialized Communities",
                desc: "Join groups tailored to your industry and interests. Connect with peers who understand your challenges.",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                color: "bg-primary-700"
              },
              {
                title: "Knowledge Sharing",
                desc: "Publish articles, share insights, and establish yourself as a thought leader in your domain.",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                ),
                color: "bg-amber-600"
              },
              {
                title: "Global Connections",
                desc: "Expand your network beyond borders. Connect with professionals from top companies worldwide.",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: "bg-primary-600"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 bg-stone-50 rounded-2xl border border-stone-100 hover:border-primary-200 hover:bg-white hover:shadow-xl transition-smooth">
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{feature.title}</h3>
                <p className="text-stone-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Members", value: "10k+" },
              { label: "Communities", value: "500+" },
              { label: "Countries", value: "120+" },
              { label: "Articles Published", value: "50k+" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-amber-300">{stat.value}</div>
                <div className="text-primary-200 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-stone-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-stone-50 transition-colors"
                >
                  <span className="font-semibold text-stone-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-stone-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-stone-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
              Ready to accelerate your career?
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of professionals who are already building the future of work on ProNet.
            </p>
            <div className="relative z-10">
              <Link href="/register" className="inline-flex items-center px-8 py-4 bg-white text-primary-900 font-bold rounded-xl hover:bg-primary-50 transition-smooth shadow-lg">
                Get Started Now
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
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Communities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
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
