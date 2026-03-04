// Local API server for Campus Hub with lightweight auth and file uploads.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { promisify } = require('util');
const express = require('express');
const jsonServer = require('json-server');
const multer = require('multer');

const scryptAsync = promisify(crypto.scrypt);
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || '10');
const MAX_UPLOAD_SIZE_BYTES = Math.max(1, MAX_UPLOAD_SIZE_MB) * 1024 * 1024;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const ALLOWED_UPLOAD_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'video/mp4'
]);

const PUBLIC_USER_FIELDS = new Set([
  'id',
  'name',
  'email',
  'role',
  'avatar',
  'banner',
  'skills',
  'achievements',
  'subjects',
  'schedule',
  'grades',
  'attendanceRate',
  'phone',
  'address',
  'major',
  'year'
]);

const PROFILE_UPDATE_FIELDS = new Set([
  'name',
  'email',
  'role',
  'avatar',
  'banner',
  'skills',
  'achievements',
  'subjects',
  'schedule',
  'grades',
  'attendanceRate',
  'phone',
  'address',
  'major',
  'year'
]);

const passwordResetTokens = new Map();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

server.use(
  jsonServer.rewriter({
    '/api/*': '/$1'
  })
);

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function createId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeFilename(name = '') {
  const base = path.basename(String(name));
  const safe = base.replace(/[^\w.-]/g, '_').slice(0, 120);
  return safe || 'file';
}

function toPublicUser(user) {
  if (!user || typeof user !== 'object') return null;
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => PUBLIC_USER_FIELDS.has(key))
  );
}

