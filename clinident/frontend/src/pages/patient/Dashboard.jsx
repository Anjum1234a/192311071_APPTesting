import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Image, Brain, FileText, Clock, ArrowRight, CheckCircle, Activity, TrendingUp } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'

const quickActions = [
  { to: '/patient/appointments', icon: Calendar, label: 'Book Appointment', color: 'from-primary-500 to-primary-600', desc: 'Schedule your next visit' },
  { to: '/patient/xrays', icon: Image, label: 'Upload X-Ray', color: 'from-cyan-500 to-cyan-600', desc: 'Add dental images' },
  { to: '/patient/ai-analysis', icon: Brain, label: 'AI Analysis', color: 'from-indigo-500 to-primary-500', desc: 'View treatment progress' },
  { to: '/patient/reports', icon: FileText, label: 'My Reports', color: 'from-teal-500 to-cyan-500', desc: 'Download PDF reports' },
]

const milestones = [
  { date: 'Apr 2026', event: 'Initial Consultation', status: 'completed', desc: 'First visit and diagnosis' },
  { date: 'May 2026', event: 'Treatment Started', status: 'completed', desc: 'Root canal procedure' },
  { date: 'Jun 2026', event: 'Follow-up X-Ray', status: 'current', desc: 'AI analysis in progress' },
  { date: 'Sep 2026', event: 'Final Review', status: 'upcoming', desc: 'Treatment completion check' },
]

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/appointments').then(r => setAppointments(r.data.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const upcoming = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').slice(0, 3)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const statusBadge = (s) => {
    const map = { confirmed: 'badge-green', pending: 'badge-yellow', completed: 'badge-blue', cancelled: 'badge-red' }
    return <span className={map[s] || 'badge-gray'}>{s}</span>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-header">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 text-sm mt-1">{today}</p>
          </div>
          <Link to="/patient/appointments" className="btn-primary self-start sm:self-auto">
            <Calendar size={16}/> Book Appointment
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Next Appointment', value: upcoming[0]?.date || 'None scheduled', icon: Calendar, color: 'text-primary-500', bg: 'bg-primary-50' },
            { label: 'Total X-Rays', value: '2 Files', icon: Image, color: 'text-cyan-600', bg: 'bg-cyan-50' },
            { label: 'AI Reports', value: '1 Report', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Treatment Progress', value: '68%', icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className={color}/>
              </div>
              <div className="min-w-0">
                <p className="text-gray-500 text-xs font-medium">{label}</p>
                <p className="text-gray-900 font-bold text-sm sm:text-base truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 font-display">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map(({ to, icon: Icon, label, color, desc }) => (
              <Link key={to} to={to} className="premium-card p-5 hover:-translate-y-1 transition-all duration-200 group block">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={22} className="text-white"/>
                </div>
                <p className="font-bold text-gray-900 text-sm font-display">{label}</p>
                <p className="text-gray-400 text-xs mt-1">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 font-display">Upcoming Appointments</h2>
              <Link to="/patient/appointments" className="text-sm text-primary-500 hover:text-primary-700 font-medium flex items-center gap-1">View all <ArrowRight size={14}/></Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-16 loading-shimmer rounded-xl"/>)}</div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={36} className="text-gray-300 mx-auto mb-2"/>
                <p className="text-gray-400 text-sm">No upcoming appointments</p>
                <Link to="/patient/appointments" className="text-primary-500 text-sm font-medium hover:underline mt-1 block">Book one now</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(appt => (
                  <div key={appt.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock size={18} className="text-primary-600"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{appt.type}</p>
                      <p className="text-gray-400 text-xs">{appt.date} at {appt.time}</p>
                    </div>
                    {statusBadge(appt.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Treatment Timeline */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 font-display">Treatment Timeline</h2>
              <Activity size={18} className="text-primary-400"/>
            </div>
            <div className="space-y-4">
              {milestones.map(({ date, event, status, desc }, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${status==='completed'?'bg-green-500':status==='current'?'bg-primary-500 animate-pulse':'bg-gray-200'}`}>
                      {status==='completed' ? <CheckCircle size={14} className="text-white"/> : <div className="w-2.5 h-2.5 rounded-full bg-white"/>}
                    </div>
                    {i < milestones.length-1 && <div className="w-0.5 h-8 bg-gray-200 my-1"/>}
                  </div>
                  <div className="pb-2">
                    <p className="text-xs text-gray-400 font-medium">{date}</p>
                    <p className={`font-semibold text-sm ${status==='current'?'text-primary-600':'text-gray-800'}`}>{event}</p>
                    <p className="text-gray-400 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
