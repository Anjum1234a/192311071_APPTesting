import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, Brain, FileText, Clock, ArrowRight, TrendingUp, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'

const chartData = [
  { month: 'Jan', appointments: 28 }, { month: 'Feb', appointments: 35 },
  { month: 'Mar', appointments: 42 }, { month: 'Apr', appointments: 38 },
  { month: 'May', appointments: 51 }, { month: 'Jun', appointments: 47 },
]

const quickActions = [
  { to: '/doctor/patients', icon: Users, label: 'View Patients', color: 'from-primary-500 to-primary-600' },
  { to: '/doctor/appointments', icon: Calendar, label: 'Appointments', color: 'from-cyan-500 to-cyan-600' },
  { to: '/doctor/ai-analysis', icon: Brain, label: 'AI Analysis', color: 'from-indigo-500 to-primary-500' },
  { to: '/doctor/reports', icon: FileText, label: 'Generate Report', color: 'from-teal-500 to-cyan-500' },
]

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/patients').then(r => setPatients(r.data.data || [])),
      api.get('/appointments').then(r => setAppointments(r.data.data || [])),
    ]).finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.date === today)
  const pending = appointments.filter(a => a.status === 'pending')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const statusMap = { confirmed: 'badge-green', pending: 'badge-yellow', completed: 'badge-blue', cancelled: 'badge-red' }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-header">{greeting}, Dr. {user?.name?.split(' ').slice(-1)[0]}! 🏥</h1>
            <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>
          <Link to="/doctor/patients" className="btn-primary self-start sm:self-auto"><Users size={16}/>View Patients</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Patients', value: patients.length, icon: Users, color: 'text-primary-500', bg: 'bg-primary-50' },
            { label: "Today's Appointments", value: todayAppts.length, icon: Calendar, color: 'text-cyan-600', bg: 'bg-cyan-50' },
            { label: 'Pending Reviews', value: pending.length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'AI Reports', value: '5 Generated', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className={color}/>
              </div>
              <div className="min-w-0">
                <p className="text-gray-500 text-xs font-medium">{label}</p>
                <p className="text-gray-900 font-bold text-base">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to} className="premium-card p-5 hover:-translate-y-1 transition-all duration-200 group block">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="text-white"/>
              </div>
              <p className="font-bold text-gray-900 text-sm font-display">{label}</p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 font-display flex items-center gap-2"><TrendingUp size={18} className="text-primary-500"/>Appointment Trends</h2>
              <span className="text-xs text-gray-400">Last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a6eb5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1a6eb5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8"/>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 4px 24px rgba(0,0,0,0.1)' }}/>
                <Area type="monotone" dataKey="appointments" stroke="#1a6eb5" strokeWidth={2.5} fill="url(#apptGrad)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Appointments */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 font-display">Recent Appointments</h2>
              <Link to="/doctor/appointments" className="text-sm text-primary-500 font-medium flex items-center gap-1">View all <ArrowRight size={14}/></Link>
            </div>
            {loading ? <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-14 loading-shimmer rounded-xl"/>)}</div>
            : appointments.slice(0,4).length === 0 ? (
              <div className="text-center py-8"><Calendar size={36} className="text-gray-300 mx-auto mb-2"/><p className="text-gray-400 text-sm">No appointments</p></div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0,4).map(appt => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-600 font-bold text-sm">{appt.patientName?.[0]||'P'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{appt.patientName}</p>
                      <p className="text-gray-400 text-xs">{appt.date} • {appt.time}</p>
                    </div>
                    <span className={statusMap[appt.status]||'badge-gray'}>{appt.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 font-display">Recent Patients</h2>
            <Link to="/doctor/patients" className="text-sm text-primary-500 font-medium flex items-center gap-1">View all <ArrowRight size={14}/></Link>
          </div>
          {loading ? <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="h-16 loading-shimmer rounded-xl"/>)}</div>
          : patients.slice(0,5).length === 0 ? (
            <div className="text-center py-8"><Users size={36} className="text-gray-300 mx-auto mb-2"/><p className="text-gray-400 text-sm">No patients registered yet</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-gray-400 text-xs uppercase tracking-wider"><th className="text-left pb-3">Patient</th><th className="text-left pb-3">Email</th><th className="text-left pb-3">Phone</th><th className="text-left pb-3">Status</th><th className="text-left pb-3">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {patients.slice(0,5).map(p => (
                    <tr key={p.uid} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">{p.name?.[0]}</div><span className="font-medium text-gray-800">{p.name}</span></div></td>
                      <td className="py-3 text-gray-500">{p.email}</td>
                      <td className="py-3 text-gray-500">{p.phone||'—'}</td>
                      <td className="py-3"><span className="badge-green">Active</span></td>
                      <td className="py-3"><Link to="/doctor/patients" className="text-primary-500 hover:text-primary-700 font-medium text-xs">View →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