function pickProfileUpdates(input) {
  const payload = input && typeof input === 'object' ? input : {};
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => PROFILE_UPDATE_FIELDS.has(key))
  );
}

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await scryptAsync(String(password), salt, 64);
  return `scrypt$${salt}$${Buffer.from(derived).toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const candidate = String(password || '');
  if (typeof stored !== 'string' || !stored) {
    return false;
  }
  if (!stored.startsWith('scrypt$')) {
    return stored === candidate;
  }
  const parts = stored.split('$');
  if (parts.length !== 3) {
    return false;
  }
  const [, salt, hashHex] = parts;
  const expectedHash = Buffer.from(hashHex, 'hex');
  const derived = await scryptAsync(candidate, salt, expectedHash.length);
  const actualHash = Buffer.from(derived);
  if (actualHash.length !== expectedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(actualHash, expectedHash);
}

function wrapUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (!err) {
        return next();
      }
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: `File is too large. Max size: ${MAX_UPLOAD_SIZE_MB}MB.` });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || 'Upload failed.' });
    });
  };
}

(() => {
  const db = router.db;
  if (!db.has('announcements').value()) db.set('announcements', []).write();
  if (!db.has('subjects').value()) db.set('subjects', []).write();
  if (!db.has('chats').value()) db.set('chats', []).write();
  if (!db.has('users').value()) db.set('users', []).write();
})();

server.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = router.db;
  const user = db.get('users').find({ email }).value();
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (typeof user.password === 'string' && !user.password.startsWith('scrypt$')) {
    const migratedHash = await hashPassword(password);
    db.get('users').find({ id: user.id }).assign({ password: migratedHash }).write();
  }

  const token = createToken();
  return res.json({
    ...toPublicUser(user),
    token
  });
});

server.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must contain at least 6 characters.' });
  }

  const db = router.db;
  const normalizedEmail = String(email).trim().toLowerCase();
  const exists = db.get('users').find({ email: normalizedEmail }).value();
  if (exists) {
    return res.status(409).json({ error: 'User with this email already exists.' });
  }

  const newUser = {
    id: createId(),
    name: String(name).trim(),
    email: normalizedEmail,
    password: await hashPassword(password),
    role: 'student',
    avatar: '',
    banner: '',
    skills: [],
    achievements: [],
    subjects: [],
    schedule: [],
    grades: []
  };

  db.get('users').push(newUser).write();
  const token = createToken();

  return res.status(201).json({
    ...toPublicUser(newUser),
    token
  });
});

server.post('/forgot-password', (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  const db = router.db;
  const user = db.get('users').find({ email: String(email).trim().toLowerCase() }).value();
  if (user) {
    const token = createToken();
    passwordResetTokens.set(token, {
      userId: user.id,
      expiresAt: Date.now() + 15 * 60 * 1000
    });
  }
  return res.json({ success: true, message: 'If this email exists, reset instructions were sent.' });
});

server.post('/reset-password', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must contain at least 6 characters.' });
  }

  const payload = passwordResetTokens.get(token);
  if (!payload || payload.expiresAt < Date.now()) {
    passwordResetTokens.delete(token);
    return res.status(400).json({ error: 'Reset token is invalid or expired.' });
  }

  const db = router.db;
  const user = db.get('users').find({ id: payload.userId }).value();
  if (!user) {
    passwordResetTokens.delete(token);
    return res.status(404).json({ error: 'User not found.' });
  }

  db.get('users')
    .find({ id: user.id })
    .assign({ password: await hashPassword(password) })
    .write();
  passwordResetTokens.delete(token);

  return res.json({ success: true });
});

server.get('/users', (req, res) => {
  const db = router.db;
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const exclude = typeof req.query.exclude === 'string' ? req.query.exclude : '';

  let users = db.get('users').value() || [];
  if (search) {
    users = users.filter((u) => {
      const name = String(u.name || '').toLowerCase();
      const email = String(u.email || '').toLowerCase();
      return name.includes(search) || email.includes(search);
    });
  }
  if (exclude) {
    users = users.filter((u) => u.id !== exclude);
  }

  return res.json(users.map(toPublicUser));
});

server.get('/users/:id', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.id }).value();
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json(toPublicUser(user));
});

server.get('/admin/stats', (req, res) => {
  const db = router.db;
  const users = db.get('users').value() || [];
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalTeachers = users.filter((u) => u.role === 'teacher').length;
  const subjects = db.get('subjects').value() || [];
  const totalSubjects = subjects.length;
  const allGrades = users.flatMap((u) => (Array.isArray(u.grades) ? u.grades : []));
  const averageGPA = allGrades.length
    ? allGrades.reduce((acc, g) => acc + safeNumber(g.value), 0) / allGrades.length
    : 0;
  const topStudents = users
    .filter((u) => Array.isArray(u.grades) && u.grades.length)
    .map((u) => ({
      id: u.id,
      name: u.name,
      gpa: u.grades.reduce((acc, g) => acc + safeNumber(g.value), 0) / u.grades.length
    }))
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, 5);

  return res.json({ totalStudents, totalTeachers, totalSubjects, averageGPA, topStudents });
});

server.put('/profile/:id', (req, res) => {
  const { id } = req.params;
  const updates = pickProfileUpdates(req.body);
  const db = router.db;
  const user = db.get('users').find({ id }).value();
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  db.get('users').find({ id }).assign(updates).write();
  const updatedUser = db.get('users').find({ id }).value();
  return res.json(toPublicUser(updatedUser));
});

server.delete('/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const db = router.db;
  const user = db.get('users').find({ id }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });

  db.get('users').remove({ id }).write();
  const chats = db.get('chats').value() || [];
  chats.forEach((ch) => {
    const members = (ch.members || []).filter((m) => m !== id);
    db.get('chats').find({ id: ch.id }).assign({ members }).write();
  });

  return res.json({ success: true });
});

server.get('/schedule/:userId', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.userId }).value();
  if (!user) return res.json([]);
  return res.json(user.schedule || []);
});

server.post('/schedule/:userId', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.userId }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const schedule = Array.isArray(req.body?.schedule) ? req.body.schedule : [];
  db.get('users').find({ id: req.params.userId }).assign({ schedule }).write();
  return res.json(schedule);
});

server.get('/grades/:userId', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.userId }).value();
  if (!user) return res.json([]);
  return res.json(user.grades || []);
});

server.post('/grades/:userId', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.userId }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const grade = { id: createId(), ...req.body };
  const grades = Array.isArray(user.grades) ? user.grades.concat(grade) : [grade];
  db.get('users').find({ id: req.params.userId }).assign({ grades }).write();
  return res.status(201).json(grade);
});

server.put('/grades/:userId/:gradeId', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.userId }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const grades = (user.grades || []).map((g) =>
    g.id === req.params.gradeId ? { ...g, ...req.body } : g
  );
  db.get('users').find({ id: req.params.userId }).assign({ grades }).write();
  return res.json(grades.find((g) => g.id === req.params.gradeId));
});

server.delete('/grades/:userId/:gradeId', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.userId }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const grades = (user.grades || []).filter((g) => g.id !== req.params.gradeId);
  db.get('users').find({ id: req.params.userId }).assign({ grades }).write();
  return res.json({ success: true });
});

server.get('/chats', (req, res) => {
  const db = router.db;
  const { userId } = req.query;
  let chats = db.get('chats').value() || [];
  if (userId) {
    chats = chats.filter((ch) => (ch.members || []).includes(userId));
  }
  return res.json(chats);
});

server.post('/chats', (req, res) => {
  const db = router.db;
  const { members = [], name, avatar } = req.body || {};
  if (!Array.isArray(members) || members.length < 1) {
    return res.status(400).json({ error: 'members is required.' });
  }
  const newChat = { id: createId(), members, name, avatar, messages: [] };
  db.get('chats').push(newChat).write();
  return res.status(201).json(newChat);
});

server.get('/chats/:id/messages', (req, res) => {
  const db = router.db;
  const chat = db.get('chats').find({ id: req.params.id }).value();
  if (!chat) {
    if (req.params.id === 'bot-chat') return res.json([]);
    return res.status(404).json({ error: 'Chat not found.' });
  }
  return res.json(chat.messages || []);
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

try {
  const chats = router.db.get('chats').value() || [];
  chats.forEach((ch) => {
    (ch.messages || []).forEach((m) => {
      if (m.file) {
        const filePath = path.join(uploadsDir, sanitizeFilename(m.file));
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, `File placeholder for ${m.originalName || m.file}`);
        }
      }
    });
  });
} catch {
  // Ignore bootstrap issues for placeholders.
}

server.use('/uploads', express.static(uploadsDir, { index: false }));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeOriginal = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}_${createId()}_${safeOriginal}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_UPLOAD_MIME.has(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
});

const singleUpload = wrapUpload(upload.single('file'));

server.post('/upload', singleUpload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file received.' });
  }
  return res.json({ filename: req.file.filename, originalName: req.file.originalname });
});

server.post('/chats/:id/messages', singleUpload, (req, res) => {
  const db = router.db;
  const chat = db.get('chats').find({ id: req.params.id }).value();

  const msg = {
    id: createId(),
    sender: req.body?.sender,
    text: req.body?.text || '',
    type: req.body?.type || (req.file ? req.file.mimetype : 'text'),
    file: req.file ? req.file.filename : null,
    originalName: req.file ? req.file.originalname : null,
    size: req.file ? req.file.size : 0,
    createdAt: new Date().toISOString()
  };

  if (!chat) {
    if (req.params.id === 'bot-chat') {
      return res.status(201).json(msg);
    }
    return res.status(404).json({ error: 'Chat not found.' });
  }

  const messages = Array.isArray(chat.messages) ? chat.messages.concat(msg) : [msg];
  db.get('chats').find({ id: req.params.id }).assign({ messages }).write();
  return res.status(201).json(msg);
});

server.get('/subjects', (req, res) => {
  const db = router.db;
  return res.json(db.get('subjects').value() || []);
});

server.post('/subjects', (req, res) => {
  const db = router.db;
  const subject = { id: createId(), students: [], grades: [], ...req.body };
  db.get('subjects').push(subject).write();
  return res.status(201).json(subject);
});

server.put('/subjects/:subjectId', (req, res) => {
  const db = router.db;
  const subject = db.get('subjects').find({ id: req.params.subjectId }).value();
  if (!subject) return res.status(404).json({ error: 'Subject not found.' });
  const updated = { ...subject, ...req.body };
  db.get('subjects').find({ id: req.params.subjectId }).assign(updated).write();
  return res.json(updated);
});

server.delete('/subjects/:subjectId', (req, res) => {
  const db = router.db;
  db.get('subjects').remove({ id: req.params.subjectId }).write();
  return res.json({ success: true });
});

server.get('/teachers/:teacherId/subjects', (req, res) => {
  const db = router.db;
  const subjects = db.get('subjects').value() || [];
  const list = subjects.filter((s) => s.teacherId === req.params.teacherId);
  return res.json(list);
});

server.get('/students/:studentId/subjects', (req, res) => {
  const db = router.db;
  const subjects = db.get('subjects').value() || [];
  const list = subjects.filter((s) =>
    (s.students || []).some((st) => st.id === req.params.studentId)
  );
  return res.json(list);
});

server.post('/subjects/:subjectId/students', (req, res) => {
  const db = router.db;
  const subject = db.get('subjects').find({ id: req.params.subjectId }).value();
  if (!subject) return res.status(404).json({ error: 'Subject not found.' });

  const { studentId } = req.body || {};
  const users = db.get('users').value() || [];
  const student = users.find((u) => u.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found.' });

  const students = Array.isArray(subject.students) ? subject.students.slice() : [];
  if (!students.some((s) => s.id === student.id)) {
    students.push({ id: student.id, name: student.name, grades: [] });
  }

  db.get('subjects').find({ id: req.params.subjectId }).assign({ students }).write();
  return res.json({ success: true });
});

server.delete('/subjects/:subjectId/students/:studentId', (req, res) => {
  const db = router.db;
  const subject = db.get('subjects').find({ id: req.params.subjectId }).value();
  if (!subject) return res.status(404).json({ error: 'Subject not found.' });
  const students = (subject.students || []).filter((s) => s.id !== req.params.studentId);
  db.get('subjects').find({ id: req.params.subjectId }).assign({ students }).write();
  return res.json({ success: true });
});

server.use(router);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Local API server is running at http://localhost:${PORT}`);
});
