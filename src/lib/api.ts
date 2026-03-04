import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const isGitHubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
const USE_DEMO_MODE = isGitHubPages && !configuredApiUrl;
const API_URL = configuredApiUrl || 'http://localhost:4000/api';

const DEMO_DB_KEY = 'campus_hub_demo_db_v1';

type UserRole = 'student' | 'teacher' | 'admin';

export interface Grade {
  id?: string;
  subject?: string;
  value?: number | string;
  type?: string;
  date?: string;
  [key: string]: unknown;
}

export interface ScheduleItem {
  id?: string;
  title?: string;
  date?: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  banner?: string;
  skills?: string[];
  achievements?: string[];
  subjects?: unknown[];
  schedule?: ScheduleItem[];
  grades?: Grade[];
  attendanceRate?: number;
  phone?: string;
  address?: string;
  major?: string;
  year?: string;
  token?: string;
  [key: string]: unknown;
}

interface DemoUser extends User {
  password: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text?: string;
  type?: string;
  file?: string | null;
  originalName?: string | null;
  size?: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface Chat {
  id: string;
  name?: string;
  avatar?: string;
  members: string[];
  messages?: ChatMessage[];
  [key: string]: unknown;
}

export interface Subject {
  id: string;
  name?: string;
  teacherId?: string;
  students?: Array<{ id: string; name?: string; grades?: Grade[] }>;
  grades?: Grade[];
  [key: string]: unknown;
}

interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  averageGPA: number;
  topStudents: Array<{ id: string; name: string; gpa: number }>;
}

interface Announcement {
  id?: string;
  title?: string;
  content?: string;
  [key: string]: unknown;
}

interface MaterialFile {
  id: string;
  name: string;
  type?: string;
  size?: number;
  date?: string;
  sender?: string;
  file: string;
  chatId: string;
  chatName: string;
}

interface ChatMessagePayload {
  sender: string;
  text?: string;
  type?: string;
  file?: File;
}

interface DemoDB {
  users: DemoUser[];
  chats: Chat[];
  subjects: Subject[];
  announcements: Announcement[];
}

const hasWindow = () => typeof window !== 'undefined';

