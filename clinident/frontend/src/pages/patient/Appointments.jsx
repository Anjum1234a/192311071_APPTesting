import { useState, useEffect } from 'react'
import { Calendar, Plus, Clock, X, ChevronDown } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const apptTypes = ['Routine Checkup', 'X-Ray Analysis', 'Teeth Cleaning', 'Orthodontic Consultation', 'Root Canal', 'Tooth Extraction', 'Teeth Whitening', 'Emergency']
const timeSlots = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM']

const statusMap = { confirmed: 'badge-green', pending: 'badge-yellow', completed: 'badge-blue', cancelled: 'badge-red' }

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ date: '', time: '', type: '', notes: '' })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = () => {
    api.get('/appointments').then(r => setAppointments(r.data.data || [])).catch(()=>toast.error('Failed to load appointments')).finally(()=>setLoading(false))
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!form.date || !form.time || !form.type) return toast.error('Please fill all required fields')
    setSubmitting(true)
    try {
      await api.post('/appointments', form)
      toast.success('Appointment booked successfully!')
      setShowModal(false)
      setForm({ date:'', time:'', type:'', notes:'' })
      fetchAppointments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">My Appointments</h1>
            <p className="text-gray-500 text-sm mt-1">{appointments.length} total appointments</p>
          </div>
          <button onClick={()=>setShowModal(true)} className="btn-primary"><Plus size={16}/> Book Appointment</button>
        </div>

        {loading ? (
          <div className="grid gap-4">{[...Array(3)].map((_,i)=><div key={i} className="h-28 loading-shimmer rounded-2xl"/>)}</div>
        ) : appointments.length === 0 ? (
          <div className="premium-card p-16 text-center">
            <Calendar size={48} className="text-gray-300 mx-auto mb-4"/>
            <h3 className="text-xl font-bold text-gray-800 font-display mb-2">No appointments yet</h3>
            <p className="text-gray-400 mb-6">Book your first appointment to get started with your dental care.</p>
            <button onClick={()=>setShowModal(true)} className="btn-primary"><Plus size={16}/> Book Now</button>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map(appt => (
              <div key={appt.id} className="premium-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 flex flex-col items-center justify-center text-white flex-shrink-0">
                  <span className="text-lg font-black leading-none">{new Date(appt.date).getDate() || appt.date.split('-')[2]}</span>
                  <span className="text-xs font-medium opacity-80">{appt.date ? new Date(appt.date+'T00:00:00').toLocaleDateString('en-US',{month:'short'}) : ''}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 font-display">{appt.type}</p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="flex items-center gap-1 text-gray-500 text-sm"><Clock size={13}/>{appt.time}</span>
                    <span className="text-gray-500 text-sm">Dr. {appt.doctorName}</span>
                  </div>
                  {appt.notes && <p className="text-gray-400 text-xs mt-1 truncate">{appt.notes}</p>}
                </div>
                <span className={statusMap[appt.status] || 'badge-gray'}>{appt.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget)setShowModal(false)}}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold font-display text-gray-900">Book Appointment</h2>
              <button onClick={()=>setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><X size={16}/></button>
            </div>
            <form onSubmit={handleBook} className="p-6 space-y-5">
              <div>
                <label className="form-label">Appointment Type <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select className="form-input appearance-none pr-10" value={form.type} onChange={e=>set('type',e.target.value)} required>
                    <option value="">Select type...</option>
                    {apptTypes.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Date <span className="text-red-400">*</span></label>
                  <input type="date" className="form-input" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e=>set('date',e.target.value)} required/>
                </div>
                <div>
                  <label className="form-label">Time <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <select className="form-input appearance-none pr-10" value={form.time} onChange={e=>set('time',e.target.value)} required>
                      <option value="">Select time...</option>
                      {timeSlots.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                </div>
              </div>
              <div>
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-input resize-none" rows={3} placeholder="Any special concerns or notes for the doctor..." value={form.notes} onChange={e=>set('notes',e.target.value)}/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Booking...</>:<><Calendar size={16}/> Confirm Booking</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
