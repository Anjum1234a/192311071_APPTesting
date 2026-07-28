import { useState, useEffect } from 'react'
import { Brain, Zap, CheckCircle, Image, ChevronDown, Save } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const severityStyle = { improved: 'badge-green', monitoring: 'badge-yellow', healed: 'bg-cyan-100 text-cyan-700 badge' }

function ConfidenceRing({ value }) {
  const r = 54, c = 2 * Math.PI * r, offset = c - (value / 100) * c
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute -rotate-90" width="136" height="136">
        <circle cx="68" cy="68" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10"/>
        <circle cx="68" cy="68" r={r} fill="none" stroke="url(#docGrad)" strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{transition:'stroke-dashoffset 1.5s ease'}}/>
        <defs><linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#1a6eb5"/><stop offset="100%" stopColor="#00c8d7"/></linearGradient></defs>
      </svg>
      <div className="text-center z-10">
        <span className="text-2xl font-black font-display gradient-text">{value}%</span>
        <p className="text-gray-500 text-[10px] font-medium">Confidence</p>
      </div>
    </div>
  )
}

export default function DoctorAIAnalysis() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [files, setFiles] = useState([])
  const [reports, setReports] = useState([])
  const [selectedBefore, setSelectedBefore] = useState('')
  const [selectedAfter, setSelectedAfter] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressStep, setProgressStep] = useState(0)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)

  const steps = ['Loading images...', 'Preprocessing scans...', 'Running AI model...', 'Generating report...']

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data.data || [])).catch(()=>{})
    api.get('/ai/reports').then(r => setReports(r.data.data || [])).catch(()=>{})
  }, [])

  const loadFiles = async (pid) => {
    if (!pid) return
    try {
      const r = await api.get(`/files/${pid}`)
      setFiles((r.data.data || []).filter(f => f.type === 'xray'))
    } catch {}
  }

  const handlePatientChange = (pid) => {
    setSelectedPatient(pid)
    setFiles([])
    setResult(null)
    setSelectedBefore('')
    setSelectedAfter('')
    loadFiles(pid)
  }

  const runAnalysis = async () => {
    setAnalyzing(true); setResult(null); setProgress(0); setProgressStep(0)
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 800))
      setProgress((i + 1) * 25)
      setProgressStep(i + 1)
    }
    try {
      const beforeFile = files.find(f => f.id === selectedBefore)
      const afterFile = files.find(f => f.id === selectedAfter)
      const res = await api.post('/ai/compare', {
        beforeFileId: selectedBefore, afterFileId: selectedAfter,
        beforeUrl: beforeFile?.url || 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800',
        afterUrl: afterFile?.url || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
        patientId: selectedPatient || 'demo-patient-001',
      })
      setResult(res.data.data)
      setReports(prev => [res.data.data, ...prev])
      toast.success('AI analysis complete!')
    } catch { toast.error('Analysis failed') }
    finally { setAnalyzing(false) }
  }

  const saveReport = async () => {
    if (!result) return
    setSaving(true)
    try {
      const patient = patients.find(p => p.uid === selectedPatient)
      await api.post('/reports/generate', {
        patientId: result.patientId, patientName: patient?.name,
        title: `AI Treatment Report – ${new Date().toLocaleDateString()}`,
        summary: `AI analysis completed with ${result.confidence}% confidence. Overall progress: ${result.overallProgress}.`,
        findings: result.findings?.map(f => `${f.area}: ${f.change}`),
        recommendations: result.recommendations,
        aiConfidence: result.confidence,
      })
      toast.success('Report saved successfully!')
    } catch { toast.error('Failed to save report') }
    finally { setSaving(false) }
  }

  const beforeFiles = files.filter(f => f.category === 'before')
  const afterFiles = files.filter(f => f.category === 'after')
  const patientReports = reports.filter(r => !selectedPatient || r.patientId === selectedPatient)

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="page-header">AI X-Ray Analysis</h1>
          <p className="text-gray-500 text-sm mt-1">Run AI-powered treatment comparison for any patient</p>
        </div>

        {/* Setup */}
        <div className="premium-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center"><Brain size={20} className="text-indigo-600"/></div>
            <div><h2 className="font-bold text-gray-900 font-display">Configure Analysis</h2><p className="text-gray-400 text-sm">Select patient and X-ray files</p></div>
          </div>
          <div>
            <label className="form-label">Patient</label>
            <div className="relative">
              <select className="form-input appearance-none pr-10" value={selectedPatient} onChange={e=>handlePatientChange(e.target.value)}>
                <option value="">Select patient...</option>
                {patients.map(p=><option key={p.uid} value={p.uid}>{p.name}</option>)}
                <option value="demo-patient-001">📋 Demo Patient</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Before X-Ray</label>
              <select className="form-input" value={selectedBefore} onChange={e=>setSelectedBefore(e.target.value)}>
                <option value="">Select before X-ray...</option>
                {beforeFiles.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                <option value="demo">Use demo image</option>
              </select>
            </div>
            <div>
              <label className="form-label">After X-Ray</label>
              <select className="form-input" value={selectedAfter} onChange={e=>setSelectedAfter(e.target.value)}>
                <option value="">Select after X-ray...</option>
                {afterFiles.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                <option value="demo">Use demo image</option>
              </select>
            </div>
          </div>
          <button onClick={runAnalysis} disabled={analyzing} className="btn-primary">
            {analyzing?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Analyzing...</>:<><Zap size={16}/>Run AI Analysis</>}
          </button>
        </div>

        {/* Progress */}
        {analyzing && (
          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Brain size={20} className="text-indigo-500 animate-pulse"/>
              <span className="font-semibold text-gray-800">{steps[Math.min(progressStep-1, 3)] || steps[0]}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary-500 to-cyan-400 rounded-full transition-all duration-700" style={{width:`${progress}%`}}/></div>
            <div className="flex gap-2">
              {steps.map((s,i) => (
                <div key={i} className="flex-1 text-center">
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-bold ${i<progressStep?'bg-primary-500 text-white':i===progressStep-1?'bg-cyan-400 text-white animate-pulse':'bg-gray-200 text-gray-400'}`}>{i+1}</div>
                  <p className="text-xs text-gray-400 hidden sm:block">{s.split('...')[0]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2"><CheckCircle size={20} className="text-green-500"/><h2 className="font-bold text-gray-900 font-display">Analysis Complete</h2></div>
                <button onClick={saveReport} disabled={saving} className="btn-secondary text-sm py-2">
                  {saving?<><div className="w-4 h-4 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin"/>Saving...</>:<><Save size={14}/>Save Report</>}
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-6 items-center">
                <div className="flex justify-center"><ConfidenceRing value={result.confidence}/></div>
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-4 py-2 rounded-xl font-bold text-sm ${result.overallProgress==='Excellent'?'bg-green-100 text-green-700':result.overallProgress==='Good'?'bg-blue-100 text-blue-700':'bg-yellow-100 text-yellow-700'}`}>{result.overallProgress} Progress</span>
                    <span className="text-gray-500 text-sm">Effectiveness: <strong>{result.treatmentEffectiveness}%</strong></span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 font-medium">Treatment Effectiveness</span><span className="gradient-text font-bold">{result.treatmentEffectiveness}%</span></div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary-500 to-cyan-400 rounded-full" style={{width:`${result.treatmentEffectiveness}%`}}/></div>
                  </div>
                  <ul className="space-y-1.5">
                    {result.recommendations?.map((r,i)=><li key={i} className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0"/>{r}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* Findings Table */}
            <div className="premium-card p-6">
              <h3 className="font-bold text-gray-900 mb-4 font-display">Detailed Findings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="text-left pb-3">Area</th><th className="text-left pb-3">Change Detected</th><th className="text-left pb-3">Severity</th><th className="text-left pb-3">Confidence</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {result.findings?.map((f,i)=>(
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 font-semibold text-gray-800">{f.area}</td>
                        <td className="py-3 text-gray-500">{f.change}</td>
                        <td className="py-3"><span className={severityStyle[f.severity]||'badge-gray'}>{f.severity}</span></td>
                        <td className="py-3 font-bold gradient-text">{f.confidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {patientReports.length > 0 && (
          <div className="premium-card p-6">
            <h2 className="font-bold text-gray-900 mb-4 font-display">Analysis History</h2>
            <div className="space-y-3">
              {patientReports.slice(0,5).map(r=>(
                <div key={r.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors" onClick={()=>setResult(r)}>
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><Brain size={16} className="text-indigo-600"/></div>
                  <div className="flex-1"><p className="font-semibold text-gray-800 text-sm">Patient Analysis Report</p><p className="text-gray-400 text-xs">{new Date(r.generatedAt).toLocaleDateString()}</p></div>
                  <div className="text-right"><p className="font-bold gradient-text">{r.confidence}%</p><p className="text-xs text-gray-400">confidence</p></div>
                  <span className={`badge ${r.overallProgress==='Excellent'?'badge-green':'badge-blue'}`}>{r.overallProgress}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