const createId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const defaultDemoDb = (): DemoDB => {
  const studentId = createId('student');
  const teacherId = createId('teacher');
  const adminId = createId('admin');
  const subjectId = createId('subject');

  const studentGrades: Grade[] = [
    {
      id: createId('grade'),
      subject: 'Mathematics',
      value: 4.7,
      type: 'exam',
      date: new Date().toISOString(),
    },
    {
      id: createId('grade'),
      subject: 'Web Development',
      value: 4.9,
      type: 'assignment',
      date: new Date().toISOString(),
    },
  ];

  return {
    users: [
      {
        id: adminId,
        name: 'Demo Admin',
        email: 'admin@campushub.local',
        password: 'admin123',
        role: 'admin',
        avatar: '',
        banner: '',
        skills: ['management'],
        achievements: ['Platform Owner'],
        subjects: [],
        schedule: [],
        grades: [],
      },
      {
        id: teacherId,
        name: 'Demo Teacher',
        email: 'teacher@campushub.local',
        password: 'teacher123',
        role: 'teacher',
        avatar: '',
        banner: '',
        skills: ['react', 'typescript'],
        achievements: ['Top Mentor'],
        subjects: [subjectId],
        schedule: [
          {
            id: createId('schedule'),
            title: 'Web Development Class',
            date: new Date().toISOString(),
            location: 'Room 203',
          },
        ],
        grades: [],
      },
      {
        id: studentId,
        name: 'Demo Student',
        email: 'student@campushub.local',
        password: 'student123',
        role: 'student',
        avatar: '',
        banner: '',
        skills: ['javascript'],
        achievements: ['Best Attendance'],
        subjects: [subjectId],
        schedule: [
          {
            id: createId('schedule'),
            title: 'Algorithms',
            date: new Date().toISOString(),
            location: 'Room 105',
          },
        ],
        grades: studentGrades,
        attendanceRate: 96,
      },
    ],
    subjects: [
      {
        id: subjectId,
        name: 'Web Development',
        teacherId,
        students: [
          {
            id: studentId,
            name: 'Demo Student',
            grades: studentGrades,
          },
        ],
        grades: studentGrades,
      },
    ],
    chats: [
      {
        id: createId('chat'),
        name: 'General',
        members: [adminId, teacherId, studentId],
        messages: [
          {
            id: createId('msg'),
            sender: teacherId,
            text: 'Welcome to demo mode!',
            type: 'text',
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ],
    announcements: [
      {
        id: createId('ann'),
        title: 'Demo Announcement',
        content: 'GitHub Pages demo mode is active.',
        type: 'info',
        date: new Date().toISOString(),
      },
    ],
  };
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const readDemoDb = (): DemoDB => {
  if (!hasWindow()) return defaultDemoDb();
  const raw = localStorage.getItem(DEMO_DB_KEY);
  if (!raw) {
    const db = defaultDemoDb();
    localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
    return db;
  }
  try {
    const parsed = JSON.parse(raw) as DemoDB;
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.chats) || !Array.isArray(parsed.subjects) || !Array.isArray(parsed.announcements)) {
      throw new Error('Bad demo db shape');
    }
    return parsed;
  } catch {
    const db = defaultDemoDb();
    localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
    return db;
  }
};

const writeDemoDb = (db: DemoDB): void => {
  if (!hasWindow()) return;
  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
};

const toPublicUser = (user: DemoUser): User => {
  const { password: _password, ...rest } = user;
  return rest;
};

const createApiError = (message: string, status = 400): Error & { response: { status: number; data: { error: string } } } => {
  const err = new Error(message) as Error & { response: { status: number; data: { error: string } } };
  err.response = {
    status,
    data: { error: message },
  };
  return err;
};

const getCurrentUser = (): User | null => {
  if (!hasWindow()) return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const findGradeOwnerId = (db: DemoDB, gradeId: string): string | null => {
  for (const u of db.users) {
    if ((u.grades || []).some((g) => g.id === gradeId)) return u.id;
  }
  return null;
};

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<User> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const user = db.users.find(
        (u) =>
          u.email.toLowerCase() === credentials.email.trim().toLowerCase() &&
          u.password === credentials.password
      );
      if (!user) {
        throw createApiError('Неверный email или пароль (demo mode).', 401);
      }
      return {
        ...toPublicUser(user),
        token: createId('demo_token'),
      };
    }

    const response = await axios.post<User>(`${API_URL}/login`, credentials);
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string }): Promise<User> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const exists = db.users.some((u) => u.email.toLowerCase() === userData.email.trim().toLowerCase());
      if (exists) {
        throw createApiError('Пользователь с таким email уже существует.', 409);
      }
      const newUser: DemoUser = {
        id: createId('student'),
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        role: 'student',
        avatar: '',
        banner: '',
        skills: [],
        achievements: [],
        subjects: [],
        schedule: [],
        grades: [],
      };
      db.users.push(newUser);
      writeDemoDb(db);
      return {
        ...toPublicUser(newUser),
        token: createId('demo_token'),
      };
    }

    const response = await axios.post<User>(`${API_URL}/register`, userData);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message?: string }> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const exists = db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      return {
        success: true,
        message: exists
          ? 'Demo: письмо сброса условно отправлено.'
          : 'Demo: email не найден, но ответ всегда успешный.',
      };
    }

    const response = await axios.post<{ success: boolean; message?: string }>(`${API_URL}/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ success: boolean }> => {
    if (USE_DEMO_MODE) {
      return { success: Boolean(token && password) };
    }

    const response = await axios.post<{ success: boolean }>(`${API_URL}/reset-password`, { token, password });
    return response.data;
  },
};

// User API
export const userApi = {
  getUsers: async (): Promise<User[]> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      return db.users.map(toPublicUser);
    }

    const response = await axios.get<User[]>(`${API_URL}/users`);
    return response.data;
  },

  createUser: async (userData: { name: string; email: string; password: string }): Promise<User> => {
    if (USE_DEMO_MODE) {
      return authApi.register(userData);
    }

    const response = await axios.post<User>(`${API_URL}/register`, userData);
    return response.data;
  },

  getAdminStats: async (): Promise<AdminStats> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const users = db.users;
      const totalStudents = users.filter((u) => u.role === 'student').length;
      const totalTeachers = users.filter((u) => u.role === 'teacher').length;
      const totalSubjects = db.subjects.length;
      const allGrades = users.flatMap((u) => u.grades || []);
      const averageGPA = allGrades.length
        ? allGrades.reduce((acc, g) => acc + Number(g.value || 0), 0) / allGrades.length
        : 0;
      const topStudents = users
        .filter((u) => (u.grades || []).length > 0)
        .map((u) => ({
          id: u.id,
          name: u.name,
          gpa: (u.grades || []).reduce((acc, g) => acc + Number(g.value || 0), 0) / (u.grades || []).length,
        }))
        .sort((a, b) => b.gpa - a.gpa)
        .slice(0, 5);
      return { totalStudents, totalTeachers, totalSubjects, averageGPA, topStudents };
    }

    const response = await axios.get<AdminStats>(`${API_URL}/admin/stats`);
    return response.data;
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const idx = db.users.findIndex((u) => u.id === userId);
      if (idx === -1) throw createApiError('Пользователь не найден.', 404);
      db.users[idx] = { ...db.users[idx], ...clone(userData) };
      writeDemoDb(db);
      return toPublicUser(db.users[idx]);
    }

    const response = await axios.put<User>(`${API_URL}/profile/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<{ success: boolean }> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      db.users = db.users.filter((u) => u.id !== userId);
      db.chats.forEach((chat) => {
        chat.members = (chat.members || []).filter((m) => m !== userId);
      });
      writeDemoDb(db);
      return { success: true };
    }

    const response = await axios.delete<{ success: boolean }>(`${API_URL}/admin/users/${userId}`);
    return response.data;
  },

  getUserSchedule: async (userId: string): Promise<ScheduleItem[]> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const user = db.users.find((u) => u.id === userId);
      return clone(user?.schedule || []);
    }

    const response = await axios.get<ScheduleItem[]>(`${API_URL}/schedule/${userId}`);
    return response.data;
  },

  saveUserSchedule: async (userId: string, scheduleData: ScheduleItem[]): Promise<ScheduleItem[]> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const user = db.users.find((u) => u.id === userId);
      if (!user) throw createApiError('Пользователь не найден.', 404);
      user.schedule = clone(scheduleData);
      writeDemoDb(db);
      return clone(user.schedule || []);
    }

    const response = await axios.post<ScheduleItem[]>(`${API_URL}/schedule/${userId}`, { schedule: scheduleData });
    return response.data;
  },
};

