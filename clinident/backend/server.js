require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');
const os      = require('os');

/* ── Firebase Admin (initialises once, exports db + bucket) ── */
let firebaseReady = false;
try {
  require('./config/firebase');
  firebaseReady = true;
} catch (e) {
  console.warn('⚠️  Firebase not configured — running with in-memory fallback.');
  console.warn('   Fill in .env with your Firebase credentials to enable persistence.\n');
}

const authRoutes        = require('./routes/auth');
const patientRoutes     = require('./routes/patients');
const doctorRoutes      = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const fileRoutes        = require('./routes/files');
const aiRoutes          = require('./routes/ai');
const reportRoutes      = require('./routes/reports');

const app  = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';   // 0.0.0.0 = accessible from Android on same WiFi

/* ── Security & middleware ────────────────────────────────────────────────── */
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS — allow all origins so Android app (any IP) can connect
app.use(cors({
  origin: (origin, cb) => cb(null, true),   // accept all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.options('*', cors());   // handle preflight for all routes

app.use(morgan('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve locally uploaded files (fallback when Firebase Storage not configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ── Health check ─────────────────────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Clinident API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    firebase: firebaseReady,
    storage: firebaseReady ? 'Firebase Storage' : 'Local disk',
    database: firebaseReady ? 'Firestore' : 'In-memory',
  });
});

/* ── Routes ───────────────────────────────────────────────────────────────── */
app.use('/api/auth',         authRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/files',        fileRoutes);
app.use('/api/ai',           aiRoutes);
app.use('/api/reports',      reportRoutes);

/* ── 404 ──────────────────────────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

/* ── Global error handler ─────────────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/* ── Start server ─────────────────────────────────────────────────────────── */
app.listen(PORT, HOST, () => {
  console.log('\n══════════════════════════════════════════');
  console.log('🦷  Clinident API Server v2.0');
  console.log('══════════════════════════════════════════');
  console.log(`📡  Local:    http://localhost:${PORT}`);

  // Show all local network IPs (for Android)
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`📱  Android:  http://${net.address}:${PORT}  ← use this in your Android app`);
      }
    }
  }

  console.log(`🔗  Health:   http://localhost:${PORT}/api/health`);
  console.log(`🔥  Firebase: ${firebaseReady ? 'Connected ✅' : 'Not configured (in-memory mode)'}`);
  console.log(`💾  Storage:  ${firebaseReady ? 'Firebase Storage ✅' : 'Local disk (uploads/)'}`);
  console.log('══════════════════════════════════════════\n');
});

module.exports = app;
