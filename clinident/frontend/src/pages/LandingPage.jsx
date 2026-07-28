import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain, Image, Box, Calendar, FileText, Shield, Star,
  ChevronRight, Menu, X, Phone, Mail, MapPin, ArrowRight,
  CheckCircle, Zap, Users, Award, Clock, Activity
} from 'lucide-react'

const features = [
  { icon: Brain, title: 'AI X-Ray Analysis', desc: 'Advanced AI compares before/after X-rays, detecting treatment changes with 99.2% confidence score accuracy.', color: 'from-blue-500 to-cyan-400' },
  { icon: Image, title: 'Smart X-Ray Viewer', desc: 'Side-by-side before and after comparison with interactive slider and annotated finding highlights.', color: 'from-primary-500 to-blue-400' },
  { icon: Box, title: '3D STL Scanning', desc: 'Upload and view dental STL scan files in an interactive 3D viewer with orbit controls.', color: 'from-cyan-500 to-teal-400' },
  { icon: Calendar, title: 'Smart Scheduling', desc: 'Patients book appointments online with real-time availability. Automated confirmation and reminders.', color: 'from-indigo-500 to-primary-400' },
  { icon: FileText, title: 'Treatment Reports', desc: 'Auto-generate comprehensive PDF treatment progress reports with AI insights and doctor notes.', color: 'from-primary-600 to-cyan-500' },
  { icon: Shield, title: 'Secure & Compliant', desc: 'End-to-end encrypted data, HIPAA-ready architecture, and role-based access control.', color: 'from-slate-500 to-primary-500' },
]

const testimonials = [
  { name: 'Emily Rodriguez', role: 'Patient', text: 'Clinident transformed my dental experience. The AI analysis showed my treatment progress so clearly — I could see exactly how my teeth improved!', rating: 5, initials: 'ER' },
  { name: 'Dr. James Park', role: 'Orthodontist', text: 'The AI comparison tool saves me 2 hours per day. Before/after X-ray analysis is incredibly accurate and my patients love seeing the visual progress.', rating: 5, initials: 'JP' },
  { name: 'Sarah Mitchell', role: 'Patient', text: 'Booking appointments is seamless. I uploaded my X-rays, got AI analysis, and could track my treatment progress all in one place.', rating: 5, initials: 'SM' },
]

const steps = [
  { num: '01', title: 'Register & Profile', desc: 'Create your patient or doctor account in under 2 minutes with secure email verification.' },
  { num: '02', title: 'Upload X-Rays & Scans', desc: 'Upload dental X-rays and STL files. Our AI instantly begins processing your dental data.' },
  { num: '03', title: 'Get AI Analysis', desc: 'Receive detailed AI-powered comparison reports with confidence scores and treatment recommendations.' },
]

