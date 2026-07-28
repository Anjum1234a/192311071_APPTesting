/**
 * Auth Routes — Register / Login / Profile
 * Uses Firestore when Firebase is configured, falls back to in-memory Map.
 */
const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/* ── Firebase / Firestore ─────────────────────────────────────────────────── */
let db = null;
try {
  ({ db } = require('../config/firebase'));
} catch (_) {}

/* ── In-memory user store (fallback + cache) ─────────────────────────────── */
const userStore = new Map();

// Seed demo users
const demoUsers = [
  {
    uid: 'demo-patient-001', role: 'patient', name: 'John Smith',
    email: 'patient@clinident.com', phone: '+1 555 0101', dob: '1990-03-15',
    address: '123 Oak Street, Boston, MA', createdAt: '2026-01-10T10:00:00Z',
    password: bcrypt.hashSync('patient123', 10),
  },
  {
    uid: 'demo-doctor-001', role: 'doctor', name: 'Dr. Michael Chen',
    email: 'doctor@clinident.com', phone: '+1 555 0200',
    specialization: 'Orthodontics', license: 'DDS-2020-001',
    clinicName: 'Clinident Dental Centre', createdAt: '2026-01-05T08:00:00Z',
    password: bcrypt.hashSync('doctor123', 10),
  },
  // ✅ Matches the SQLite demo account (doctor@clinic.com / doctor123)
  {
    uid: 'demo-doctor-002', role: 'doctor', name: 'Sarah Jenkins',
    email: 'doctor@clinic.com', phone: '+1 555 0300',
    specialization: 'Orthodontist', license: 'DDS-2021-002',
    clinicName: 'Smart Dental Care', createdAt: '2026-01-01T08:00:00Z',
    password: bcrypt.hashSync('doctor123', 10),
  },
];
demoUsers.forEach(u => userStore.set(u.email, u));

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function makeToken(user) {
  return jwt.sign(
    { uid: user.uid, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'clinident_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

async function findUserByEmail(email) {
  // 1. Check in-memory cache first
  if (userStore.has(email)) return userStore.get(email);

  // 2. Try Firestore
  if (db) {
    const snap = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!snap.empty) {
      const userData = { uid: snap.docs[0].id, ...snap.docs[0].data() };
      userStore.set(email, userData); // cache it
      return userData;
    }
  }
  return null;
}

async function saveUser(userData) {
  userStore.set(userData.email, userData);
  if (db) {
    await db.collection('users').doc(userData.uid).set(userData);
  }
}

/* ── Export store accessor (used by other routes) ────────────────────────── */
function getUserStore() { return userStore; }
module.exports.getUserStore = getUserStore;

/* ══════════════════════════════════════════════════════════════
   ROUTES
   ══════════════════════════════════════════════════════════════ */

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, dob, address, specialization, license, clinicName } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password and role are required' });
    }
    if (!['patient', 'doctor'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be patient or doctor' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hashedPw = await bcrypt.hash(password, 12);
    const user = {
      uid:  uuidv4(),
      name, email, role,
      phone:  phone  || '',
      dob:    dob    || '',
      address: address || '',
      specialization: specialization || '',
      license:        license        || '',
      clinicName:     clinicName     || '',
      password: hashedPw,
      createdAt: new Date().toISOString(),
      emailVerified: false,
    };

    await saveUser(user);
    const token = makeToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user: safeUser(user), token },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = makeToken(user);
    return res.json({
      success: true,
      data: { user: safeUser(user), token },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

/**
 * GET /api/auth/me  — return current user profile
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch profile' });
  }
});

/**
 * PUT /api/auth/profile  — update profile
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const allowed = ['name', 'phone', 'dob', 'address', 'specialization', 'clinicName'];
    allowed.forEach(k => { if (req.body[k] !== undefined) user[k] = req.body[k]; });
    user.updatedAt = new Date().toISOString();

    await saveUser(user);
    res.json({ success: true, data: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Profile update failed' });
  }
});

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  // Always return success (don't reveal whether email exists)
  console.log(`Password reset requested for: ${email}`);
  // TODO: send real email via Firebase Auth sendPasswordResetEmail or nodemailer
  res.json({ success: true, message: 'If this email is registered, a reset link has been sent.' });
});

/**
 * POST /api/auth/firebase-token
 * Android apps using Firebase Auth can exchange their Firebase ID token for a Clinident JWT.
 */
router.post('/firebase-token', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'Firebase ID token required' });

    let fbAuth;
    try { ({ auth: fbAuth } = require('../config/firebase')); }
    catch (_) { return res.status(503).json({ success: false, message: 'Firebase not configured on server' }); }

    // Verify the Firebase ID token
    const decoded = await fbAuth.verifyIdToken(idToken);
    const { uid, email, name } = decoded;

    // Look up or create user record
    let user = await findUserByEmail(email);
    if (!user) {
      // Auto-create a patient account for Firebase-authenticated users
      user = {
        uid, email, name: name || email.split('@')[0],
        role: 'patient', phone: '', dob: '', address: '',
        password: '', createdAt: new Date().toISOString(),
        firebaseUid: uid,
      };
      await saveUser(user);
    }

    const token = makeToken(user);
    res.json({ success: true, data: { user: safeUser(user), token } });
  } catch (err) {
    console.error('Firebase token error:', err);
    res.status(401).json({ success: false, message: 'Invalid Firebase token: ' + err.message });
  }
});

module.exports = router;
