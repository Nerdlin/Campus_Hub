import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const isGitHubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const API_URL = process.env.NEXT_PUBLIC_API_URL || (isGitHubPages ? '' : 'http://localhost:4000/api');

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

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<User> => {
    const response = await axios.post<User>(`${API_URL}/login`, credentials);
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string }): Promise<User> => {
    const response = await axios.post<User>(`${API_URL}/register`, userData);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message?: string }> => {
    const response = await axios.post<{ success: boolean; message?: string }>(`${API_URL}/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ success: boolean }> => {
    const response = await axios.post<{ success: boolean }>(`${API_URL}/reset-password`, { token, password });
    return response.data;
  },
};

// User API
export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await axios.get<User[]>(`${API_URL}/users`);
    return response.data;
  },

  createUser: async (userData: { name: string; email: string; password: string }): Promise<User> => {
    const response = await axios.post<User>(`${API_URL}/register`, userData);
    return response.data;
  },

  getAdminStats: async (): Promise<AdminStats> => {
    const response = await axios.get<AdminStats>(`${API_URL}/admin/stats`);
    return response.data;
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await axios.put<User>(`${API_URL}/profile/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<{ success: boolean }> => {
    const response = await axios.delete<{ success: boolean }>(`${API_URL}/admin/users/${userId}`);
    return response.data;
  },

  getUserSchedule: async (userId: string): Promise<ScheduleItem[]> => {
    const response = await axios.get<ScheduleItem[]>(`${API_URL}/schedule/${userId}`);
    return response.data;
  },

  saveUserSchedule: async (userId: string, scheduleData: ScheduleItem[]): Promise<ScheduleItem[]> => {
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
    const response = await axios.post<Grade>(`${API_URL}/grades/${studentId}`, gradeData);
    return response.data;
  },

  updateGrade: async (
    userId: string,
    gradeId: string,
    gradeData: { value: number; type: string; date: string }
  ): Promise<Grade> => {
    const response = await axios.put<Grade>(`${API_URL}/grades/${userId}/${gradeId}`, gradeData);
    return response.data;
  },

  deleteGrade: async (userId: string, gradeId: string): Promise<{ success: boolean }> => {
    const response = await axios.delete<{ success: boolean }>(`${API_URL}/grades/${userId}/${gradeId}`);
    return response.data;
  },

  getGrades: async (userId: string): Promise<Grade[]> => {
    const response = await axios.get<Grade[]>(`${API_URL}/grades/${userId}`);
    return response.data;
  },
};

// Chat API
export const chatApi = {
  searchUsers: async (query: string, excludeId?: string): Promise<User[]> => {
    const response = await axios.get<User[]>(
      `${API_URL}/users?search=${encodeURIComponent(query)}&exclude=${excludeId || ''}`
    );
    return response.data;
  },

  getChats: async (userId: string): Promise<Chat[]> => {
    const response = await axios.get<Chat[]>(`${API_URL}/chats?userId=${userId}`);
    return response.data;
  },

  createChat: async (members: string[]): Promise<Chat> => {
    const response = await axios.post<Chat>(`${API_URL}/chats`, { members });
    return response.data;
  },

  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
    const response = await axios.get<ChatMessage[]>(`${API_URL}/chats/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (chatId: string, messageData: ChatMessagePayload): Promise<ChatMessage> => {
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
    const response = await axios.get<Subject[]>(`${API_URL}/subjects`);
    return response.data;
  },

  createSubject: async (subjectData: Partial<Subject>): Promise<Subject> => {
    const response = await axios.post<Subject>(`${API_URL}/subjects`, subjectData);
    return response.data;
  },

  updateSubject: async (subjectId: string, subjectData: Partial<Subject>): Promise<Subject> => {
    const response = await axios.put<Subject>(`${API_URL}/subjects/${subjectId}`, subjectData);
    return response.data;
  },

  deleteSubject: async (subjectId: string): Promise<{ success: boolean }> => {
    const response = await axios.delete<{ success: boolean }>(`${API_URL}/subjects/${subjectId}`);
    return response.data;
  },
};

// Materials API
export const materialsApi = {
  getFiles: async (userId?: string): Promise<MaterialFile[]> => {
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
    return `${API_URL.replace('/api', '')}/uploads/${filename}`;
  },

  downloadFile: async (filename: string, originalName: string) => {
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
    const response = await axios.get<Announcement[]>(`${API_URL}/announcements`);
    return response.data;
  },

  createAnnouncement: async (announcementData: Partial<Announcement>): Promise<Announcement> => {
    const response = await axios.post<Announcement>(`${API_URL}/announcements`, announcementData);
    return response.data;
  },

  updateAnnouncement: async (
    announcementId: string,
    announcementData: Partial<Announcement>
  ): Promise<Announcement> => {
    const response = await axios.put<Announcement>(`${API_URL}/announcements/${announcementId}`, announcementData);
    return response.data;
  },

  deleteAnnouncement: async (announcementId: string): Promise<{ success: boolean }> => {
    const response = await axios.delete<{ success: boolean }>(`${API_URL}/announcements/${announcementId}`);
    return response.data;
  },
};

// Configure axios defaults
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
