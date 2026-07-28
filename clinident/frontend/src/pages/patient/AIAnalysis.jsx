import { useState, useEffect } from 'react'
import { Brain, Image, Zap, CheckCircle, AlertCircle, TrendingUp, X } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const severityStyle = { improved: 'badge-green', monitoring: 'badge-yellow', healed: 'bg-cyan-100 text-cyan-700 badge' }

function ConfidenceRing({ value }) {
  const r = 54, c = 2 * Math.PI * r, offset = c - (value / 100) * c
  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg className="absolute -rotate-90" width="140" height="140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10"/>
        <circle cx="70" cy="70" r={r} fill="none" stroke="url(#grad)" strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease' }}/>
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a6eb5"/><stop offset="100%" stopColor="#00c8d7"/>
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10">
        <span className="text-3xl font-black font-display gradient-text">{value}%</span>
        <p className="text-gray-500 text-xs font-medium">Confidence</p>
      </div>
    </div>
  )
}

export default function PatientAIAnalysis() {
  const [files, setFiles] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedBefore, setSelectedBefore] = useState('')
  const [selectedAfter, setSelectedAfter] = useState('')
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    Promise.all([
      api.get('/files').then(r => setFiles((r.data.data || []).filter(f => f.type === 'xray'))),
      api.get('/ai/reports').then(r => setReports(r.data.data || [])),
    ]).finally(() => setLoading(false))
  }, [])

  const runAnalysis = async () => {
    if (!selectedBefore && !selectedAfter) return toast.error('Please select at least one X-ray file, or use demo mode')
    setAnalyzing(true)
    setResult(null)
    setProgress(0)
    const steps = [25, 50, 75, 100]
    for (const s of steps) {
      await new Promise(r => setTimeout(r, 700))
      setProgress(s)
    }
    try {
      const beforeFile = files.find(f => f.id === selectedBefore)
      const afterFile = files.find(f => f.id === selectedAfter)
      const res = await api.post('/ai/compare', {
        beforeFileId: selectedBefore,
        afterFileId: selectedAfter,
        beforeUrl: beforeFile?.url || 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800',
        afterUrl: afterFile?.url || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
      })
      setResult(res.data.data)
      setReports(prev => [res.data.data, ...prev])
      toast.success('AI analysis complete!')
    } catch { toast.error('Analysis failed') }
    finally { setAnalyzing(false) }
  }

  const beforeFiles = files.filter(f => f.category === 'before')
  const afterFiles = files.filter(f => f.category === 'after')
  const progressLabels = ['Loading images...', 'Preprocessing...', 'Running AI...', 'Generating report...']

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="page-header">AI Treatment Analysis</h1>
          <p className="text-gray-500 text-sm mt-1">Compare before and after X-rays using our AI engine</p>
        </div>

        {/* Setup Card */}
        <div className="premium-card p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center"><Brain size={20} className="text-indigo-600"/></div>
            <div><h2 className="font-bold text-gray-900 font-display">Select X-Rays for Analysis</h2><p className="text-gray-400 text-sm">Choose before and after images to compare</p></div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="form-label">Before Treatment X-Ray</label>
              <select className="form-input" value={selectedBefore} onChange={e => setSelectedBefore(e.target.value)}>
                <option value="">Select before X-ray...</option>
                {beforeFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                <option value="demo-before">📷 Use Demo Image</option>
              </select>
            </div>
            <div>
              <label className="form-label">After Treatment X-Ray</label>
              <select className="form-input" value={selectedAfter} onChange={e => setSelectedAfter(e.target.value)}>
                <option value="">Select after X-ray...</option>
                {afterFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                <option value="demo-after">📷 Use Demo Image</option>
              </select>
            </div>
          </div>
          <button onClick={runAnalysis} disabled={analyzing} className="btn-primary">
            {analyzing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Analyzing...</> : <><Zap size={16}/>Run AI Analysis</>}
          </button>
        </div>

        {/* Progress */}
        {analyzing && (
          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center"><Brain size={16} className="text-indigo-600 animate-pulse"/></div>
              <span className="font-semibold text-gray-800">{progressLabels[Math.floor((progress / 100) * 4) - 1] || progressLabels[0]}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}/>
            </div>
            <p className="text-gray-400 text-sm text-right">{progress}% complete</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="premium-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle size={20} className="text-green-500"/>
                <h2 className="font-bold text-gray-900 font-display">Analysis Results</h2>
                <span className={`ml-auto badge ${result.overallProgress==='Excellent'?'badge-green':result.overallProgress==='Good'?'badge-blue':'badge-yellow'}`}>{result.overallProgress}</span>
              </div>
              <div className="grid md:grid-cols-3 gap-6 items-center">
                <div className="flex justify-center"><ConfidenceRing value={result.confidence}/></div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-medium"><span className="text-gray-700">Treatment Effectiveness</span><span className="gradient-text font-bold">{result.treatmentEffectiveness}%</span></div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-cyan-400 rounded-full" style={{ width: `${result.treatmentEffectiveness}%` }}/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {result.recommendations?.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0"/>
                        <span className="text-gray-600 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="premium-card p-6">
              <h3 className="font-bold text-gray-900 mb-4 font-display">Detailed Findings</h3>
              <div className="space-y-3">
                {result.findings?.map((f, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0"><Image size={14} className="text-primary-600"/></div>
                    <div className="flex-1 min-w-0"><p className="font-semibold text-gray-900 text-sm">{f.area}</p><p className="text-gray-500 text-xs truncate">{f.change}</p></div>
                    <span className={severityStyle[f.severity] || 'badge-gray'}>{f.severity}</span>
                    <span className="text-gray-400 text-xs font-medium ml-2">{f.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {!loading && reports.length > 0 && (
          <div className="premium-card p-6">
            <h2 className="font-bold text-gray-900 mb-4 font-display">Analysis History</h2>
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={()=>setResult(r)}>
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><Brain size={16} className="text-indigo-600"/></div>
                  <div className="flex-1"><p className="font-semibold text-gray-800 text-sm">AI Analysis Report</p><p className="text-gray-400 text-xs">{new Date(r.generatedAt).toLocaleDateString()}</p></div>
                  <div className="text-right"><p className="font-bold gradient-text">{r.confidence}%</p><p className="text-gray-400 text-xs">confidence</p></div>
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
