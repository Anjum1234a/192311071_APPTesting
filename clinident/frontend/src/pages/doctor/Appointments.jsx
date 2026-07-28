import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle, XCircle, ChevronDown } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled']
const statusMap = { confirmed: 'badge-green', pending: 'badge-yellow', completed: 'badge-blue', cancelled: 'badge-red' }
const filterTabs = ['All', 'Today', 'Upcoming', 'Completed']

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [updating, setUpdating] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    api.get('/appointments').then(r => setAppointments(r.data.data || [])).catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await api.put(`/appointments/${id}`, { status })
      setAppointments(prev => prev.map(a => a.id === id ? {...a, status} : a))
      toast.success(`Appointment ${status}`)
    } catch { toast.error('Update failed') }
    finally { setUpdating(null) }
  }

  const filtered = appointments.filter(a => {
    if (activeTab === 'Today') return a.date === today
    if (activeTab === 'Upcoming') return a.date > today && a.status !== 'cancelled'
    if (activeTab === 'Completed') return a.status === 'completed'
    return true
  })

  // Weekly calendar grid (next 7 days)
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i)
    const ds = d.toISOString().split('T')[0]
    return { date: ds, label: d.toLocaleDateString('en-US',{weekday:'short'}), day: d.getDate(), appts: appointments.filter(a=>a.date===ds) }
  })

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="page-header">Appointment Management</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments.length} total appointments</p>
        </div>

        {/* Weekly calendar */}
        <div className="premium-card p-5">
          <h2 className="font-bold text-gray-900 mb-4 font-display flex items-center gap-2"><Calendar size={18} className="text-primary-500"/>Weekly Overview</h2>
          <div className="grid grid-cols-7 gap-2">
            {days.map(({ date, label, day, appts: dayAppts }) => (
              <div key={date} className={`rounded-2xl p-3 text-center transition-all ${date===today?'bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-lg':'bg-gray-50 hover:bg-gray-100'}`}>
                <p className={`text-xs font-medium mb-1 ${date===today?'text-white/80':'text-gray-400'}`}>{label}</p>
                <p className={`text-lg font-black font-display ${date===today?'text-white':'text-gray-700'}`}>{day}</p>
                {dayAppts.length > 0 && (
                  <div className={`mt-1 text-xs font-semibold px-1.5 py-0.5 rounded-full inline-block ${date===today?'bg-white/20 text-white':'bg-primary-100 text-primary-600'}`}>
                    {dayAppts.length}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab===tab?'bg-primary-500 text-white shadow-md':'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}>
              {tab} {tab === 'All' ? `(${appointments.length})` : tab === 'Today' ? `(${appointments.filter(a=>a.date===today).length})` : ''}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="space-y-4">{[...Array(4)].map((_,i)=><div key={i} className="h-24 loading-shimmer rounded-2xl"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="premium-card p-16 text-center">
            <Calendar size={48} className="text-gray-300 mx-auto mb-4"/>
            <p className="text-gray-400">No appointments for this filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(appt => (
              <div key={appt.id} className="premium-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 flex flex-col items-center justify-center text-white flex-shrink-0">
                  <span className="text-lg font-black leading-none">{appt.date?.split('-')[2]}</span>
                  <span className="text-xs opacity-80">{appt.date ? new Date(appt.date+'T00:00:00').toLocaleDateString('en-US',{month:'short'}) : ''}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 font-display">{appt.patientName}</p>
                    <span className={statusMap[appt.status]||'badge-gray'}>{appt.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-gray-500 text-sm">
                    <span className="flex items-center gap-1"><Clock size={13}/>{appt.time}</span>
                    <span>{appt.type}</span>
                  </div>
                  {appt.notes && <p className="text-gray-400 text-xs mt-1 truncate">{appt.notes}</p>}
                </div>
                {/* Status updater */}
                <div className="relative flex-shrink-0">
                  <select
                    value={appt.status}
                    onChange={e => updateStatus(appt.id, e.target.value)}
                    disabled={updating === appt.id}
                    className="form-input text-sm py-2 pr-8 appearance-none cursor-pointer min-w-[130px]">
                    {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  {updating === appt.id && <div className="absolute inset-0 flex items-center justify-center bg-white/50"><div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"/></div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
