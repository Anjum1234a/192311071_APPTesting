import { useState } from 'react'
import { User, Mail, Phone, Calendar, MapPin, Save, Lock } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function PatientProfile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', dob: user?.dob||'', address: user?.address||'' })
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/patients/${user.uid}`, form)
      updateUser(form)
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl">
        <h1 className="page-header">My Profile</h1>

        {/* Avatar Card */}
        <div className="premium-card p-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center text-white text-3xl font-black font-display flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-display">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge badge-blue capitalize">{user?.role}</span>
              <span className="badge badge-green">Active</span>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="premium-card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 font-display">Personal Information</h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label flex items-center gap-1.5"><User size={13}/>Full Name</label>
                <input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Your full name"/>
              </div>
              <div>
                <label className="form-label flex items-center gap-1.5"><Mail size={13}/>Email</label>
                <input className="form-input bg-gray-50 cursor-not-allowed" value={user?.email} readOnly/>
              </div>
              <div>
                <label className="form-label flex items-center gap-1.5"><Phone size={13}/>Phone</label>
                <input type="tel" className="form-input" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+1 555 0100"/>
              </div>
              <div>
                <label className="form-label flex items-center gap-1.5"><Calendar size={13}/>Date of Birth</label>
                <input type="date" className="form-input" value={form.dob} onChange={e=>set('dob',e.target.value)}/>
              </div>
              <div className="sm:col-span-2">
                <label className="form-label flex items-center gap-1.5"><MapPin size={13}/>Address</label>
                <input className="form-input" value={form.address} onChange={e=>set('address',e.target.value)} placeholder="123 Main St, City, State"/>
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</>:<><Save size={15}/>Save Changes</>}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="premium-card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 font-display">Account Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' },
              { label: 'Account Type', value: user?.role?.charAt(0).toUpperCase()+user?.role?.slice(1) },
              { label: 'Email Verified', value: 'Yes ✓' },
              { label: 'Account Status', value: 'Active' },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
                <p className="text-gray-800 font-semibold text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className="premium-card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 font-display flex items-center gap-2"><Lock size={16}/>Change Password</h2>
          <form className="space-y-4" onSubmit={e=>{e.preventDefault();toast.success('Password change feature requires Firebase Auth integration')}}>
            <div><label className="form-label">Current Password</label><input type="password" className="form-input" placeholder="••••••••" value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))}/></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="form-label">New Password</label><input type="password" className="form-input" placeholder="Min 8 characters" value={pwForm.newPw} onChange={e=>setPwForm(f=>({...f,newPw:e.target.value}))}/></div>
              <div><label className="form-label">Confirm New Password</label><input type="password" className="form-input" placeholder="Repeat new password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))}/></div>
            </div>
            <button type="submit" className="btn-secondary"><Lock size={15}/>Update Password</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
