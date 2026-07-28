import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setSent(true) // Don't reveal if email exists
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-cyan-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img src="/clinident_logo.png" alt="Clinident" className="h-10 w-auto object-contain" onError={e=>e.target.style.display='none'}/>
            <span className="text-2xl font-bold font-display gradient-text">Clinident</span>
          </Link>
        </div>
        <div className="premium-card p-8 space-y-6">
          {!sent ? (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-primary-500"/>
                </div>
                <h1 className="text-2xl font-black font-display text-gray-900">Reset Password</h1>
                <p className="text-gray-500 mt-2 text-sm">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                  {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Sending...</> : <>Send Reset Link <ArrowRight size={16}/></>}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-green-600"/>
              </div>
              <h2 className="text-2xl font-black font-display text-gray-900">Check Your Email</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your inbox and spam folder.
              </p>
              <button onClick={()=>setSent(false)} className="btn-secondary w-full justify-center">Try Another Email</button>
            </div>
          )}
          <div className="text-center pt-2 border-t border-gray-100">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary-600 font-semibold hover:underline">
              <ArrowLeft size={14}/> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
