const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { getUserStore } = require('./auth');

const router = express.Router();

/* ─── In-memory stores ───────────────────────────────────────────────────── */
const treatmentNotes = [];
const soapNotes = [];

/* ─── Seed demo data ─────────────────────────────────────────────────────── */
treatmentNotes.push({
  id: 'note-001',
  patientId: 'demo-patient-001',
  doctorId: 'demo-doctor-001',
  doctorName: 'Dr. Michael Chen',
  note: 'Patient shows significant improvement after root canal treatment. Recommend 3-month follow-up.',
  treatment: 'Root Canal',
  createdAt: '2026-05-20T14:30:00Z',
});

soapNotes.push({
  id: 'soap-demo-001',
  patientId: 'demo-patient-001',
  patientName: 'John Smith',
  doctorId: 'demo-doctor-001',
  doctorName: 'Dr. Michael Chen',
  type: 'SOAP',
  subjective: 'Patient reports dull aching pain in upper-left molar for 3 days, rated 6/10. Pain worsens with cold liquids and eases with ibuprofen. No prior dental treatment on this tooth.',
  objective: 'Tooth #14 shows periapical radiolucency on digital X-ray. Percussion test positive. Probing depth 4 mm on buccal surface. Cold sensitivity test shows prolonged response. No visible cracking or fracture.',
  assessment: 'Irreversible pulpitis with periapical periodontitis on tooth #14. Differential: vertical root fracture (ruled out by CBCT). No signs of abscess at this time.',
  plan: 'Initiate root canal therapy on tooth #14 at next visit. Prescribe amoxicillin 500 mg TID × 7 days and ibuprofen 400 mg PRN for pain. Follow-up in 1 week for obturation. Radiographic follow-up in 3 months.',
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
});

/* ══════════════════════════════════════════════════════════════
   SPECIFIC ROUTES FIRST (before /:id wildcard)
   ══════════════════════════════════════════════════════════════ */

// GET /api/doctors
router.get('/', authMiddleware, (req, res) => {
  const users = getUserStore();
  const doctors = [...users.values()]
    .filter(u => u.role === 'doctor')
    .map(({ password, ...d }) => d);
  res.json({ success: true, data: doctors });
});

// ── Treatment notes ──────────────────────────────────────────────────────

// POST /api/doctors/notes
router.post('/notes', authMiddleware, requireRole('doctor'), (req, res) => {
  const { patientId, note, treatment } = req.body;
  if (!patientId || !note) {
    return res.status(400).json({ success: false, message: 'Patient ID and note are required' });
  }
  const newNote = {
    id: `note-${Date.now()}`,
    patientId,
    doctorId: req.user.uid,
    doctorName: req.user.name,
    note,
    treatment: treatment || 'General',
    createdAt: new Date().toISOString(),
  };
  treatmentNotes.push(newNote);
  res.status(201).json({ success: true, data: newNote });
});

// GET /api/doctors/notes/:patientId
router.get('/notes/:patientId', authMiddleware, (req, res) => {
  const notes = treatmentNotes.filter(n => n.patientId === req.params.patientId);
  res.json({ success: true, data: notes });
});

// ── SOAP notes ───────────────────────────────────────────────────────────

// GET /api/doctors/soap  — all SOAP notes for the logged-in doctor
router.get('/soap', authMiddleware, requireRole('doctor'), (req, res) => {
  const notes = soapNotes
    .filter(n => n.doctorId === req.user.uid || n.doctorId === 'demo-doctor-001')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: notes });
});

// POST /api/doctors/soap  — save a new SOAP note
router.post('/soap', authMiddleware, requireRole('doctor'), (req, res) => {
  const { subjective, objective, assessment, plan, patientId, patientName, type } = req.body;
  const hasContent = [subjective, objective, assessment, plan].some(s => s && s.trim());
  if (!hasContent) {
    return res.status(400).json({ success: false, message: 'At least one SOAP section must have content' });
  }
  const note = {
    id: `soap-${Date.now()}`,
    patientId: patientId || null,
    patientName: patientName || 'N/A',
    doctorId: req.user.uid,
    doctorName: req.user.name,
    type: type || 'SOAP',
    subjective: (subjective || '').trim(),
    objective:  (objective  || '').trim(),
    assessment: (assessment || '').trim(),
    plan:       (plan       || '').trim(),
    createdAt: new Date().toISOString(),
  };
  soapNotes.unshift(note);
  res.status(201).json({ success: true, data: note });
});

// GET /api/doctors/soap/:patientId — SOAP notes for one patient
router.get('/soap/:patientId', authMiddleware, (req, res) => {
  const notes = soapNotes.filter(n => n.patientId === req.params.patientId);
  res.json({ success: true, data: notes });
});

// PUT /api/doctors/soap/:id — update a SOAP note
router.put('/soap/:id', authMiddleware, requireRole('doctor'), (req, res) => {
  const idx = soapNotes.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'SOAP note not found' });
  const { subjective, objective, assessment, plan } = req.body;
  soapNotes[idx] = {
    ...soapNotes[idx],
    ...(subjective !== undefined && { subjective: subjective.trim() }),
    ...(objective  !== undefined && { objective:  objective.trim()  }),
    ...(assessment !== undefined && { assessment: assessment.trim() }),
    ...(plan       !== undefined && { plan:       plan.trim()       }),
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: soapNotes[idx] });
});

// DELETE /api/doctors/soap/:id
router.delete('/soap/:id', authMiddleware, requireRole('doctor'), (req, res) => {
  const idx = soapNotes.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'SOAP note not found' });
  soapNotes.splice(idx, 1);
  res.json({ success: true, message: 'SOAP note deleted' });
});

/* ══════════════════════════════════════════════════════════════
   WILDCARD ROUTE LAST
   ══════════════════════════════════════════════════════════════ */

// GET /api/doctors/:id
router.get('/:id', authMiddleware, (req, res) => {
  const users = getUserStore();
  const doctor = [...users.values()].find(u => u.uid === req.params.id && u.role === 'doctor');
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  const { password, ...doctorData } = doctor;
  res.json({ success: true, data: doctorData });
});

module.exports = router;
