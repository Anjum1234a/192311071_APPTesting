import { useState, useEffect } from 'react'
import { Search, User, Phone, Mail, Calendar, FileText, X, Plus, ChevronDown } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const treatmentTypes = ['General', 'Root Canal', 'Orthodontics', 'Cleaning', 'Extraction', 'Whitening', 'X-Ray', 'Consultation']

function PatientModal({ patient, onClose }) {
  const [note, setNote] = useState('')
  const [treatment, setTreatment] = useState('General')
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState([])

  useEffect(() => {
    api.get(`/doctors/notes/${patient.uid}`).then(r => setNotes(r.data.data || [])).catch(()=>{})
  }, [patient.uid])

  const saveNote = async () => {
    if (!note.trim()) return toast.error('Note cannot be empty')
    setSaving(true)
    try {
      const res = await api.post('/doctors/notes', { patientId: patient.uid, note, treatment })
      setNotes(prev => [res.data.data, ...prev])
      setNote('')
      toast.success('Treatment note saved!')
    } catch { toast.error('Failed to save note') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">{patient.name?.[0]}</div>
            <div><h2 className="text-xl font-bold font-display text-gray-900">{patient.name}</h2><p className="text-gray-400 text-sm capitalize">{patient.role}</p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={16}/></button>
        </div>
        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Mail, label: 'Email', val: patient.email },
              { icon: Phone, label: 'Phone', val: patient.phone || 'N/A' },
              { icon: Calendar, label: 'Date of Birth', val: patient.dob || 'N/A' },
              { icon: FileText, label: 'Member Since', val: patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A' },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1"><Icon size={13} className="text-gray-400"/><p className="text-gray-400 text-xs font-medium">{label}</p></div>
                <p className="text-gray-800 font-semibold text-sm">{val}</p>
              </div>
            ))}
          </div>

          {/* Add Treatment Note */}
          <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-gray-900 font-display">Add Treatment Note</h3>
            <div>
              <label className="form-label">Treatment Type</label>
              <div className="relative">
                <select className="form-input appearance-none pr-10" value={treatment} onChange={e=>setTreatment(e.target.value)}>
                  {treatmentTypes.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              </div>
            </div>
            <div>
              <label className="form-label">Note</label>
              <textarea className="form-input resize-none" rows={3} placeholder="Clinical observations, treatment notes, follow-up instructions..." value={note} onChange={e=>setNote(e.target.value)}/>
            </div>
            <button onClick={saveNote} disabled={saving} className="btn-primary">
              {saving?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</>:<><Plus size={15}/>Save Note</>}
            </button>
          </div>

          {/* Notes History */}
          {notes.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 font-display">Treatment Notes</h3>
              <div className="space-y-3">
                {notes.map(n => (
                  <div key={n.id} className="p-4 bg-gray-50 rounded-xl border-l-4 border-primary-400">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-blue text-xs">{n.treatment}</span>
                      <span className="text-gray-400 text-xs ml-auto">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{n.note}</p>
                    <p className="text-gray-400 text-xs mt-2">by {n.doctorName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DoctorPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data.data || [])).catch(()=>toast.error('Failed to load patients')).finally(()=>setLoading(false))
  }, [])

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  )

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-header">Patients</h1>
            <p className="text-gray-500 text-sm mt-1">{patients.length} registered patients</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="form-input pl-11" placeholder="Search patients by name, email, or phone..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_,i)=><div key={i} className="h-36 loading-shimmer rounded-2xl"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="premium-card p-16 text-center">
            <User size={48} className="text-gray-300 mx-auto mb-4"/>
            <h3 className="text-xl font-bold text-gray-800 font-display mb-2">{search ? 'No patients found' : 'No patients yet'}</h3>
            <p className="text-gray-400">Patients will appear here when they register.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(patient => (
              <div key={patient.uid} className="premium-card p-5 hover:-translate-y-1 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {patient.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 font-display truncate">{patient.name}</p>
                    <p className="text-gray-400 text-xs truncate">{patient.email}</p>
                  </div>
                </div>
                <div className="space-y-1.5 mb-4">
                  {patient.phone && <div className="flex items-center gap-2 text-gray-500 text-xs"><Phone size={11}/>{patient.phone}</div>}
                  {patient.dob && <div className="flex items-center gap-2 text-gray-500 text-xs"><Calendar size={11}/>DOB: {patient.dob}</div>}
                  <div className="flex items-center gap-2 text-gray-500 text-xs"><FileText size={11}/>Since {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}</div>
                </div>
                <button onClick={()=>setSelected(patient)} className="btn-primary w-full justify-center text-sm py-2.5">View Details</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <PatientModal patient={selected} onClose={()=>setSelected(null)}/>}
    </DashboardLayout>
  )
}
