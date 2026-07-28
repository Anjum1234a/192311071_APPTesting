import { useState, useEffect } from 'react'
import { FileText, Plus, Download, Calendar, Brain, CheckCircle, X, ChevronDown } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'

function downloadPDF(report) {
  const doc = new jsPDF()
  const pw = doc.internal.pageSize.getWidth()
  // Header
  doc.setFillColor(26, 110, 181)
  doc.rect(0, 0, pw, 35, 'F')
  doc.setFillColor(0, 200, 215)
  doc.rect(0, 30, pw, 5, 'F')
  doc.setFontSize(22)
  doc.setTextColor(255,255,255)
  doc.setFont('helvetica','bold')
  doc.text('CLINIDENT', 15, 14)
  doc.setFontSize(9)
  doc.setFont('helvetica','normal')
  doc.text('Smart Dental Clinic Management System', 15, 22)
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pw-15, 14, {align:'right'})
  doc.text(`Ref: ${report.id?.slice(0,8) || 'RPT'}`, pw-15, 22, {align:'right'})
  // Report title
  doc.setFontSize(16)
  doc.setTextColor(26,110,181)
  doc.setFont('helvetica','bold')
  doc.text(report.title || 'Treatment Progress Report', 15, 50)
  // Info grid
  doc.setFontSize(10)
  doc.setTextColor(80,80,80)
  doc.setFont('helvetica','normal')
  const info = [['Patient:', report.patientName||'N/A'],['Doctor:', report.doctorName||'N/A'],['Type:', report.type||'Progress'],['Status:', report.status||'Final']]
  info.forEach(([k,v],i) => { doc.setFont('helvetica','bold'); doc.text(k,15,62+i*8); doc.setFont('helvetica','normal'); doc.text(v,60,62+i*8) })
  if (report.aiConfidence) { doc.setFont('helvetica','bold'); doc.text('AI Confidence:',15,62+info.length*8); doc.setFont('helvetica','normal'); doc.setTextColor(0,200,215); doc.text(`${report.aiConfidence}%`,60,62+info.length*8) }
  // Divider
  doc.setDrawColor(0,200,215); doc.setLineWidth(1); doc.line(15, 105, pw-15, 105)
  let y = 115
  // Summary
  if (report.summary) {
    doc.setFontSize(12); doc.setTextColor(26,110,181); doc.setFont('helvetica','bold'); doc.text('SUMMARY', 15, y); y+=7
    doc.setFontSize(10); doc.setTextColor(60,60,60); doc.setFont('helvetica','normal')
    const lines = doc.splitTextToSize(report.summary, pw-30); doc.text(lines,15,y); y+=lines.length*6+8
  }
  // Findings
  if (report.findings?.length) {
    doc.setFontSize(12); doc.setTextColor(26,110,181); doc.setFont('helvetica','bold'); doc.text('FINDINGS', 15, y); y+=7
    doc.setFontSize(10); doc.setTextColor(60,60,60); doc.setFont('helvetica','normal')
    report.findings.forEach(f => { doc.text(`• ${f}`, 20, y); y+=7 }); y+=3
  }
  // Recommendations
  if (report.recommendations?.length) {
    doc.setFontSize(12); doc.setTextColor(26,110,181); doc.setFont('helvetica','bold'); doc.text('RECOMMENDATIONS', 15, y); y+=7
    doc.setFontSize(10); doc.setTextColor(60,60,60); doc.setFont('helvetica','normal')
    report.recommendations.forEach(r => { doc.text(`✓ ${r}`, 20, y); y+=7 })
  }
  // Footer
  const ph = doc.internal.pageSize.getHeight()
  doc.setFillColor(240,247,255); doc.rect(0,ph-20,pw,20,'F')
  doc.setFontSize(8); doc.setTextColor(130,130,130)
  doc.text('CLINIDENT – Smart Dental Clinic | clinident.com | This is a confidential medical document', pw/2, ph-10, {align:'center'})
  doc.save(`Clinident_Report_${(report.id||'report').slice(0,8)}.pdf`)
  toast.success('PDF report downloaded!')
}

