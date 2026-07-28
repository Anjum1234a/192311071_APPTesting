const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { getUserStore } = require('./auth');

const router = express.Router();

// GET /api/patients
router.get('/', authMiddleware, requireRole('doctor'), (req, res) => {
  const users = getUserStore();
  const patients = [...users.values()]
    .filter(u => u.role === 'patient')
    .map(({ password, ...p }) => p);
  res.json({ success: true, data: patients, total: patients.length });
});

// GET /api/patients/:id
router.get('/:id', authMiddleware, (req, res) => {
  const users = getUserStore();
  const patient = [...users.values()].find(u => u.uid === req.params.id && u.role === 'patient');
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  const { password, ...patientData } = patient;
  res.json({ success: true, data: patientData });
});

// PUT /api/patients/:id
router.put('/:id', authMiddleware, (req, res) => {
  if (req.user.uid !== req.params.id && req.user.role !== 'doctor') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  const users = getUserStore();
  const patient = [...users.values()].find(u => u.uid === req.params.id);
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  const { password, ...updates } = req.body;
  const updated = { ...patient, ...updates, updatedAt: new Date().toISOString() };
  users.set(patient.email, updated);
  const { password: _, ...result } = updated;
  res.json({ success: true, data: result });
});

module.exports = router;
