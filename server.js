// Lightweight auth-enabled JSON server for local development (no extra deps)
const path = require('path');
const express = require('express');
const jsonServer = require('json-server');
const fs = require('fs');
const multer = require('multer');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Basic CORS (json-server defaults already include it, keep explicit headers)
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rewrite /api/* to resource root and expose our auth endpoints under /api
server.use(
  jsonServer.rewriter({
    '/api/*': '/$1'
  })
);

// Helpers
function createToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

// Ensure required collections exist
(() => {
  const db = router.db;
  if (!db.has('announcements').value()) db.set('announcements', []).write();
  if (!db.has('subjects').value()) db.set('subjects', []).write();
})();

// POST /api/login
server.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }
  const db = router.db;
  const user = db.get('users').find({ email, password }).value();
  if (!user) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }
  const token = createToken();
  return res.json({
    ...user,
    token
  });
});

// POST /api/register
server.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Имя, email и пароль обязательны' });
  }
  const db = router.db;
  const exists = db.get('users').find({ email }).value();
  if (exists) {
    return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
  }
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
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
    ...newUser,
    token
  });
});

// Admin stats
server.get('/admin/stats', (req, res) => {
  const db = router.db;
  const users = db.get('users').value() || [];
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalTeachers = users.filter(u => u.role === 'teacher').length;
  const subjects = db.get('subjects').value() || [];
  const totalSubjects = subjects.length;
  const allGrades = users.flatMap(u => Array.isArray(u.grades) ? u.grades : []);
  const averageGPA = allGrades.length ? allGrades.reduce((a, g) => a + (parseFloat(g.value) || 0), 0) / allGrades.length : 0;
  const topStudents = users
    .filter(u => Array.isArray(u.grades) && u.grades.length)
    .map(u => ({
      id: u.id, name: u.name, gpa: u.grades.reduce((a, g) => a + (parseFloat(g.value) || 0), 0) / u.grades.length
    }))
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, 5);
  res.json({ totalStudents, totalTeachers, totalSubjects, averageGPA, topStudents });
});

// Profile update
server.put('/profile/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const db = router.db;
  const user = db.get('users').find({ id }).value();
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  db.get('users').find({ id }).assign(updates).write();
  res.json({ ...user, ...updates });
});

// Admin delete user
server.delete('/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const db = router.db;
  const user = db.get('users').find({ id }).value();
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  db.get('users').remove({ id }).write();
  // Remove from chats
  const chats = db.get('chats').value() || [];
  chats.forEach(ch => {
    const members = (ch.members || []).filter(m => m !== id);
    db.get('chats').find({ id: ch.id }).assign({ members }).write();
  });
  res.json({ success: true });
});

// Schedule
server.get('/schedule/:userId', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.userId }).value();
  if (!user) return res.json([]);
  return res.json(user.schedule || []);
});
server.post('/schedule/:userId', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.userId }).value();
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  const schedule = req.body?.schedule || [];
  db.get('users').find({ id: req.params.userId }).assign({ schedule }).write();
  res.json(schedule);
});

// Grades
server.get('/grades/:userId', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.userId }).value();
  if (!user) return res.json([]);
  return res.json(user.grades || []);
});
server.post('/grades/:userId', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.userId }).value();
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  const grade = { id: Date.now().toString(), ...req.body };
  const grades = Array.isArray(user.grades) ? user.grades.concat(grade) : [grade];
  db.get('users').find({ id: req.params.userId }).assign({ grades }).write();
  res.status(201).json(grade);
});
server.put('/grades/:userId/:gradeId', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.userId }).value();
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  const grades = (user.grades || []).map(g => (g.id === req.params.gradeId ? { ...g, ...req.body } : g));
  db.get('users').find({ id: req.params.userId }).assign({ grades }).write();
  res.json(grades.find(g => g.id === req.params.gradeId));
});
server.delete('/grades/:userId/:gradeId', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.userId }).value();
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  const grades = (user.grades || []).filter(g => g.id !== req.params.gradeId);
  db.get('users').find({ id: req.params.userId }).assign({ grades }).write();
  res.json({ success: true });
});

// Chats
server.get('/chats', (req, res) => {
  const db = router.db;
  const { userId } = req.query;
  let chats = db.get('chats').value() || [];
  if (userId) chats = chats.filter(ch => (ch.members || []).includes(userId));
  res.json(chats);
});
server.post('/chats', (req, res) => {
  const db = router.db;
  const { members = [], name, avatar } = req.body || {};
  if (!Array.isArray(members) || members.length < 1) return res.status(400).json({ error: 'members required' });
  const newChat = { id: Date.now().toString(), members, name, avatar, messages: [] };
  db.get('chats').push(newChat).write();
  res.status(201).json(newChat);
});
server.get('/chats/:id/messages', (req, res) => {
  const db = router.db;
  const chat = db.get('chats').find({ id: req.params.id }).value();
  if (!chat) {
    // Support special local bot chat
    if (req.params.id === 'bot-chat') return res.json([]);
    return res.status(404).json({ error: 'Чат не найден' });
  }
  return res.json(chat.messages || []);
});

// File upload handling for messages and general uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
// Bootstrap: ensure files referenced in db.json exist on disk
try {
  const chats = router.db.get('chats').value() || [];
  chats.forEach(ch => {
    (ch.messages || []).forEach(m => {
      if (m.file) {
        const f = path.join(uploadsDir, m.file);
        if (!fs.existsSync(f)) {
          fs.writeFileSync(f, `File placeholder for ${m.originalName || m.file}`);
        }
      }
    });
  });
} catch {}
server.use('/uploads', express.static(uploadsDir));
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

server.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не получен' });
  res.json({ filename: req.file.filename, originalName: req.file.originalname });
});

server.post('/chats/:id/messages', upload.single('file'), (req, res) => {
  const db = router.db;
  const chat = db.get('chats').find({ id: req.params.id }).value();
  if (!chat) {
    if (req.params.id === 'bot-chat') {
      const msg = {
        id: Date.now().toString(),
        sender: req.body?.sender,
        text: req.body?.text || '',
        type: req.body?.type || (req.file ? req.file.mimetype : 'text'),
        file: req.file ? req.file.filename : null,
        originalName: req.file ? req.file.originalname : null,
        size: req.file ? req.file.size : 0,
        createdAt: new Date().toISOString()
      };
      return res.status(201).json(msg);
    }
    return res.status(404).json({ error: 'Чат не найден' });
  }
  const { sender, text, type } = req.body || {};
  const msg = {
    id: Date.now().toString(),
    sender,
    text: text || '',
    type: type || (req.file ? req.file.mimetype : 'text'),
    file: req.file ? req.file.filename : null,
    originalName: req.file ? req.file.originalname : null,
    size: req.file ? req.file.size : 0,
    createdAt: new Date().toISOString()
  };
  const messages = Array.isArray(chat.messages) ? chat.messages.concat(msg) : [msg];
  db.get('chats').find({ id: req.params.id }).assign({ messages }).write();
  res.status(201).json(msg);
});

// Subjects minimal CRUD
server.get('/subjects', (req, res) => {
  const db = router.db;
  res.json(db.get('subjects').value() || []);
});
server.post('/subjects', (req, res) => {
  const db = router.db;
  const subject = { id: Date.now().toString(), students: [], grades: [], ...req.body };
  db.get('subjects').push(subject).write();
  res.status(201).json(subject);
});
server.put('/subjects/:subjectId', (req, res) => {
  const db = router.db;
  const sub = db.get('subjects').find({ id: req.params.subjectId }).value();
  if (!sub) return res.status(404).json({ error: 'Предмет не найден' });
  const updated = { ...sub, ...req.body };
  db.get('subjects').find({ id: req.params.subjectId }).assign(updated).write();
  res.json(updated);
});
server.delete('/subjects/:subjectId', (req, res) => {
  const db = router.db;
  db.get('subjects').remove({ id: req.params.subjectId }).write();
  res.json({ success: true });
});

// Teacher helper endpoints expected by some pages
server.get('/teachers/:teacherId/subjects', (req, res) => {
  const db = router.db;
  const subjects = db.get('subjects').value() || [];
  const list = subjects.filter(s => s.teacherId === req.params.teacherId);
  res.json(list);
});
server.get('/students/:studentId/subjects', (req, res) => {
  const db = router.db;
  const subjects = db.get('subjects').value() || [];
  const list = subjects.filter(s => (s.students || []).some(st => st.id === req.params.studentId));
  res.json(list);
});
server.post('/subjects/:subjectId/students', (req, res) => {
  const db = router.db;
  const subject = db.get('subjects').find({ id: req.params.subjectId }).value();
  if (!subject) return res.status(404).json({ error: 'Предмет не найден' });
  const { studentId } = req.body || {};
  const users = db.get('users').value() || [];
  const student = users.find(u => u.id === studentId);
  if (!student) return res.status(404).json({ error: 'Студент не найден' });
  const students = Array.isArray(subject.students) ? subject.students.slice() : [];
  if (!students.some(s => s.id === student.id)) students.push({ id: student.id, name: student.name, grades: [] });
  db.get('subjects').find({ id: req.params.subjectId }).assign({ students }).write();
  res.json({ success: true });
});
server.delete('/subjects/:subjectId/students/:studentId', (req, res) => {
  const db = router.db;
  const subject = db.get('subjects').find({ id: req.params.subjectId }).value();
  if (!subject) return res.status(404).json({ error: 'Предмет не найден' });
  const students = (subject.students || []).filter(s => s.id !== req.params.studentId);
  db.get('subjects').find({ id: req.params.subjectId }).assign({ students }).write();
  res.json({ success: true });
});

// Everything else via json-server router
server.use(router);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Local API server is running at http://localhost:${PORT}`);
});


