import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Mic, MicOff, Square, Play, Trash2, Save, Download,
  User, ChevronDown, RotateCcw, Copy, CheckCircle,
  Volume2, AlertCircle, FileText, Clock, Sparkles
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'

/* ─── Web Speech API helpers ─────────────────────────────────────────────── */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const supported = !!SpeechRecognition

/* ─── SOAP field configuration ───────────────────────────────────────────── */
const SOAP_FIELDS = [
  {
    key: 'subjective',
    label: 'S — Subjective',
    short: 'Subjective',
    color: 'from-blue-500 to-primary-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-700',
    ringColor: '#3b82f6',
    placeholder: "Patient's chief complaint, reported symptoms, pain level, duration, history in their own words…\n\nExample: Patient reports persistent dull ache in upper-left molar for 3 days, rated 6/10. Worsens with cold drinks. No prior treatment.",
    prompt: "Start speaking the patient's subjective complaints…"
  },
  {
    key: 'objective',
    label: 'O — Objective',
    short: 'Objective',
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badgeClass: 'bg-teal-100 text-teal-700',
    ringColor: '#14b8a6',
    placeholder: "Clinical findings, exam observations, X-ray readings, measurements, vitals…\n\nExample: Tooth #14 shows periapical radiolucency on CBCT. Percussion test positive. Probing depth 4 mm buccal. Cold test: prolonged response.",
    prompt: "Dictate your clinical examination findings…"
  },
  {
    key: 'assessment',
    label: 'A — Assessment',
    short: 'Assessment',
    color: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badgeClass: 'bg-indigo-100 text-indigo-700',
    ringColor: '#6366f1',
    placeholder: "Diagnosis, differential diagnosis, clinical interpretation…\n\nExample: Irreversible pulpitis with periapical periodontitis on tooth #14. Rule out vertical root fracture.",
    prompt: "State your diagnosis and assessment…"
  },
  {
    key: 'plan',
    label: 'P — Plan',
    short: 'Plan',
    color: 'from-green-500 to-teal-400',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badgeClass: 'bg-green-100 text-green-700',
    ringColor: '#22c55e',
    placeholder: "Treatment plan, medications prescribed, follow-up instructions, referrals…\n\nExample: Initiate root canal therapy on #14. Prescribe amoxicillin 500 mg TID × 7 days and ibuprofen 400 mg PRN. Follow-up in 1 week. Refer to endodontist if symptoms persist.",
    prompt: "Dictate the treatment plan and next steps…"
  }
]

/* ─── Animated microphone waveform ───────────────────────────────────────── */
function Waveform({ active, color }) {
  const bars = 9
  return (
    <div className="flex items-center justify-center gap-[3px] h-8" aria-hidden>
      {[...Array(bars)].map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: '3px',
            backgroundColor: color,
            height: active
              ? `${Math.max(6, Math.sin((i / bars) * Math.PI) * 28 + Math.random() * 8)}px`
              : '6px',
            animation: active ? `waveBar ${0.5 + (i % 3) * 0.15}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.06}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Individual SOAP section ────────────────────────────────────────────── */
function SOAPSection({ field, value, onChange, activeField, onStartListen, onStopListen, interimText }) {
  const isActive = activeField === field.key
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef(null)

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value, interimText])

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <div className={`premium-card overflow-hidden transition-all duration-300 ${isActive ? 'ring-2' : ''}`}
      style={isActive ? { boxShadow: `0 0 0 2px ${field.ringColor}40, 0 8px 40px ${field.ringColor}20` } : {}}>

      {/* Section header */}
      <div className={`px-5 py-4 flex items-center justify-between ${field.bg} border-b ${field.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${field.color} flex items-center justify-center shadow-sm`}>
            <FileText size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 font-display text-sm">{field.label}</h3>
            <p className="text-xs text-gray-500">{wordCount} word{wordCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {value && (
            <button onClick={handleCopy} title="Copy to clipboard"
              className="p-2 rounded-lg hover:bg-white/60 transition-colors text-gray-500 hover:text-gray-700">
              {copied ? <CheckCircle size={15} className="text-green-500" /> : <Copy size={15} />}
            </button>
          )}
          {value && (
            <button onClick={() => onChange(field.key, '')} title="Clear"
              className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500">
              <RotateCcw size={15} />
            </button>
          )}

          {/* Mic button */}
          {supported ? (
            <button
              onClick={() => isActive ? onStopListen() : onStartListen(field.key)}
              title={isActive ? 'Stop recording' : 'Start voice dictation'}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-105'
                  : `bg-gradient-to-br ${field.color} text-white hover:scale-105 shadow-sm`
              }`}>
              {isActive ? <MicOff size={15} /> : <Mic size={15} />}
              {isActive ? 'Stop' : 'Dictate'}
            </button>
          ) : (
            <span className="text-xs text-gray-400 italic">Voice N/A</span>
          )}
        </div>
      </div>

      {/* Active recording indicator */}
      {isActive && (
        <div className={`px-5 py-2 ${field.bg} border-b ${field.border} flex items-center gap-3`}>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <Waveform active={true} color={field.ringColor} />
          <span className="text-xs font-medium text-gray-600 flex-1">{field.prompt}</span>
        </div>
      )}

      {/* Interim transcript badge */}
      {isActive && interimText && (
        <div className={`mx-5 mt-3 px-3 py-2 rounded-lg ${field.bg} border ${field.border}`}>
          <p className="text-xs text-gray-500 font-medium mb-0.5">Hearing:</p>
          <p className="text-sm text-gray-700 italic leading-relaxed">{interimText}</p>
        </div>
      )}

      {/* Textarea */}
      <div className="p-5">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className={`w-full min-h-[130px] resize-none border rounded-xl p-4 text-sm text-gray-800 leading-relaxed
            placeholder:text-gray-300 focus:outline-none transition-all duration-200 font-sans
            ${isActive
              ? `border-2 bg-white`
              : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-white focus:border-primary-400 focus:bg-white'
            }`}
          style={isActive ? { borderColor: field.ringColor, boxShadow: `0 0 0 3px ${field.ringColor}15` } : {}}
        />
      </div>
    </div>
  )
}

