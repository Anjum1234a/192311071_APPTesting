/**
 * Appointments Route — Full CRUD with Firestore persistence
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

/* ── Firebase ──────────────────────────────────────────────────────────────── */
let db = null;
try { ({ db } = require('../config/firebase')); } catch (_) {}

const COLLECTION = 'appointments';

/* ── In-memory fallback ────────────────────────────────────────────────────── */
const appointments = [];

appointments.push(
  {
    id: 'appt-demo-001', patientId: 'demo-patient-001', patientName: 'John Smith',
    doctorId: 'demo-doctor-001', doctorName: 'Dr. Michael Chen',
    type: 'Routine Checkup', date: new Date().toISOString().split('T')[0],
    time: '10:00 AM', status: 'confirmed', notes: 'First visit checkup',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'appt-demo-002', patientId: 'demo-patient-001', patientName: 'John Smith',
    doctorId: 'demo-doctor-001', doctorName: 'Dr. Michael Chen',
    type: 'X-Ray Analysis', date: '2026-07-15', time: '2:00 PM',
    status: 'pending', notes: 'Follow-up X-ray review',
    createdAt: new Date().toISOString(),
  }
);

/* ── Helpers ───────────────────────────────────────────────────────────────── */
async function getAllAppointments(userId, role) {
  if (db) {
    try {
      const field = role === 'doctor' ? 'doctorId' : 'patientId';
      const snap  = await db.collection(COLLECTION).where(field, '==', userId).orderBy('date', 'desc').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { console.warn('Firestore read failed, using memory:', e.message); }
  }
  return appointments.filter(a =>
    role === 'doctor' ? (a.doctorId === userId || a.doctorId === 'demo-doctor-001')
                      : (a.patientId === userId || a.patientId === 'demo-patient-001')
  );
}

async function saveAppointment(appt) {
  appointments.push(appt);
  if (db) {
    try { await db.collection(COLLECTION).doc(appt.id).set(appt); }
    catch (e) { console.warn('Firestore write failed:', e.message); }
  }
}

async function updateAppointment(id, updates) {
  const idx = appointments.findIndex(a => a.id === id);
  if (idx !== -1) appointments[idx] = { ...appointments[idx], ...updates };
  if (db) {
    try { await db.collection(COLLECTION).doc(id).update(updates); }
    catch (e) { console.warn('Firestore update failed:', e.message); }
  }
}

/* ══════════════════════════════════════════════════════════════
   ROUTES
   ══════════════════════════════════════════════════════════════ */

// GET /api/appointments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const data = await getAllAppointments(req.user.uid, req.user.role);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load appointments' });
  }
});

// POST /api/appointments
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, date, time, notes, doctorId } = req.body;
    if (!type || !date || !time) {
      return res.status(400).json({ success: false, message: 'Type, date and time are required' });
    }
    const appt = {
      id:          uuidv4(),
      patientId:   req.user.uid,
      patientName: req.user.name,
      doctorId:    doctorId || 'demo-doctor-001',
      doctorName:  'Dr. Michael Chen',
      type, date, time, notes: notes || '',
      status:      'pending',
      createdAt:   new Date().toISOString(),
    };
    await saveAppointment(appt);
    res.status(201).json({ success: true, data: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create appointment' });
  }
});

// PUT /api/appointments/:id — update status or details
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, notes, date, time } = req.body;
    const updates = {
      ...(status !== undefined && { status }),
      ...(notes  !== undefined && { notes  }),
      ...(date   !== undefined && { date   }),
      ...(time   !== undefined && { time   }),
      updatedAt: new Date().toISOString(),
    };
    await updateAppointment(req.params.id, updates);
    const appt = appointments.find(a => a.id === req.params.id);
    res.json({ success: true, data: appt || { id: req.params.id, ...updates } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const idx = appointments.findIndex(a => a.id === req.params.id);
    if (idx !== -1) appointments.splice(idx, 1);
    if (db) {
      try { await db.collection(COLLECTION).doc(req.params.id).delete(); } catch (_) {}
    }
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

module.exports = router;
