import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, Brain, CheckCircle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'

function downloadPDF(report) {
  const doc = new jsPDF()
  const pageW = doc.internal.pageSize.getWidth()

  // Header bar
  doc.setFillColor(26, 110, 181)
  doc.rect(0, 0, pageW, 30, 'F')
  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('CLINIDENT', 15, 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Smart Dental Clinic Management', 15, 20)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageW - 15, 12, { align: 'right' })

  // Title
  doc.setFontSize(16)
  doc.setTextColor(26, 110, 181)
  doc.setFont('helvetica', 'bold')
  doc.text(report.title || 'Treatment Report', 15, 45)

  // Patient info
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(`Patient: ${report.patientName || 'N/A'}`, 15, 55)
  doc.text(`Doctor: ${report.doctorName || 'N/A'}`, 15, 62)
  doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, 15, 69)
  if (report.aiConfidence) doc.text(`AI Confidence: ${report.aiConfidence}%`, 15, 76)

  // Divider
  doc.setDrawColor(0, 200, 215)
  doc.setLineWidth(0.5)
  doc.line(15, 82, pageW - 15, 82)

  // Summary
  let y = 92
  if (report.summary) {
    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', 15, y); y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    const lines = doc.splitTextToSize(report.summary, pageW - 30)
    doc.text(lines, 15, y); y += lines.length * 6 + 6
  }

  // Findings
  if (report.findings?.length) {
    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'bold')
    doc.text('Findings', 15, y); y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    report.findings.forEach(f => { doc.text(`• ${f}`, 20, y); y += 7 })
    y += 3
  }

  // Recommendations
  if (report.recommendations?.length) {
    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'bold')
    doc.text('Recommendations', 15, y); y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    report.recommendations.forEach(r => { doc.text(`✓ ${r}`, 20, y); y += 7 })
  }

  // Footer
  const pageH = doc.internal.pageSize.getHeight()
  doc.setFillColor(240, 247, 255)
  doc.rect(0, pageH - 18, pageW, 18, 'F')
  doc.setFontSize(8)
  doc.setTextColor(130, 130, 130)
  doc.text('Clinident – Smart Dental Clinic Management | clinident.com | Confidential Medical Record', pageW / 2, pageH - 7, { align: 'center' })

  doc.save(`Clinident_Report_${report.id || 'report'}.pdf`)
  toast.success('PDF downloaded!')
}

export default function PatientReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports').then(r => setReports(r.data.data || [])).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="page-header">Treatment Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Download your AI-generated treatment progress reports</p>
        </div>

        {loading ? (
          <div className="grid gap-4">{[...Array(2)].map((_,i)=><div key={i} className="h-40 loading-shimmer rounded-2xl"/>)}</div>
        ) : reports.length === 0 ? (
          <div className="premium-card p-16 text-center">
            <FileText size={48} className="text-gray-300 mx-auto mb-4"/>
            <h3 className="text-xl font-bold text-gray-800 font-display mb-2">No reports yet</h3>
            <p className="text-gray-400">Run an AI analysis to generate your first treatment report.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {reports.map(report => (
              <div key={report.id} className="premium-card p-6 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FileText size={24} className="text-white"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900 font-display">{report.title}</h3>
                      {report.aiConfidence && (
                        <span className="badge badge-blue flex items-center gap-1">
                          <Brain size={10}/>AI: {report.aiConfidence}%
                        </span>
                      )}
                      <span className={`badge ${report.status==='final'?'badge-green':'badge-yellow'}`}>{report.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
                      <span className="flex items-center gap-1"><Calendar size={11}/>{new Date(report.createdAt).toLocaleDateString()}</span>
                      {report.doctorName && <span>by {report.doctorName}</span>}
                    </div>
                    {report.summary && <p className="text-gray-500 text-sm mb-3 leading-relaxed">{report.summary}</p>}
                    {report.findings?.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {report.findings.slice(0,3).map((f,i) => (
                          <div key={i} className="flex items-start gap-2"><CheckCircle size={13} className="text-green-500 mt-0.5 flex-shrink-0"/><span className="text-gray-600 text-sm">{f}</span></div>
                        ))}
                        {report.findings.length > 3 && <p className="text-gray-400 text-xs">+{report.findings.length-3} more findings</p>}
                      </div>
                    )}
                  </div>
                  <button onClick={() => downloadPDF(report)} className="btn-primary self-start sm:self-center whitespace-nowrap">
                    <Download size={15}/> Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
