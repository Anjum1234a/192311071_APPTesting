import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Stethoscope, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', phone:'', dob:'', address:'', specialization:'', license:'', clinicName:'' })

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const user = await register({ ...form, role })
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] hero-bg flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_,i) => (
            <div key={i} className="absolute rounded-full bg-white/5 animate-float"
              style={{width:`${40+i*20}px`,height:`${40+i*20}px`,left:`${10+i*11}%`,top:`${5+i*10}%`,animationDelay:`${i*0.4}s`}}/>
          ))}
        </div>
        <Link to="/" className="relative flex items-center gap-2">
          <img src="/clinident_logo.png" alt="Clinident" className="h-10 w-auto object-contain" onError={e=>e.target.style.display='none'}/>
          <span className="text-2xl font-bold font-display text-white">Clinident</span>
        </Link>
        <div className="relative space-y-6">
          <h2 className="text-4xl font-black font-display text-white leading-tight">Join Clinident<br/><span className="text-cyan-300">Today — It's Free</span></h2>
          <ul className="space-y-3">
            {['AI X-Ray comparison at your fingertips','Book & manage appointments seamlessly','Access your dental history anytime','Secure & private medical records'].map(t => (
              <li key={t} className="flex items-center gap-3 text-white/75 text-sm">
                <CheckCircle size={16} className="text-cyan-400 flex-shrink-0"/>{t}
              </li>
            ))}
          </ul>
          {/* Step indicator */}
          <div className="flex items-center gap-3 pt-4">
            {[1,2].map(s => (
              <div key={s} className={`flex items-center gap-2 ${step>=s?'opacity-100':'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step>=s?'bg-cyan-400 text-white':'bg-white/20 text-white'}`}>{s}</div>
                <span className="text-white/70 text-sm">{s===1?'Choose Role':'Your Details'}</span>
                {s<2&&<ArrowRight size={14} className="text-white/40"/>}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/40 text-sm">© 2026 Clinident</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-7">
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/clinident_logo.png" alt="Clinident" className="h-8 w-auto" onError={e=>e.target.style.display='none'}/>
              <span className="text-xl font-bold font-display gradient-text">Clinident</span>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black font-display text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1">Step {step} of 2 — {step===1?'Select your role':'Enter your details'}</p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              {[
                {val:'patient', icon: User, title:'Patient', desc:'Book appointments, upload X-rays, view AI analysis and treatment progress'},
                {val:'doctor', icon: Stethoscope, title:'Doctor / Dentist', desc:'Manage patients, run AI analysis, generate reports and treatment notes'},
              ].map(({val, icon: Icon, title, desc}) => (
                <button key={val} onClick={() => setRole(val)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 flex gap-4 items-start hover:-translate-y-0.5 ${role===val?'border-primary-500 bg-primary-50 shadow-lg':'border-gray-200 bg-white hover:border-primary-200'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${role===val?'bg-primary-500':'bg-gray-100'}`}>
                    <Icon size={22} className={role===val?'text-white':'text-gray-500'}/>
                  </div>
                  <div>
                    <p className={`font-bold text-base ${role===val?'text-primary-700':'text-gray-800'}`}>{title}</p>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">{desc}</p>
                  </div>
                  {role===val&&<CheckCircle size={20} className="text-primary-500 ml-auto flex-shrink-0"/>}
                </button>
              ))}
              <button onClick={() => { if(!role) return toast.error('Please select a role'); setStep(2); }}
                className="btn-primary w-full justify-center py-3.5">
                Continue <ArrowRight size={18}/>
              </button>
              <p className="text-center text-sm text-gray-500">Already have an account?{' '}<Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link></p>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="form-label">Full Name</label><input className="form-input" placeholder="John Doe" value={form.name} onChange={e=>set('name',e.target.value)} required/></div>
                <div className="col-span-2"><label className="form-label">Email</label><input type="email" className="form-input" placeholder="john@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required/></div>
                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input type={showPass?'text':'password'} className="form-input pr-10" placeholder="Min 6 chars" value={form.password} onChange={e=>set('password',e.target.value)} required/>
                    <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <div><label className="form-label">Confirm Password</label><input type="password" className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={e=>set('confirmPassword',e.target.value)} required/></div>
                <div><label className="form-label">Phone</label><input type="tel" className="form-input" placeholder="+1 555 0100" value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
                <div><label className="form-label">{role==='patient'?'Date of Birth':'Phone'}</label>
                  {role==='patient'?<input type="date" className="form-input" value={form.dob} onChange={e=>set('dob',e.target.value)}/>
                  :<input className="form-input" placeholder="Specialization" value={form.specialization} onChange={e=>set('specialization',e.target.value)}/>}
                </div>
                {role==='doctor'&&<>
                  <div><label className="form-label">License No.</label><input className="form-input" placeholder="DDS-2024-001" value={form.license} onChange={e=>set('license',e.target.value)}/></div>
                  <div><label className="form-label">Clinic Name</label><input className="form-input" placeholder="My Dental Clinic" value={form.clinicName} onChange={e=>set('clinicName',e.target.value)}/></div>
                </>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setStep(1)} className="btn-secondary flex-1 justify-center py-3">
                  <ArrowLeft size={16}/> Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
                  {loading?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating...</>:<>Create Account <ArrowRight size={16}/></>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