// Grade API
export const gradeApi = {
  postGrade: async (
    studentId: string,
    gradeData: { subject: string; value: number; type: string; date: string }
  ): Promise<Grade> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const user = db.users.find((u) => u.id === studentId);
      if (!user) throw createApiError('Студент не найден.', 404);
      const grade: Grade = { id: createId('grade'), ...clone(gradeData) };
      user.grades = [...(user.grades || []), grade];
      writeDemoDb(db);
      return grade;
    }

    const response = await axios.post<Grade>(`${API_URL}/grades/${studentId}`, gradeData);
    return response.data;
  },

  updateGrade: async (
    userId: string,
    gradeId: string,
    gradeData: { value: number; type: string; date: string }
  ): Promise<Grade> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const user = db.users.find((u) => u.id === userId);
      if (!user) throw createApiError('Пользователь не найден.', 404);
      user.grades = (user.grades || []).map((g) => (g.id === gradeId ? { ...g, ...clone(gradeData) } : g));
      const updated = (user.grades || []).find((g) => g.id === gradeId);
      if (!updated) throw createApiError('Оценка не найдена.', 404);
      writeDemoDb(db);
      return updated;
    }

    const response = await axios.put<Grade>(`${API_URL}/grades/${userId}/${gradeId}`, gradeData);
    return response.data;
  },

  deleteGrade: async (userId: string, gradeId: string): Promise<{ success: boolean }> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const user = db.users.find((u) => u.id === userId);
      if (!user) throw createApiError('Пользователь не найден.', 404);
      user.grades = (user.grades || []).filter((g) => g.id !== gradeId);
      writeDemoDb(db);
      return { success: true };
    }

    const response = await axios.delete<{ success: boolean }>(`${API_URL}/grades/${userId}/${gradeId}`);
    return response.data;
  },

  getGrades: async (userId: string): Promise<Grade[]> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const user = db.users.find((u) => u.id === userId);
      return clone(user?.grades || []);
    }

    const response = await axios.get<Grade[]>(`${API_URL}/grades/${userId}`);
    return response.data;
  },
};

