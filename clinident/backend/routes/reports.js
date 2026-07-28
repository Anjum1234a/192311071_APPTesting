const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const reports = [];

// Seed demo report
reports.push({
  id: 'report-001',
  patientId: 'demo-patient-001',
  patientName: 'Sarah Johnson',
  doctorId: 'demo-doctor-001',
  doctorName: 'Dr. Michael Chen',
  title: 'Treatment Progress Report – June 2026',
  type: 'progress',
  summary: 'Patient has shown excellent progress over the 3-month treatment period.',
  findings: ['Cavity reduction: 85%', 'Bone density improved', 'Gum inflammation resolved'],
  recommendations: ['Continue fluoride treatment', 'Monthly checkups for 6 months'],
  aiConfidence: 94.7,
  createdAt: '2026-06-01T16:00:00Z',
  status: 'final',
});

// GET /api/reports
router.get('/', authMiddleware, (req, res) => {
  const patientId = req.query.patientId || (req.user.role === 'patient' ? req.user.uid : null);
  const result = patientId ? reports.filter(r => r.patientId === patientId) : reports;
  res.json({ success: true, data: result });
});

// POST /api/reports/generate
router.post('/generate', authMiddleware, (req, res) => {
  const { patientId, patientName, title, summary, findings, recommendations, aiConfidence } = req.body;
  const report = {
    id: uuidv4(),
    patientId: patientId || req.user.uid,
    patientName: patientName || req.user.name,
    doctorId: req.user.uid,
    doctorName: req.user.name,
    title: title || `Treatment Report – ${new Date().toLocaleDateString()}`,
    type: 'progress',
    summary: summary || '',
    findings: findings || [],
    recommendations: recommendations || [],
    aiConfidence: aiConfidence || null,
    createdAt: new Date().toISOString(),
    status: 'final',
  };
  reports.push(report);
  res.status(201).json({ success: true, data: report });
});

// GET /api/reports/:id
router.get('/:id', authMiddleware, (req, res) => {
  const report = reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
  res.json({ success: true, data: report });
});

module.exports = router;