const stats = [
  { value: '10,000+', label: 'Active Patients', icon: Users },
  { value: '99.2%', label: 'AI Accuracy', icon: Brain },
  { value: '50+', label: 'Expert Doctors', icon: Award },
  { value: '24/7', label: 'Support', icon: Clock },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const observerRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setVisibleSections(prev => new Set([...prev, e.target.id]))
        })
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll('[data-animate]').forEach(el => observerRef.current.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  const navLinks = ['Home', 'Services', 'About', 'AI Analysis', 'Contact']

  return (
    <div className="min-h-screen font-sans overflow-x-hidden">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
        <div className="section-container flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src="/clinident_logo.png" alt="Clinident" className="h-9 w-auto object-contain" onError={e => { e.target.style.display='none' }} />
            <span className={`text-2xl font-bold font-display ${scrolled ? 'gradient-text' : 'text-white'}`}>Clinident</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`}
                className={`text-sm font-medium transition-colors hover:text-cyan-400 ${scrolled ? 'text-gray-600' : 'text-white/90'}`}>
                {link}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${scrolled ? 'text-primary-600 hover:bg-primary-50' : 'text-white hover:bg-white/10'}`}>
              Login
            </Link>
            <Link to="/signup" className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg">
              Get Started
            </Link>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'}`}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="section-container py-4 space-y-2">
              {navLinks.map(link => (
                <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`} onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors">
                  {link}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1 text-center px-4 py-2.5 border-2 border-primary-500 text-primary-600 rounded-xl font-semibold text-sm">Login</Link>
                <Link to="/signup" className="flex-1 text-center px-4 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm">Sign Up</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="relative hero-bg min-h-screen flex items-center overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/5 animate-float"
              style={{
                width: `${Math.random() * 80 + 20}px`, height: `${Math.random() * 80 + 20}px`,
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`, animationDuration: `${3 + Math.random() * 4}s`
              }} />
          ))}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-primary-300/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="section-container relative z-10 py-32 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
            {/* Left */}
            <div className="text-white space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Zap size={14} className="text-cyan-400" />
                <span className="text-sm font-medium text-white/90">AI-Powered Dental Care Platform</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display leading-tight">
                Intelligent Dental Care,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-100">
                  Powered by AI
                </span>
              </h1>
              <p className="text-lg text-white/75 leading-relaxed max-w-xl">
                Clinident combines advanced AI with modern dental practice management. Upload X-rays, get instant analysis, book appointments, and track treatment progress — all in one platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-white font-bold rounded-2xl transition-all duration-200 shadow-glow-cyan hover:shadow-lg hover:-translate-y-0.5 text-base">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/30 transition-all duration-200 text-base">
                  Login to Portal
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                {[['✓ Free to start', '✓ AI analysis included', '✓ No credit card']].flat().map(t => (
                  <span key={t} className="text-sm text-white/60">{t}</span>
                ))}
              </div>
            </div>

            {/* Right - Floating card */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative animate-float">
                {/* Main card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl w-80">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center">
                      <Brain size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">AI Analysis Complete</p>
                      <p className="text-white/60 text-xs">Treatment Progress Report</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    {[
                      { label: 'Cavity Reduction', val: 94, color: 'bg-cyan-400' },
                      { label: 'Bone Density', val: 78, color: 'bg-blue-400' },
                      { label: 'Gum Health', val: 88, color: 'bg-teal-400' },
                    ].map(({ label, val, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-white/70 mb-1">
                          <span>{label}</span><span>{val}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/20">
                    <span className="text-white/70 text-xs">Overall Confidence</span>
                    <span className="text-cyan-300 font-bold text-lg">94.7%</span>
                  </div>
                </div>
                {/* Floating badge 1 */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Appointment</p>
                    <p className="text-sm font-bold text-gray-800">Confirmed ✓</p>
                  </div>
                </div>
                {/* Floating badge 2 */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Activity size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Treatment</p>
                    <p className="text-sm font-bold text-gray-800">Excellent Progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 20C1200 80 960 0 720 40C480 80 240 0 0 20L0 80Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* STATS BAR */}
      <section id="about" className="py-16 bg-white">
        <div className="section-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-400 mb-3 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <Icon size={24} className="text-white" />
                </div>
                <div className="text-3xl font-black font-display gradient-text">{value}</div>
                <div className="text-sm text-gray-500 font-medium mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="services" className="py-24 mesh-bg">
        <div className="section-container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-600 text-sm font-semibold mb-4">
              <Zap size={14} /> Core Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-black font-display text-gray-900 mb-4">
              Everything Your Clinic <span className="gradient-text">Needs</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">From AI-powered X-ray analysis to 3D scan viewing and smart appointment scheduling — Clinident has it all.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={title} className="premium-card p-6 group hover:-translate-y-2 transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                  <Icon size={26} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-display text-gray-900 mb-4">How It <span className="gradient-text">Works</span></h2>
            <p className="text-gray-500 max-w-xl mx-auto">Get started in minutes. No complex setup required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 to-cyan-200" />
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} className="text-center relative">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-cyan-400 text-white text-2xl font-black font-display mb-5 shadow-glow-blue">
                  {num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-display">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section id="ai-analysis" className="py-24 bg-gradient-to-br from-primary-900 via-primary-700 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary-300/10 blur-3xl" />
        </div>
        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-cyan-300 text-sm font-semibold">
                <Brain size={14} /> AI-Powered Analysis
              </div>
              <h2 className="text-4xl sm:text-5xl font-black font-display leading-tight">
                See Your Treatment{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">Progress Clearly</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed">
                Our AI compares before and after dental X-rays with incredible precision — highlighting areas of improvement, detecting changes, and generating detailed confidence-scored reports.
              </p>
              <ul className="space-y-3">
                {['99.2% accuracy in treatment change detection', 'Confidence scores per finding area', 'Automated PDF report generation', 'Before/after visual comparison slider'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-white/80">
                    <CheckCircle size={18} className="text-cyan-400 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="inline-flex items-center gap-2 px-7 py-4 bg-cyan-400 hover:bg-cyan-300 text-white font-bold rounded-2xl transition-all shadow-glow-cyan">
                Try AI Analysis Free <ArrowRight size={18} />
              </Link>
            </div>
            {/* Demo AI card */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">AI Analysis Report</span>
                  <span className="badge-green">Completed</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <p className="text-white/50 text-xs mb-1">Before Treatment</p>
                    <div className="h-24 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl flex items-center justify-center">
                      <Image size={24} className="text-white/40" />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <p className="text-cyan-300 text-xs mb-1">After Treatment</p>
                    <div className="h-24 bg-gradient-to-br from-primary-700 to-cyan-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                      <Image size={24} className="text-white/40" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-shimmer" />
                    </div>
                  </div>
                </div>
                {[
                  { label: 'Cavity Reduction', val: 94, color: 'bg-cyan-400' },
                  { label: 'Gum Improvement', val: 87, color: 'bg-teal-400' },
                  { label: 'Bone Density', val: 73, color: 'bg-blue-400' },
                ].map(({ label, val, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-white/60 mb-1"><span>{label}</span><span>{val}%</span></div>
                    <div className="h-2 bg-white/10 rounded-full"><div className={`h-full ${color} rounded-full`} style={{ width: `${val}%` }} /></div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-white/60 text-sm">Overall Confidence</span>
                  <span className="text-2xl font-black text-cyan-300">94.7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-dental-gray/30">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black font-display text-gray-900 mb-4">What Our Users <span className="gradient-text">Say</span></h2>
            <p className="text-gray-500">Trusted by thousands of patients and dental professionals</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating, initials }) => (
              <div key={name} className="premium-card p-6 hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(rating)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-gray-400 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-500 to-cyan-500">
        <div className="section-container text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-black font-display text-white leading-tight">
            Ready to Transform Your<br />Dental Practice?
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Join thousands of patients and doctors already using Clinident for smarter dental care.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-xl text-base">
              Start Free Today <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/20 transition-all text-base">
              Doctor Login
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl font-black font-display text-gray-900 mb-4">Get In <span className="gradient-text">Touch</span></h2>
              <p className="text-gray-500 mb-8">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'Email', val: 'hello@clinident.com' },
                  { icon: Phone, label: 'Phone', val: '+1 (555) 0100' },
                  { icon: MapPin, label: 'Address', val: '123 Dental Ave, Medical District, NY 10001' },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-primary-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-gray-800 font-medium">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="premium-card p-8">
              <form className="space-y-5" onSubmit={e => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="form-label">First Name</label><input className="form-input" placeholder="John" /></div>
                  <div><label className="form-label">Last Name</label><input className="form-input" placeholder="Doe" /></div>
                </div>
                <div><label className="form-label">Email</label><input type="email" className="form-input" placeholder="john@example.com" /></div>
                <div><label className="form-label">Message</label><textarea className="form-input resize-none" rows={4} placeholder="How can we help you?" /></div>
                <button type="submit" className="btn-primary w-full justify-center">Send Message <ArrowRight size={16} /></button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="section-container">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/clinident_logo.png" alt="Clinident" className="h-8 w-auto object-contain opacity-90" onError={e => e.target.style.display='none'} />
                <span className="text-2xl font-bold font-display text-white">Clinident</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">AI-powered dental clinic management. Smart X-ray analysis, 3D scanning, and seamless patient care.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {['Patient Portal', 'Doctor Dashboard', 'AI Analysis', 'Appointments', '3D STL Viewer'].map(l => (
                  <li key={l}><Link to="/signup" className="hover:text-cyan-400 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {['About Us', 'Privacy Policy', 'Terms of Service', 'Contact', 'Support'].map(l => (
                  <li key={l}><a href="#" className="hover:text-cyan-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2026 Clinident. All rights reserved.</p>
            <p className="text-gray-500 text-sm flex items-center gap-1">Built with <span className="text-red-400">♥</span> for modern dental care</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
