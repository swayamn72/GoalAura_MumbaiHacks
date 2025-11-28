import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, Sparkles, Users, TrendingUp, Shield, Zap,
  ArrowRight, Heart, Brain, Wallet, Clock, CheckCircle,
  LineChart, Award, Lock, Globe
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Freelance Designer",
      content: "GoalAura helped me save ₹2.5L in 8 months for my home studio. The emotional spending tracker was a game-changer!",
      avatar: "PS"
    },
    {
      name: "Rahul Verma",
      role: "Software Engineer",
      content: "The AI matched me with a perfect side hustle. Now I earn an extra ₹30k monthly doing what I love.",
      avatar: "RV"
    },
    {
      name: "Ananya Patel",
      role: "Marketing Manager",
      content: "Dream mapping made my goal of early retirement crystal clear. I know exactly what I need to do.",
      avatar: "AP"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-fuchsia-400/10 rounded-full blur-3xl top-40 right-0 animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">AI-Powered Financial Freedom</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Dream it.<br />
                Plan it.<br />
                <span className="text-yellow-300">Live it.</span>
              </h1>

              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Transform your financial journey from spreadsheets and stress into a path of self-discovery and goal fulfillment. Your dreams deserve a roadmap.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-violet-600 px-8 py-4 rounded-full font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-200">
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-yellow-300">50K+</div>
                  <div className="text-purple-200 text-sm">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-300">₹2.5Cr</div>
                  <div className="text-purple-200 text-sm">Goals Achieved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-300">4.9★</div>
                  <div className="text-purple-200 text-sm">User Rating</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Home Bakery Goal</span>
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">₹4.2L</div>
                    <div className="text-white/80 text-sm">68% Complete • 4 months left</div>
                  </div>

                  <div className="bg-white/20 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Brain className="w-6 h-6 text-yellow-300" />
                      <span className="text-white font-medium">AI Insight</span>
                    </div>
                    <p className="text-purple-100 text-sm">Your stress levels are rising. Consider a ₹500 limit for food delivery tonight.</p>
                  </div>

                  <div className="bg-white/20 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <TrendingUp className="w-6 h-6 text-green-300" />
                      <span className="text-white font-medium">Side Hustle Match</span>
                    </div>
                    <p className="text-purple-100 text-sm">Based on your skills: YouTube Video Editor • Expected: ₹18-25k/month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Features That Transform Lives
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI-powered tools that understand your emotions, goals, and dreams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Dream Mapping</h3>
              <p className="text-gray-600 mb-4">
                Express your dreams in natural language. Our AI reverse-engineers the perfect financial roadmap with visual milestones.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Real-world cost calculations
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Multiple timeline options
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Aligned income opportunities
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Emotional Intelligence</h3>
              <p className="text-gray-600 mb-4">
                Integrates with smartwatches to track stress, sleep, and mood. Prevents impulse spending before it happens.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Behavior pattern analysis
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Proactive spending nudges
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Stress-spending correlation
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Social Circles</h3>
              <p className="text-gray-600 mb-4">
                Connect anonymously with others who share similar financial profiles. Learn, compete, and grow together.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Anonymous participation
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Gamified challenges
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Group accountability
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Opportunity Cost Visualizer</h3>
              <p className="text-gray-600 mb-4">
                See the true cost of every purchase in hours of work and future investment value. Make conscious decisions.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Work-hour equivalents
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Future value projections
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Instant clarity on trade-offs
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Side Hustle Matchmaker</h3>
              <p className="text-gray-600 mb-4">
                AI analyzes your skills, time, and market trends to generate personalized side-hustle blueprints.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Skill-based matching
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Market demand analysis
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Earnings projections
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <LineChart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Quantum Decision Trees</h3>
              <p className="text-gray-600 mb-4">
                Simulate multiple parallel outcomes for major purchases. See financial and lifestyle implications over time.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Multi-scenario comparisons
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  1, 5, and 10-year projections
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Rational decision support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Journey in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              From dreams to reality, we guide you every step of the way
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Dream & Describe</h3>
              <p className="text-gray-600">
                Tell us your dreams in your own words. "I want to open a cafe" or "Help my parents retire early"
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Plans Your Path</h3>
              <p className="text-gray-600">
                Our AI creates a personalized roadmap with milestones, timelines, and income opportunities
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Live Your Dream</h3>
              <p className="text-gray-600">
                Stay on track with emotional intelligence, social support, and adaptive guidance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Stories of Success
            </h2>
            <p className="text-xl text-gray-600">
              Real people, real dreams, real results
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6">
                {testimonials[currentTestimonial].avatar}
              </div>
              <p className="text-xl text-gray-700 mb-6 italic">
                "{testimonials[currentTestimonial].content}"
              </p>
              <div>
                <div className="font-bold text-gray-900">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-gray-600 text-sm">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentTestimonial
                    ? 'bg-violet-600 w-8'
                    : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Your Privacy is Our Priority
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Bank-level encryption, on-device learning, and federated model updates ensure your data stays yours.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Lock className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">End-to-End Encryption</h3>
                    <p className="text-gray-400">Your financial data is encrypted and never shared</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Shield className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">On-Device Learning</h3>
                    <p className="text-gray-400">AI learns from your patterns without sending data to servers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Globe className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">GDPR Compliant</h3>
                    <p className="text-gray-400">Full compliance with global privacy regulations</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Security Dashboard</h3>
                  <Shield className="w-8 h-8 text-yellow-300" />
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                    <span>Data Encryption</span>
                    <CheckCircle className="w-5 h-5 text-green-300" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                    <span>Two-Factor Auth</span>
                    <CheckCircle className="w-5 h-5 text-green-300" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                    <span>Privacy Mode</span>
                    <CheckCircle className="w-5 h-5 text-green-300" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                    <span>Anonymous Sharing</span>
                    <CheckCircle className="w-5 h-5 text-green-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Financial Future?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join 50,000+ users who are already living their dreams with GoalAura
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-violet-600 px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
              <span>Get Started for Free</span>
              <ArrowRight className="w-6 h-6" />
            </button>
            <button className="border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-200">
              Schedule a Demo
            </button>
          </div>
          <p className="text-purple-200 text-sm mt-6">
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}