/* ─── PDF export ─────────────────────────────────────────────────────────── */
function exportPDF(soap, patient, doctorName) {
  const doc = new jsPDF()
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()

  // Header gradient bar
  doc.setFillColor(26, 110, 181)
  doc.rect(0, 0, pw, 30, 'F')
  doc.setFillColor(0, 200, 215)
  doc.rect(0, 26, pw, 4, 'F')

  doc.setFontSize(20); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold')
  doc.text('CLINIDENT', 15, 13)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  doc.text('SOAP Note — Smart Dental Clinic', 15, 21)
  doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pw - 15, 13, { align: 'right' })
  doc.text(`Time: ${new Date().toLocaleTimeString()}`, pw - 15, 21, { align: 'right' })

  // Patient / Doctor info box
  doc.setFillColor(240, 247, 255)
  doc.rect(15, 38, pw - 30, 24, 'F')
  doc.setFontSize(10); doc.setTextColor(26, 110, 181); doc.setFont('helvetica', 'bold')
  doc.text('SOAP NOTE', 20, 47)
  doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60)
  doc.setFontSize(9)
  doc.text(`Patient: ${patient || 'N/A'}`, 20, 55)
  doc.text(`Attending: ${doctorName || 'N/A'}`, pw / 2 + 5, 55)

  // Divider
  doc.setDrawColor(0, 200, 215); doc.setLineWidth(0.7)
  doc.line(15, 68, pw - 15, 68)

  let y = 78
  const soapLabels = [
    { key: 'subjective', label: 'S — SUBJECTIVE', color: [59, 130, 246] },
    { key: 'objective', label: 'O — OBJECTIVE', color: [20, 184, 166] },
    { key: 'assessment', label: 'A — ASSESSMENT', color: [99, 102, 241] },
    { key: 'plan', label: 'P — PLAN', color: [34, 197, 94] },
  ]

  for (const { key, label, color } of soapLabels) {
    const text = soap[key]?.trim() || '(Not recorded)'

    // Section header
    doc.setFillColor(...color)
    doc.rect(15, y - 5, 4, 14, 'F')
    doc.setFontSize(11); doc.setTextColor(...color); doc.setFont('helvetica', 'bold')
    doc.text(label, 22, y + 4)
    y += 12

    // Content
    doc.setFontSize(10); doc.setTextColor(50, 50, 50); doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(text, pw - 40)
    // Page break check
    if (y + lines.length * 6 + 10 > ph - 25) {
      doc.addPage()
      y = 20
    }
    doc.text(lines, 22, y)
    y += lines.length * 6 + 12

    // Subtle separator
    doc.setDrawColor(230, 230, 230); doc.setLineWidth(0.3)
    doc.line(15, y - 3, pw - 15, y - 3)
    y += 5
  }

  // Footer
  doc.setFillColor(240, 247, 255)
  doc.rect(0, ph - 16, pw, 16, 'F')
  doc.setFontSize(8); doc.setTextColor(130, 130, 130); doc.setFont('helvetica', 'normal')
  doc.text('Clinident – Smart Dental Clinic | clinident.com | Confidential Medical Record – Not for distribution', pw / 2, ph - 6, { align: 'center' })

  doc.save(`SOAP_Note_${(patient || 'patient').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
  toast.success('SOAP Note PDF exported!')
}

/* ─── Saved note card ────────────────────────────────────────────────────── */
function SavedNoteCard({ note, onSelect }) {
  const preview = note.subjective?.slice(0, 80) || note.objective?.slice(0, 80) || '—'
  return (
    <div
      className="premium-card p-4 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(note)}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-gray-900 text-sm font-display truncate">
              {note.patientName || 'Unknown Patient'}
            </p>
            <span className="badge bg-primary-100 text-primary-700 text-xs">{note.type || 'SOAP'}</span>
          </div>
          <p className="text-gray-400 text-xs truncate">{preview}…</p>
          <div className="flex items-center gap-3 mt-2 text-gray-400 text-xs">
            <span className="flex items-center gap-1"><Clock size={10} />{new Date(note.createdAt).toLocaleDateString()}</span>
            {note.doctorName && <span>by {note.doctorName}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function DoctorSOAPNotes() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [soap, setSoap] = useState({ subjective: '', objective: '', assessment: '', plan: '' })
  const [activeField, setActiveField] = useState(null)
  const [interimText, setInterimText] = useState('')
  const [savedNotes, setSavedNotes] = useState([])
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('compose')  // 'compose' | 'history'
  const recognizerRef = useRef(null)

  // Load patients + saved notes
  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data.data || [])).catch(() => {})
    api.get('/doctors/soap').then(r => setSavedNotes(r.data.data || [])).catch(() => {})
  }, [])

  /* ── Voice recognition ── */
  const startListening = useCallback((fieldKey) => {
    if (!supported) return toast.error('Voice dictation not supported in this browser')
    stopListening()

    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.maxAlternatives = 1

    rec.onresult = (e) => {
      let finalTranscript = ''
      let interimTranscript = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalTranscript += t + ' '
        else interimTranscript += t
      }
      setInterimText(interimTranscript)
      if (finalTranscript) {
        setSoap(prev => ({
          ...prev,
          [fieldKey]: (prev[fieldKey] + finalTranscript).trimStart()
        }))
        setInterimText('')
      }
    }

    rec.onerror = (e) => {
      if (e.error !== 'aborted') toast.error(`Mic error: ${e.error}`)
      setActiveField(null)
      setInterimText('')
    }

    rec.onend = () => {
      setActiveField(null)
      setInterimText('')
    }

    recognizerRef.current = rec
    rec.start()
    setActiveField(fieldKey)
    toast.success(`🎙️ Listening for ${SOAP_FIELDS.find(f => f.key === fieldKey)?.short}…`, { duration: 2000 })
  }, [])

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop()
    recognizerRef.current = null
    setActiveField(null)
    setInterimText('')
  }, [])

  // Cleanup on unmount
  useEffect(() => () => stopListening(), [stopListening])

  const handleChange = (key, val) => setSoap(prev => ({ ...prev, [key]: val }))

  const clearAll = () => {
    stopListening()
    setSoap({ subjective: '', objective: '', assessment: '', plan: '' })
    toast.success('Note cleared')
  }

  const saveNote = async () => {
    const hasContent = Object.values(soap).some(v => v.trim())
    if (!hasContent) return toast.error('Write or dictate at least one SOAP section')
    setSaving(true)
    try {
      const patient = patients.find(p => p.uid === selectedPatient)
      const res = await api.post('/doctors/soap', {
        ...soap,
        patientId: selectedPatient,
        patientName: patient?.name || 'N/A',
        type: 'SOAP'
      })
      setSavedNotes(prev => [res.data.data, ...prev])
      toast.success('SOAP Note saved!')
    } catch {
      toast.error('Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  const loadNote = (note) => {
    setSoap({
      subjective: note.subjective || '',
      objective:  note.objective  || '',
      assessment: note.assessment || '',
      plan:       note.plan       || '',
    })
    setSelectedPatient(note.patientId || '')
    setTab('compose')
    toast.success('Note loaded for editing')
  }

  const patient = patients.find(p => p.uid === selectedPatient)
  const totalWords = Object.values(soap).reduce((acc, v) => acc + (v.trim() ? v.trim().split(/\s+/).length : 0), 0)
  const completedSections = SOAP_FIELDS.filter(f => soap[f.key]?.trim()).length

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-header flex items-center gap-2">
              <Mic size={24} className="text-primary-500" />
              SOAP Notes Dictation
            </h1>
            <p className="text-gray-500 text-sm mt-1">Voice-to-text clinical documentation — speak naturally</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {!supported && (
              <div className="flex items-center gap-1.5 text-amber-600 text-sm bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                <AlertCircle size={14} />
                Use Chrome/Edge for voice
              </div>
            )}
            <button onClick={clearAll} className="btn-secondary py-2.5">
              <RotateCcw size={15} /> Clear All
            </button>
            <button onClick={saveNote} disabled={saving} className="btn-primary py-2.5">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                : <><Save size={15} />Save Note</>
              }
            </button>
            <button
              onClick={() => exportPDF(soap, patient?.name, 'Dr. ' + patient?.doctorName)}
              className="btn-cyan py-2.5">
              <Download size={15} /> Export PDF
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="premium-card px-5 py-3 flex flex-wrap items-center gap-4">
          {/* Patient selector */}
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <User size={15} className="text-gray-400 flex-shrink-0" />
            <div className="relative flex-1">
              <select className="form-input text-sm py-2 pr-8 appearance-none"
                value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                <option value="">Select patient (optional)</option>
                {patients.map(p => <option key={p.uid} value={p.uid}>{p.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Progress indicators */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              {SOAP_FIELDS.map(f => (
                <div key={f.key} title={f.short}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    soap[f.key]?.trim()
                      ? `bg-gradient-to-br ${f.color} text-white shadow-sm`
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                  {f.short[0]}
                </div>
              ))}
            </div>
            <span className="text-gray-400 text-xs">
              {completedSections}/4 sections · {totalWords} words
            </span>
            {activeField && (
              <div className="flex items-center gap-1.5 text-red-500 text-xs font-semibold animate-pulse">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Recording {SOAP_FIELDS.find(f => f.key === activeField)?.short}
              </div>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 p-0.5 rounded-xl">
            {[{ id: 'compose', label: 'Compose' }, { id: 'history', label: `History (${savedNotes.length})` }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── COMPOSE TAB ── */}
        {tab === 'compose' && (
          <>
            {/* Tips banner */}
            {supported && !activeField && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary-50 to-cyan-50 rounded-2xl border border-primary-100">
                <Sparkles size={18} className="text-primary-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-semibold text-primary-700">Voice Dictation Tips: </span>
                  <span className="text-gray-600">Click <strong>Dictate</strong> on any section, speak naturally, and text appears in real-time.
                  Say <em>"comma"</em>, <em>"period"</em>, <em>"new line"</em> for punctuation. Click <strong>Stop</strong> when done with that section.</span>
                </div>
              </div>
            )}

            {/* SOAP sections grid */}
            <div className="grid lg:grid-cols-2 gap-5">
              {SOAP_FIELDS.map(field => (
                <SOAPSection
                  key={field.key}
                  field={field}
                  value={soap[field.key]}
                  onChange={handleChange}
                  activeField={activeField}
                  onStartListen={startListening}
                  onStopListen={stopListening}
                  interimText={activeField === field.key ? interimText : ''}
                />
              ))}
            </div>

            {/* Full note preview */}
            {Object.values(soap).some(v => v.trim()) && (
              <div className="premium-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 font-display flex items-center gap-2">
                    <FileText size={18} className="text-primary-500" />
                    Note Preview
                  </h2>
                  <div className="flex items-center gap-2">
                    {selectedPatient && patient && (
                      <span className="badge badge-blue text-xs">{patient.name}</span>
                    )}
                    <span className="text-xs text-gray-400">{totalWords} total words</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 space-y-5 font-mono text-sm leading-relaxed">
                  {SOAP_FIELDS.map(field => soap[field.key]?.trim() ? (
                    <div key={field.key}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-1.5 h-5 rounded-full bg-gradient-to-b ${field.color}`} />
                        <span className={`font-bold text-xs px-2 py-0.5 rounded-lg ${field.badgeClass}`}>{field.label}</span>
                      </div>
                      <p className="text-gray-700 pl-5 whitespace-pre-wrap">{soap[field.key]}</p>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <div>
            {savedNotes.length === 0 ? (
              <div className="premium-card p-16 text-center">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 font-display mb-2">No saved notes yet</h3>
                <p className="text-gray-400">Compose and save a SOAP note to see it here.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedNotes.map((note, i) => (
                  <SavedNoteCard key={note.id || i} note={note} onSelect={loadNote} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
