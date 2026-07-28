const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// In-memory AI reports store
const aiReports = [];

// Seed demo AI reports
const seedAIReports = () => {
  aiReports.push({
    id: 'ai-report-001',
    patientId: 'demo-patient-001',
    beforeXrayUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800',
    afterXrayUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    confidence: 94.7,
    status: 'completed',
    findings: [
      { area: 'Upper Left Molar', change: 'Cavity significantly reduced', severity: 'improved', confidence: 96.2 },
      { area: 'Lower Right Premolar', change: 'Bone density improved by 18%', severity: 'improved', confidence: 92.1 },
      { area: 'Gum Line', change: 'Inflammation reduced by 35%', severity: 'improved', confidence: 95.8 },
      { area: 'Root Canal Area', change: 'Complete healing detected', severity: 'healed', confidence: 97.3 },
    ],
    overallProgress: 'Excellent',
    treatmentEffectiveness: 92,
    recommendations: [
      'Continue current treatment plan',
      'Schedule follow-up in 3 months',
      'Maintain improved oral hygiene routine',
    ],
    generatedAt: '2026-06-01T16:00:00Z',
    doctorNotes: 'Patient showing excellent recovery. Continue monitoring.',
  });
};

seedAIReports();

// POST /api/ai/compare
router.post('/compare', authMiddleware, (req, res) => {
  try {
    const { beforeFileId, afterFileId, beforeUrl, afterUrl, patientId } = req.body;

    // Simulate AI analysis with realistic results
    const findings = [
      { area: 'Upper Molars', change: 'Decay progression halted', severity: 'improved', confidence: Math.round(88 + Math.random() * 10) },
      { area: 'Lower Premolars', change: 'Bone density change detected', severity: Math.random() > 0.3 ? 'improved' : 'monitoring', confidence: Math.round(85 + Math.random() * 12) },
      { area: 'Gum Tissue', change: 'Inflammation level change', severity: Math.random() > 0.2 ? 'improved' : 'monitoring', confidence: Math.round(90 + Math.random() * 8) },
      { area: 'Tooth Alignment', change: 'Minor alignment shift detected', severity: 'monitoring', confidence: Math.round(82 + Math.random() * 10) },
    ];

    const overallConfidence = Math.round(findings.reduce((s, f) => s + f.confidence, 0) / findings.length * 10) / 10;
    const effectiveness = Math.round(70 + Math.random() * 25);

    const report = {
      id: uuidv4(),
      patientId: patientId || req.user.uid,
      beforeXrayUrl: beforeUrl,
      afterXrayUrl: afterUrl,
      beforeFileId,
      afterFileId,
      confidence: overallConfidence,
      status: 'completed',
      findings,
      overallProgress: effectiveness > 85 ? 'Excellent' : effectiveness > 70 ? 'Good' : 'Fair',
      treatmentEffectiveness: effectiveness,
      recommendations: [
        'Continue prescribed treatment plan',
        `Schedule follow-up in ${Math.floor(1 + Math.random() * 3)} months`,
        'Maintain oral hygiene as instructed',
      ],
      generatedAt: new Date().toISOString(),
    };

    aiReports.push(report);

    res.json({
      success: true,
      message: 'AI analysis completed',
      data: report,
    });
  } catch (error) {
    console.error('AI compare error:', error);
    res.status(500).json({ success: false, message: 'AI analysis failed' });
  }
});

// GET /api/ai/reports
router.get('/reports', authMiddleware, (req, res) => {
  const patientId = req.query.patientId || (req.user.role === 'patient' ? req.user.uid : null);
  const reports = patientId
    ? aiReports.filter(r => r.patientId === patientId)
    : aiReports;
  res.json({ success: true, data: reports });
});

// GET /api/ai/reports/:id
router.get('/reports/:id', authMiddleware, (req, res) => {
  const report = aiReports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
  res.json({ success: true, data: report });
});

module.exports = router;