function GenerateModal({ patients, onGenerated, onClose }) {
  const [form, setForm] = useState({ patientId:'', title:'', summary:'', findingInput:'', findings:[], recInput:'', recommendations:[], aiConfidence:'' })
  const [submitting, setSubmitting] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const addFinding = () => { if (!form.findingInput.trim()) return; set('findings',[...form.findings,form.findingInput.trim()]); set('findingInput','') }
  const addRec = () => { if (!form.recInput.trim()) return; set('recommendations',[...form.recommendations,form.recInput.trim()]); set('recInput','') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const patient = patients.find(p=>p.uid===form.patientId)
      const res = await api.post('/reports/generate', { ...form, patientName: patient?.name, aiConfidence: form.aiConfidence ? Number(form.aiConfidence) : null })
      onGenerated(res.data.data)
      toast.success('Report generated!')
      onClose()
    } catch { toast.error('Failed to generate report') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold font-display text-gray-900">Generate Report</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="form-label">Patient</label>
            <div className="relative">
              <select className="form-input appearance-none pr-10" value={form.patientId} onChange={e=>set('patientId',e.target.value)} required>
                <option value="">Select patient...</option>
                {patients.map(p=><option key={p.uid} value={p.uid}>{p.name}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
          </div>
          <div><label className="form-label">Report Title</label><input className="form-input" placeholder="e.g. Treatment Progress Report – June 2026" value={form.title} onChange={e=>set('title',e.target.value)} required/></div>
          <div><label className="form-label">AI Confidence Score (optional)</label><input type="number" min="0" max="100" step="0.1" className="form-input" placeholder="e.g. 94.7" value={form.aiConfidence} onChange={e=>set('aiConfidence',e.target.value)}/></div>
          <div><label className="form-label">Summary</label><textarea className="form-input resize-none" rows={3} placeholder="Overall treatment summary..." value={form.summary} onChange={e=>set('summary',e.target.value)}/></div>
          <div>
            <label className="form-label">Findings</label>
            <div className="flex gap-2 mb-2"><input className="form-input flex-1" placeholder="Add finding..." value={form.findingInput} onChange={e=>set('findingInput',e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addFinding()}}}/><button type="button" onClick={addFinding} className="btn-secondary py-2 px-3">Add</button></div>
            {form.findings.map((f,i)=><div key={i} className="flex items-center gap-2 mb-1"><CheckCircle size={13} className="text-green-500"/><span className="text-sm text-gray-700 flex-1">{f}</span><button type="button" onClick={()=>set('findings',form.findings.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600"><X size={12}/></button></div>)}
          </div>
          <div>
            <label className="form-label">Recommendations</label>
            <div className="flex gap-2 mb-2"><input className="form-input flex-1" placeholder="Add recommendation..." value={form.recInput} onChange={e=>set('recInput',e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addRec()}}}/><button type="button" onClick={addRec} className="btn-secondary py-2 px-3">Add</button></div>
            {form.recommendations.map((r,i)=><div key={i} className="flex items-center gap-2 mb-1"><CheckCircle size={13} className="text-blue-500"/><span className="text-sm text-gray-700 flex-1">{r}</span><button type="button" onClick={()=>set('recommendations',form.recommendations.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600"><X size={12}/></button></div>)}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Generating...</>:<><FileText size={15}/>Generate</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DoctorReports() {
  const [reports, setReports] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/reports').then(r=>setReports(r.data.data||[])),
      api.get('/patients').then(r=>setPatients(r.data.data||[])),
    ]).finally(()=>setLoading(false))
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h1 className="page-header">Treatment Reports</h1><p className="text-gray-500 text-sm mt-1">{reports.length} reports generated</p></div>
          <button onClick={()=>setShowModal(true)} className="btn-primary"><Plus size={16}/>Generate Report</button>
        </div>

        {loading ? (
          <div className="grid gap-4">{[...Array(3)].map((_,i)=><div key={i} className="h-40 loading-shimmer rounded-2xl"/>)}</div>
        ) : reports.length === 0 ? (
          <div className="premium-card p-16 text-center">
            <FileText size={48} className="text-gray-300 mx-auto mb-4"/>
            <h3 className="text-xl font-bold text-gray-800 font-display mb-2">No reports yet</h3>
            <p className="text-gray-400 mb-6">Generate your first treatment report for a patient.</p>
            <button onClick={()=>setShowModal(true)} className="btn-primary"><Plus size={16}/>Generate Report</button>
          </div>
        ) : (
          <div className="grid gap-5">
            {reports.map(report=>(
              <div key={report.id} className="premium-card p-6 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0"><FileText size={24} className="text-white"/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 font-display">{report.title}</h3>
                      {report.aiConfidence&&<span className="badge badge-blue flex items-center gap-1"><Brain size={10}/>AI: {report.aiConfidence}%</span>}
                      <span className={`badge ${report.status==='final'?'badge-green':'badge-yellow'}`}>{report.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
                      <span className="flex items-center gap-1"><Calendar size={11}/>{new Date(report.createdAt).toLocaleDateString()}</span>
                      {report.patientName&&<span>Patient: {report.patientName}</span>}
                    </div>
                    {report.summary&&<p className="text-gray-500 text-sm mb-3 leading-relaxed">{report.summary}</p>}
                    {report.findings?.slice(0,3).map((f,i)=><div key={i} className="flex items-start gap-2 mb-1"><CheckCircle size={13} className="text-green-500 mt-0.5 flex-shrink-0"/><span className="text-gray-600 text-sm">{f}</span></div>)}
                    {report.findings?.length > 3 && <p className="text-gray-400 text-xs">+{report.findings.length-3} more findings</p>}
                  </div>
                  <button onClick={()=>downloadPDF(report)} className="btn-primary self-start sm:self-center whitespace-nowrap"><Download size={15}/>Download PDF</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <GenerateModal patients={patients} onGenerated={r=>setReports(prev=>[r,...prev])} onClose={()=>setShowModal(false)}/>}
    </DashboardLayout>
  )
}
