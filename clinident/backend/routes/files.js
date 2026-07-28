/**
 * Files Route — X-Ray images + STL 3D scan uploads
 * Storage priority:
 *   1. Cloudinary (free, cloud, recommended) — if CLOUDINARY_CLOUD_NAME is set
 *   2. Local disk (fallback)                  — always works
 *
 * Firestore stores file metadata regardless of which storage is used.
 */
const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/* ── Cloudinary setup ────────────────────────────────────────────────────── */
let cloudinary = null;
let CloudinaryStorage = null;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
  try {
    const { v2: _cloudinary } = require('cloudinary');
    const { CloudinaryStorage: _CS } = require('multer-storage-cloudinary');
    _cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    cloudinary = _cloudinary;
    CloudinaryStorage = _CS;
    console.log('☁️  Cloudinary storage ready');
  } catch (e) {
    console.warn('⚠️  Cloudinary load failed:', e.message);
  }
}

/* ── Firestore (optional) ────────────────────────────────────────────────── */
let db = null;
try { ({ db } = require('../config/firebase')); } catch (_) {}

/* ── In-memory file metadata ─────────────────────────────────────────────── */
const fileStore = [];

fileStore.push(
  {
    id: 'file-demo-001', userId: 'demo-patient-001', name: 'Before_Xray.jpg',
    type: 'xray', category: 'before', size: '1.2 MB',
    url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80',
    publicId: null, uploadedAt: '2026-04-15T10:00:00Z',
  },
  {
    id: 'file-demo-002', userId: 'demo-patient-001', name: 'After_Xray.jpg',
    type: 'xray', category: 'after', size: '1.1 MB',
    url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    publicId: null, uploadedAt: '2026-06-01T09:30:00Z',
  },
  {
    id: 'file-demo-003', userId: 'demo-patient-001', name: 'Dental_Model_Before.stl',
    type: 'stl', category: 'before', size: '3.4 MB',
    url: null, publicId: null, uploadedAt: '2026-04-16T11:00:00Z',
  }
);

/* ── Build multer uploader ───────────────────────────────────────────────── */
function buildUploader(userId, fileType) {
  if (cloudinary && CloudinaryStorage) {
    // Cloudinary upload
    const storage = new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => ({
        folder:         `clinident/${fileType}/${userId}`,
        resource_type:  'auto',                    // handles images + raw files (STL)
        public_id:      `${uuidv4()}`,
        allowed_formats: ['jpg','jpeg','png','gif','webp','stl','obj','ply','3ds'],
      }),
    });
    return multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });
  }

  // Local disk fallback
  const uploadsDir = path.join(__dirname, '..', 'uploads', userId);
  fs.mkdirSync(uploadsDir, { recursive: true });
  const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadsDir),
    filename:    (_, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  });
  return multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });
}

function formatSize(bytes) {
  if (!bytes) return 'N/A';
  if (bytes < 1024)    return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/* ══════════════════════════════════════════════════════════════
   ROUTES
   ══════════════════════════════════════════════════════════════ */

/**
 * POST /api/files/upload
 * Body (multipart/form-data):
 *   file      — the file
 *   fileType  — 'xray' | 'stl'
 *   category  — 'before' | 'after'
 *   patientId — optional (doctor uploading for patient)
 */
router.post('/upload', authMiddleware, (req, res) => {
  const ownerId  = req.body?.patientId || req.user.uid;
  const fileType = req.body?.fileType  || 'xray';

  const uploader = buildUploader(ownerId, fileType);
  uploader.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

    const { category = 'before' } = req.body;
    const fileId = uuidv4();

    // Determine URL
    let fileUrl   = null;
    let publicId  = null;
    let storageType = 'local';

    if (cloudinary && req.file.path && req.file.path.startsWith('http')) {
      // Cloudinary result
      fileUrl    = req.file.path;
      publicId   = req.file.filename;
      storageType = 'cloudinary';
    } else if (req.file.path) {
      // Local disk — build accessible URL
      const host = `${req.protocol}://${req.get('host')}`;
      const rel  = path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/');
      fileUrl    = `${host}/${rel}`;
      storageType = 'local';
    }

    const record = {
      id:         fileId,
      userId:     ownerId,
      name:       req.file.originalname,
      type:       fileType,
      category:   category,
      size:       formatSize(req.file.size),
      url:        fileUrl,
      publicId:   publicId,
      storageType,
      mimeType:   req.file.mimetype,
      uploadedAt: new Date().toISOString(),
    };

    fileStore.push(record);

    if (db) {
      try { await db.collection('files').doc(fileId).set(record); }
      catch (e) { console.warn('Firestore write failed:', e.message); }
    }

    console.log(`✅ File uploaded via ${storageType}: ${record.name}`);
    return res.status(201).json({ success: true, data: record });
  });
});

/** GET /api/files — get current user's files */
router.get('/', authMiddleware, async (req, res) => {
  if (db) {
    try {
      const snap  = await db.collection('files').where('userId', '==', req.user.uid).get();
      const files = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (files.length > 0) return res.json({ success: true, data: files });
    } catch (e) { console.warn('Firestore read failed, using memory'); }
  }
  const files = fileStore.filter(f => f.userId === req.user.uid || f.userId === 'demo-patient-001');
  res.json({ success: true, data: files });
});

/** GET /api/files/:patientId — doctor gets files for a patient */
router.get('/:patientId', authMiddleware, (req, res) => {
  const files = fileStore.filter(f => f.userId === req.params.patientId);
  res.json({ success: true, data: files });
});

/** DELETE /api/files/:id */
router.delete('/:id', authMiddleware, async (req, res) => {
  const idx = fileStore.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'File not found' });

  const record = fileStore[idx];

  // Delete from Cloudinary
  if (cloudinary && record.publicId) {
    try {
      await cloudinary.uploader.destroy(record.publicId, { resource_type: 'auto' });
      console.log(`🗑️  Deleted from Cloudinary: ${record.publicId}`);
    } catch (e) { console.warn('Cloudinary delete failed:', e.message); }
  } else if (record.storageType === 'local' && record.url) {
    // Delete local file
    try {
      const localPath = path.join(__dirname, '..', 'uploads', record.userId,
        path.basename(record.url));
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    } catch (_) {}
  }

  fileStore.splice(idx, 1);

  if (db) {
    try { await db.collection('files').doc(req.params.id).delete(); } catch (_) {}
  }

  res.json({ success: true, message: 'File deleted' });
});

module.exports = router;
