import { useState, useEffect } from 'react'
import { Image, Upload, SplitSquareHorizontal, ChevronDown, X } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function DoctorXrays() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [sliderPos, setSliderPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data.data || [])).catch(()=>{})
  }, [])

  const loadFiles = async (patientId) => {
    if (!patientId) return
    setLoading(true)
    try {
      const r = await api.get(`/files/${patientId}`)
      setFiles((r.data.data || []).filter(f => f.type === 'xray'))
    } catch { toast.error('Failed to load X-rays') }
    finally { setLoading(false) }
  }

  const handlePatientChange = (pid) => {
    setSelectedPatient(pid)
    setFiles([])
    loadFiles(pid)
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedPatient) return toast.error('Select a patient first')
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('fileType', 'xray')
    fd.append('category', 'after')
    fd.append('patientId', selectedPatient)
    try {
      const res = await api.post('/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setFiles(prev => [...prev, res.data.data])
      toast.success('X-ray uploaded for patient!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false); e.target.value = '' }
  }

  const beforeImg = files.find(f => f.category === 'before')?.url
  const afterImg = files.find(f => f.category === 'after')?.url

  const handleMouseMove = (e) => {
    if (!dragging) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))
    setSliderPos(x)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="page-header">Patient X-Ray Management</h1>
          <p className="text-gray-500 text-sm mt-1">View, upload, and compare patient dental X-rays</p>
        </div>

        {/* Patient selector */}
        <div className="premium-card p-5">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="form-label">Select Patient</label>
              <div className="relative">
                <select className="form-input appearance-none pr-10" value={selectedPatient} onChange={e=>handlePatientChange(e.target.value)}>
                  <option value="">Choose a patient...</option>
                  {patients.map(p => <option key={p.uid} value={p.uid}>{p.name} — {p.email}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              </div>
            </div>
            <div>
              <label className="btn-primary cursor-pointer">
                {uploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Uploading...</> : <><Upload size={16}/>Upload X-Ray</>}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading}/>
              </label>
            </div>
          </div>
        </div>

        {/* X-Ray Gallery */}
        {selectedPatient && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="premium-card p-5">
                <h3 className="font-bold text-gray-900 mb-3 font-display flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"/>Before Treatment</h3>
                {loading ? <div className="h-48 loading-shimmer rounded-xl"/> :
                  beforeImg ? <img src={beforeImg} alt="Before" className="w-full h-48 object-cover rounded-xl border border-gray-200"/> :
                  <div className="h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center"><Image size={28} className="text-gray-300 mb-2"/><p className="text-gray-400 text-sm">No before X-ray</p></div>}
              </div>
              {/* After */}
              <div className="premium-card p-5">
                <h3 className="font-bold text-gray-900 mb-3 font-display flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"/>After Treatment</h3>
                {loading ? <div className="h-48 loading-shimmer rounded-xl"/> :
                  afterImg ? <img src={afterImg} alt="After" className="w-full h-48 object-cover rounded-xl border border-gray-200"/> :
                  <div className="h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center"><Image size={28} className="text-gray-300 mb-2"/><p className="text-gray-400 text-sm">No after X-ray</p></div>}
              </div>
            </div>

            {/* Comparison */}
            <div className="premium-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <SplitSquareHorizontal size={20} className="text-primary-500"/>
                <h2 className="text-lg font-bold text-gray-900 font-display">Before / After Comparison</h2>
              </div>
              {(beforeImg || afterImg) ? (
                <div className="relative rounded-2xl overflow-hidden cursor-col-resize select-none h-72 bg-gray-100"
                  onMouseMove={handleMouseMove} onMouseDown={()=>setDragging(true)} onMouseUp={()=>setDragging(false)} onMouseLeave={()=>setDragging(false)}>
                  <div className="absolute inset-0">
                    {afterImg ? <img src={afterImg} alt="After" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center"><span className="text-gray-400">After Treatment</span></div>}
                    <div className="absolute top-3 right-3 badge badge-green">After</div>
                  </div>
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                    {beforeImg ? <img src={beforeImg} alt="Before" className="w-full h-full object-cover" style={{ width: `${100/(sliderPos/100)}%`, maxWidth:'none' }}/> : <div className="w-full h-full bg-gradient-to-br from-blue-100 to-primary-100 flex items-center justify-center"><span className="text-gray-400">Before Treatment</span></div>}
                    <div className="absolute top-3 left-3 badge badge-blue">Before</div>
                  </div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPos}%` }}>
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
                      <X size={14} className="text-gray-600 rotate-45"/>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                  <Image size={36} className="text-gray-300 mb-2"/>
                  <p className="text-gray-400 text-sm">Upload before and after X-rays to compare</p>
                </div>
              )}
              {(beforeImg || afterImg) && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-gray-400">Drag slider to compare</span>
                  <input type="range" min={5} max={95} value={sliderPos} onChange={e=>setSliderPos(+e.target.value)} className="flex-1 accent-primary-500"/>
                </div>
              )}
            </div>
          </>
        )}

        {!selectedPatient && (
          <div className="premium-card p-16 text-center">
            <Image size={48} className="text-gray-300 mx-auto mb-4"/>
            <h3 className="text-xl font-bold text-gray-800 font-display mb-2">Select a Patient</h3>
            <p className="text-gray-400">Choose a patient above to view their X-rays and comparisons</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