// Chat API
export const chatApi = {
  searchUsers: async (query: string, excludeId?: string): Promise<User[]> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const q = query.trim().toLowerCase();
      return db.users
        .filter((u) => u.id !== excludeId)
        .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
        .map(toPublicUser);
    }

    const response = await axios.get<User[]>(
      `${API_URL}/users?search=${encodeURIComponent(query)}&exclude=${excludeId || ''}`
    );
    return response.data;
  },

  getChats: async (userId: string): Promise<Chat[]> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      return clone(db.chats.filter((c) => (c.members || []).includes(userId)));
    }

    const response = await axios.get<Chat[]>(`${API_URL}/chats?userId=${userId}`);
    return response.data;
  },

  createChat: async (members: string[]): Promise<Chat> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const chat: Chat = { id: createId('chat'), members: clone(members), messages: [] };
      db.chats.push(chat);
      writeDemoDb(db);
      return chat;
    }

    const response = await axios.post<Chat>(`${API_URL}/chats`, { members });
    return response.data;
  },

  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const chat = db.chats.find((c) => c.id === chatId);
      return clone(chat?.messages || []);
    }

    const response = await axios.get<ChatMessage[]>(`${API_URL}/chats/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (chatId: string, messageData: ChatMessagePayload): Promise<ChatMessage> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      let chat = db.chats.find((c) => c.id === chatId);
      if (!chat) {
        chat = { id: chatId, members: [messageData.sender], messages: [] };
        db.chats.push(chat);
      }
      const message: ChatMessage = {
        id: createId('msg'),
        sender: messageData.sender,
        text: messageData.text || '',
        type: messageData.type || (messageData.file ? messageData.file.type : 'text'),
        file: messageData.file ? createId('file') : null,
        originalName: messageData.file ? messageData.file.name : null,
        size: messageData.file ? messageData.file.size : 0,
        createdAt: new Date().toISOString(),
      };
      chat.messages = [...(chat.messages || []), message];
      writeDemoDb(db);
      return message;
    }

    const formData = new FormData();
    formData.append('sender', messageData.sender);
    if (messageData.text) formData.append('text', messageData.text);
    if (messageData.type) formData.append('type', messageData.type);
    if (messageData.file) formData.append('file', messageData.file);

    const response = await axios.post<ChatMessage>(`${API_URL}/chats/${chatId}/messages`, formData);
    return response.data;
  },
};

// Subject API
export const subjectApi = {
  getSubjects: async (): Promise<Subject[]> => {
    if (USE_DEMO_MODE) {
      return clone(readDemoDb().subjects);
    }

    const response = await axios.get<Subject[]>(`${API_URL}/subjects`);
    return response.data;
  },

  createSubject: async (subjectData: Partial<Subject>): Promise<Subject> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const subject: Subject = {
        id: createId('subject'),
        students: [],
        grades: [],
        ...clone(subjectData),
      };
      db.subjects.push(subject);
      writeDemoDb(db);
      return subject;
    }

    const response = await axios.post<Subject>(`${API_URL}/subjects`, subjectData);
    return response.data;
  },

  updateSubject: async (subjectId: string, subjectData: Partial<Subject>): Promise<Subject> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const idx = db.subjects.findIndex((s) => s.id === subjectId);
      if (idx === -1) throw createApiError('Предмет не найден.', 404);
      db.subjects[idx] = { ...db.subjects[idx], ...clone(subjectData) };
      writeDemoDb(db);
      return clone(db.subjects[idx]);
    }

    const response = await axios.put<Subject>(`${API_URL}/subjects/${subjectId}`, subjectData);
    return response.data;
  },

  deleteSubject: async (subjectId: string): Promise<{ success: boolean }> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      db.subjects = db.subjects.filter((s) => s.id !== subjectId);
      writeDemoDb(db);
      return { success: true };
    }

    const response = await axios.delete<{ success: boolean }>(`${API_URL}/subjects/${subjectId}`);
    return response.data;
  },
};

// Materials API
export const materialsApi = {
  getFiles: async (userId?: string): Promise<MaterialFile[]> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const allFiles: MaterialFile[] = [];
      db.chats.forEach((chat) => {
        (chat.messages || []).forEach((message) => {
          if (message.file && message.originalName) {
            allFiles.push({
              id: message.id,
              name: String(message.originalName),
              type: message.type,
              size: message.size,
              date: message.createdAt,
              sender: message.sender,
              file: String(message.file),
              chatId: chat.id,
              chatName: chat.name || 'Chat',
            });
          }
        });
      });
      return userId ? allFiles.filter((f) => f.sender === userId) : allFiles;
    }

    const response = await axios.get<Chat[]>(`${API_URL}/chats`);
    const chats = response.data;

    const allFiles: MaterialFile[] = [];
    chats.forEach((chat) => {
      chat.messages?.forEach((message) => {
        if (message.file && message.originalName) {
          allFiles.push({
            id: message.id,
            name: String(message.originalName),
            type: message.type,
            size: message.size,
            date: message.createdAt,
            sender: message.sender,
            file: String(message.file),
            chatId: chat.id,
            chatName: chat.name || 'Chat',
          });
        }
      });
    });

    if (userId) {
      return allFiles.filter((file) => file.sender === userId);
    }

    return allFiles;
  },

  uploadFile: async (file: File): Promise<{ filename: string; originalName: string }> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const currentUser = getCurrentUser();
      const chatId = 'materials_demo_chat';
      let chat = db.chats.find((c) => c.id === chatId);
      if (!chat) {
        chat = { id: chatId, name: 'Materials', members: currentUser?.id ? [currentUser.id] : [], messages: [] };
        db.chats.push(chat);
      }
      const filename = `${createId('upload')}_${file.name}`;
      const message: ChatMessage = {
        id: createId('msg'),
        sender: currentUser?.id || 'demo_user',
        text: '',
        type: file.type || 'application/octet-stream',
        file: filename,
        originalName: file.name,
        size: file.size,
        createdAt: new Date().toISOString(),
      };
      chat.messages = [...(chat.messages || []), message];
      writeDemoDb(db);
      return { filename, originalName: file.name };
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<{ filename: string; originalName: string }>(
      `${API_URL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getFileUrl: (filename: string) => {
    if (USE_DEMO_MODE) return '#';
    return `${API_URL.replace('/api', '')}/uploads/${filename}`;
  },

  downloadFile: async (filename: string, originalName: string) => {
    if (USE_DEMO_MODE) {
      const blob = new Blob([`Demo file: ${filename}`], { type: 'text/plain' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      return;
    }

    const url = materialsApi.getFileUrl(filename);
    const response = await axios.get(url, { responseType: 'blob' });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// Announcements API
export const announcementsApi = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    if (USE_DEMO_MODE) {
      return clone(readDemoDb().announcements);
    }

    const response = await axios.get<Announcement[]>(`${API_URL}/announcements`);
    return response.data;
  },

  createAnnouncement: async (announcementData: Partial<Announcement>): Promise<Announcement> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const item: Announcement = { id: createId('ann'), ...clone(announcementData) };
      db.announcements.push(item);
      writeDemoDb(db);
      return item;
    }

    const response = await axios.post<Announcement>(`${API_URL}/announcements`, announcementData);
    return response.data;
  },

  updateAnnouncement: async (
    announcementId: string,
    announcementData: Partial<Announcement>
  ): Promise<Announcement> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      const idx = db.announcements.findIndex((a) => a.id === announcementId);
      if (idx === -1) throw createApiError('Объявление не найдено.', 404);
      db.announcements[idx] = { ...db.announcements[idx], ...clone(announcementData) };
      writeDemoDb(db);
      return clone(db.announcements[idx]);
    }

    const response = await axios.put<Announcement>(`${API_URL}/announcements/${announcementId}`, announcementData);
    return response.data;
  },

  deleteAnnouncement: async (announcementId: string): Promise<{ success: boolean }> => {
    if (USE_DEMO_MODE) {
      const db = readDemoDb();
      db.announcements = db.announcements.filter((a) => a.id !== announcementId);
      writeDemoDb(db);
      return { success: true };
    }

    const response = await axios.delete<{ success: boolean }>(`${API_URL}/announcements/${announcementId}`);
    return response.data;
  },
};

if (!USE_DEMO_MODE) {
  axios.defaults.baseURL = API_URL;

  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = `${basePath}/login`;
        }
      }
      return Promise.reject(error);
    }
  );
}

export const IS_DEMO_MODE = USE_DEMO_MODE;

// helper used only by legacy wrappers
export const __demoHelpers = {
  readDemoDb,
  writeDemoDb,
  toPublicUser,
  findGradeOwnerId,
};

