import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Image, Upload, Trash2, SplitSquareHorizontal, X } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

function DropZone({ label, category, onUploaded, accent = 'primary' }) {
  const [uploading, setUploading] = useState(false)
  const onDrop = useCallback(async (files) => {
    const file = files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('fileType', 'xray')
    fd.append('category', category)
    try {
      const res = await api.post('/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onUploaded(res.data.data)
      toast.success(`${label} X-ray uploaded!`)
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }, [category, label, onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false })

  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
      ${isDragActive ? 'border-primary-400 bg-primary-50 scale-[1.01]' : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'}
      ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"/>
          <p className="text-primary-500 font-medium text-sm">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl ${accent === 'cyan' ? 'bg-cyan-100' : 'bg-primary-100'} flex items-center justify-center`}>
            <Upload size={24} className={accent === 'cyan' ? 'text-cyan-600' : 'text-primary-600'}/>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{isDragActive ? 'Drop it here!' : `Upload ${label} X-ray`}</p>
            <p className="text-gray-400 text-xs mt-1">Drag & drop or click to browse • JPG, PNG, WEBP</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ImageCard({ file, onDelete }) {
  return (
    <div className="premium-card overflow-hidden group">
      <div className="relative h-36 bg-gray-100 overflow-hidden">
        {file.url ? (
          <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-cyan-50">
            <Image size={32} className="text-primary-300"/>
          </div>
        )}
        <button onClick={() => onDelete(file.id)} className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
          <Trash2 size={12} className="text-white"/>
        </button>
        <div className={`absolute top-2 left-2 badge ${file.category === 'before' ? 'badge-blue' : 'badge-green'}`}>
          {file.category}
        </div>
      </div>
      <div className="p-3">
        <p className="text-gray-800 font-medium text-sm truncate">{file.name}</p>
        <p className="text-gray-400 text-xs mt-0.5">{file.size} • {new Date(file.uploadedAt).toLocaleDateString()}</p>
      </div>
    </div>
  )
}

export default function PatientXrays() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [sliderPos, setSliderPos] = useState(50)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    api.get('/files').then(r => setFiles((r.data.data || []).filter(f => f.type === 'xray'))).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const handleUploaded = (file) => setFiles(prev => [...prev, file])
  const handleDelete = async (id) => {
    try { await api.delete(`/files/${id}`); setFiles(prev => prev.filter(f => f.id !== id)); toast.success('File deleted') } catch { toast.error('Delete failed') }
  }

  const beforeFiles = files.filter(f => f.category === 'before')
  const afterFiles = files.filter(f => f.category === 'after')
  const beforeImg = beforeFiles[0]?.url
  const afterImg = afterFiles[0]?.url

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
          <h1 className="page-header">Dental X-Rays</h1>
          <p className="text-gray-500 text-sm mt-1">Upload and compare your before and after treatment X-rays</p>
        </div>

        {/* Upload zones */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="premium-card p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 font-display"><div className="w-3 h-3 rounded-full bg-blue-500"/> Before Treatment</h3>
            <DropZone label="Before" category="before" onUploaded={handleUploaded} accent="primary"/>
            {loading ? <div className="grid grid-cols-2 gap-3 mt-4">{[...Array(2)].map((_,i)=><div key={i} className="h-32 loading-shimmer rounded-xl"/>)}</div>
            : beforeFiles.length > 0 && <div className="grid grid-cols-2 gap-3 mt-4">{beforeFiles.map(f=><ImageCard key={f.id} file={f} onDelete={handleDelete}/>)}</div>}
          </div>
          <div className="premium-card p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 font-display"><div className="w-3 h-3 rounded-full bg-green-500"/> After Treatment</h3>
            <DropZone label="After" category="after" onUploaded={handleUploaded} accent="cyan"/>
            {loading ? <div className="grid grid-cols-2 gap-3 mt-4">{[...Array(2)].map((_,i)=><div key={i} className="h-32 loading-shimmer rounded-xl"/>)}</div>
            : afterFiles.length > 0 && <div className="grid grid-cols-2 gap-3 mt-4">{afterFiles.map(f=><ImageCard key={f.id} file={f} onDelete={handleDelete}/>)}</div>}
          </div>
        </div>

        {/* Comparison slider */}
        <div className="premium-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <SplitSquareHorizontal size={20} className="text-primary-500"/>
            <h2 className="text-lg font-bold text-gray-900 font-display">Before / After Comparison</h2>
          </div>
          {(beforeImg || afterImg) ? (
            <div className="relative rounded-2xl overflow-hidden cursor-col-resize select-none h-72 bg-gray-100"
              onMouseMove={handleMouseMove} onMouseDown={()=>setDragging(true)} onMouseUp={()=>setDragging(false)} onMouseLeave={()=>setDragging(false)}>
              {/* After image (full) */}
              <div className="absolute inset-0">
                {afterImg ? <img src={afterImg} alt="After" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center"><span className="text-gray-400 font-medium">After Treatment</span></div>}
                <div className="absolute top-3 right-3 badge badge-green">After</div>
              </div>
              {/* Before image (clipped) */}
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                {beforeImg ? <img src={beforeImg} alt="Before" className="w-full h-full object-cover" style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: 'none' }}/> : <div className="w-full h-full bg-gradient-to-br from-blue-100 to-primary-100 flex items-center justify-center"><span className="text-gray-400 font-medium">Before Treatment</span></div>}
                <div className="absolute top-3 left-3 badge badge-blue">Before</div>
              </div>
              {/* Divider */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPos}%` }}>
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
                  <X size={14} className="text-gray-600 rotate-45"/>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
              <Image size={36} className="text-gray-300 mb-2"/>
              <p className="text-gray-400 text-sm">Upload before and after X-rays to enable comparison</p>
            </div>
          )}
          {(beforeImg || afterImg) && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-gray-400">Drag slider to compare</span>
              <input type="range" min={5} max={95} value={sliderPos} onChange={e=>setSliderPos(+e.target.value)} className="flex-1 accent-primary-500"/>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
