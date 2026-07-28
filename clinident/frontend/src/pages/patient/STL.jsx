import { useState, useEffect, useCallback, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useDropzone } from 'react-dropzone'
import { Box, Upload, Trash2, RotateCcw } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

// Demo 3D tooth model using Three.js primitives
function ToothModel({ color = '#1a6eb5' }) {
  const groupRef = useRef()
  useFrame((_, delta) => { if (groupRef.current) groupRef.current.rotation.y += delta * 0.4 })
  return (
    <group ref={groupRef}>
      {/* Crown */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 1.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Cusps */}
      {[[-0.2, 1.3, -0.2], [0.2, 1.3, 0.2], [-0.2, 1.3, 0.2], [0.2, 1.3, -0.2]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.2} />
        </mesh>
      ))}
      {/* Root */}
      <mesh position={[0, -0.7, 0]}>
        <coneGeometry args={[0.35, 1.4, 8]} />
        <meshStandardMaterial color="#d4c5a9" roughness={0.4} />
      </mesh>
      <mesh position={[0.15, -1.2, 0]}>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color="#d4c5a9" roughness={0.4} />
      </mesh>
      <mesh position={[-0.15, -1.2, 0]}>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color="#d4c5a9" roughness={0.4} />
      </mesh>
    </group>
  )
}

function Viewer3D({ color }) {
  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -2, -5]} intensity={0.3} color="#00c8d7" />
        <pointLight position={[0, 3, 0]} intensity={0.5} color="#1a6eb5" />
        <ToothModel color={color} />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
      </Canvas>
    </div>
  )
}

function STLDropZone({ label, category, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const onDrop = useCallback(async (files) => {
    const file = files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('fileType', 'stl')
    fd.append('category', category)
    try {
      const res = await api.post('/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onUploaded(res.data.data)
      toast.success(`${label} STL uploaded!`)
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }, [category, label, onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'model/stl': ['.stl'], 'application/octet-stream': ['.stl', '.obj'] }, multiple: false })

  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-cyan-400 bg-cyan-50 scale-[1.01]' : 'border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/50'}`}>
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 border-2 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"/><p className="text-cyan-500 text-sm">Uploading...</p></div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center"><Upload size={20} className="text-cyan-600"/></div>
          <p className="font-semibold text-gray-700 text-sm">{isDragActive ? 'Drop STL here!' : `Upload ${label} STL`}</p>
          <p className="text-gray-400 text-xs">Accepts .stl, .obj files</p>
        </div>
      )}
    </div>
  )
}

export default function PatientSTL() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('before')
  const [viewColor, setViewColor] = useState('#1a6eb5')

  useEffect(() => {
    api.get('/files').then(r => setFiles((r.data.data || []).filter(f => f.type === 'stl'))).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const handleUploaded = (file) => setFiles(prev => [...prev, file])
  const handleDelete = async (id) => {
    try { await api.delete(`/files/${id}`); setFiles(prev => prev.filter(f => f.id !== id)); toast.success('STL file deleted') } catch { toast.error('Delete failed') }
  }

  const tabFiles = files.filter(f => f.category === activeTab)

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="page-header">3D Dental Scans</h1>
          <p className="text-gray-500 text-sm mt-1">Upload STL files and view interactive 3D dental models</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 3D Viewer */}
          <div className="premium-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 font-display flex items-center gap-2"><Box size={18} className="text-primary-500"/> 3D Model Viewer</h2>
              <div className="flex items-center gap-2">
                {['#1a6eb5','#00c8d7','#6366f1','#10b981'].map(c => (
                  <button key={c} onClick={()=>setViewColor(c)} className={`w-6 h-6 rounded-full border-2 transition-all ${viewColor===c?'border-gray-400 scale-125':'border-transparent'}`} style={{backgroundColor:c}}/>
                ))}
                <button onClick={()=>setViewColor('#1a6eb5')} className="p-1 text-gray-400 hover:text-gray-600"><RotateCcw size={14}/></button>
              </div>
            </div>
            <Viewer3D color={viewColor}/>
            <p className="text-center text-gray-400 text-xs mt-3">🖱️ Click & drag to rotate • Scroll to zoom • Demo model shown</p>
          </div>

          {/* Upload & Files */}
          <div className="premium-card p-5 space-y-5">
            <h2 className="font-bold text-gray-900 font-display">Upload STL Files</h2>
            <div className="grid grid-cols-2 gap-4">
              <STLDropZone label="Before" category="before" onUploaded={handleUploaded}/>
              <STLDropZone label="After" category="after" onUploaded={handleUploaded}/>
            </div>
            <div>
              <div className="flex border border-gray-200 rounded-xl overflow-hidden mb-4">
                {['before','after'].map(t=>(
                  <button key={t} onClick={()=>setActiveTab(t)} className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab===t?'bg-primary-500 text-white':'text-gray-500 hover:bg-gray-50'}`}>
                    {t.charAt(0).toUpperCase()+t.slice(1)} ({files.filter(f=>f.category===t).length})
                  </button>
                ))}
              </div>
              {loading ? <div className="space-y-2">{[...Array(2)].map((_,i)=><div key={i} className="h-14 loading-shimmer rounded-xl"/>)}</div>
              : tabFiles.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
                  <Box size={28} className="text-gray-300 mx-auto mb-2"/>
                  <p className="text-gray-400 text-sm">No {activeTab} STL files uploaded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tabFiles.map(f => (
                    <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0"><Box size={18} className="text-cyan-600"/></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{f.name}</p>
                        <p className="text-gray-400 text-xs">{f.size} • {new Date(f.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={()=>handleDelete(f.id)} className="text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
