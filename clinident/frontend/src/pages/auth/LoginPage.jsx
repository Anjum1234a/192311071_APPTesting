import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Stethoscope, ArrowRight, Brain, Shield, Calendar } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('patient')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const demoCreds = {
    patient: { email: 'patient@clinident.com', password: 'patient123' },
    doctor: { email: 'doctor@clinident.com', password: 'doctor123' },
  }

  const fillDemo = () => {
    setEmail(demoCreds[role].email)
    setPassword(demoCreds[role].password)
    toast.success('Demo credentials filled!')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] hero-bg flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/5 animate-float"
              style={{ width: `${40+i*20}px`, height: `${40+i*20}px`, left: `${10+i*11}%`, top: `${5+i*10}%`, animationDelay: `${i*0.4}s` }} />
          ))}
        </div>
        <Link to="/" className="relative flex items-center gap-2">
          <img src="/clinident_logo.png" alt="Clinident" className="h-10 w-auto object-contain" onError={e => e.target.style.display='none'} />
          <span className="text-2xl font-bold font-display text-white">Clinident</span>
        </Link>
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-black font-display text-white leading-tight mb-4">Smart Dental Care,<br /><span className="text-cyan-300">All In One Place</span></h2>
            <p className="text-white/70 leading-relaxed">AI-powered X-ray analysis, 3D scanning, smart appointments, and digital treatment records.</p>
          </div>
          <div className="space-y-4">
            {[{icon: Brain, text: 'AI-Powered X-Ray Analysis'},{icon: Shield, text: 'Secure & HIPAA-Ready'},{icon: Calendar, text: 'Smart Appointment Scheduling'}].map(({icon: Icon, text}) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"><Icon size={16} className="text-cyan-300" /></div>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/40 text-sm">© 2026 Clinident. All rights reserved.</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/clinident_logo.png" alt="Clinident" className="h-8 w-auto" onError={e => e.target.style.display='none'} />
              <span className="text-xl font-bold font-display gradient-text">Clinident</span>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black font-display text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to your Clinident account</p>
          </div>
          <div className="bg-gray-100 p-1 rounded-2xl flex">
            {['patient','doctor'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${role===r ? 'bg-white shadow-md text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
                {r==='patient' ? <User size={16}/> : <Stethoscope size={16}/>}
                {r.charAt(0).toUpperCase()+r.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={fillDemo} className="w-full flex items-center justify-between px-4 py-3 bg-primary-50 border border-primary-100 rounded-xl hover:bg-primary-100 transition-colors group">
            <div className="text-left">
              <p className="text-xs text-primary-400 font-medium">Demo {role} credentials</p>
              <p className="text-sm text-primary-700 font-semibold">{demoCreds[role].email}</p>
            </div>
            <ArrowRight size={16} className="text-primary-400 group-hover:translate-x-1 transition-transform"/>
          </button>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="form-label">Email Address</label><input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input type={showPass?'text':'password'} className="form-input pr-12" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-primary-500"/>Remember me</label>
              <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-700 font-medium">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base py-3.5">
              {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing in...</> : <>Sign In <ArrowRight size={18}/></>}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500">Don't have an account?{' '}<Link to="/signup" className="text-primary-600 font-semibold hover:underline">Create one free</Link></p>
        </div>
      </div>
    </div>
  )
}
