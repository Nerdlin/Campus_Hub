import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await axios.post(`${API_URL}/reset-password`, { token, password });
    return response.data;
  },
};

// User API
export const userApi = {
  getUsers: async () => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  getAdminStats: async () => {
    const response = await axios.get(`${API_URL}/admin/stats`);
    return response.data;
  },

  updateUser: async (userId: string, userData: any) => {
    const response = await axios.put(`${API_URL}/profile/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await axios.delete(`${API_URL}/admin/users/${userId}`);
    return response.data;
  },

  getUserSchedule: async (userId: string) => {
    const response = await axios.get(`${API_URL}/schedule/${userId}`);
    return response.data;
  },

  saveUserSchedule: async (userId: string, scheduleData: any) => {
    const response = await axios.post(`${API_URL}/schedule/${userId}`, { schedule: scheduleData });
    return response.data;
  },
};

// Grade API
export const gradeApi = {
  postGrade: async (studentId: string, gradeData: { subject: string; value: number; type: string; date: string }) => {
    const response = await axios.post(`${API_URL}/grades/${studentId}`, gradeData);
    return response.data;
  },

  updateGrade: async (userId: string, gradeId: string, gradeData: { value: number; type: string; date: string }) => {
    const response = await axios.put(`${API_URL}/grades/${userId}/${gradeId}`, gradeData);
    return response.data;
  },

  deleteGrade: async (userId: string, gradeId: string) => {
    const response = await axios.delete(`${API_URL}/grades/${userId}/${gradeId}`);
    return response.data;
  },

  getGrades: async (userId: string) => {
    const response = await axios.get(`${API_URL}/grades/${userId}`);
    return response.data;
  },
};

// Chat API
export const chatApi = {
  searchUsers: async (query: string, excludeId?: string) => {
    const response = await axios.get(`${API_URL}/users?search=${encodeURIComponent(query)}&exclude=${excludeId || ''}`);
    return response.data;
  },

  getChats: async (userId: string) => {
    const response = await axios.get(`${API_URL}/chats?userId=${userId}`);
    return response.data;
  },

  createChat: async (members: string[]) => {
    const response = await axios.post(`${API_URL}/chats`, { members });
    return response.data;
  },

  getMessages: async (chatId: string) => {
    const response = await axios.get(`${API_URL}/chats/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (chatId: string, messageData: { sender: string; text?: string; type?: string; file?: File }) => {
    const formData = new FormData();
    formData.append('sender', messageData.sender);
    if (messageData.text) formData.append('text', messageData.text);
    if (messageData.type) formData.append('type', messageData.type);
    if (messageData.file) formData.append('file', messageData.file);

    const response = await axios.post(`${API_URL}/chats/${chatId}/messages`, formData);
    return response.data;
  },
};

// Subject API
export const subjectApi = {
  getSubjects: async () => {
    const response = await axios.get(`${API_URL}/subjects`);
    return response.data;
  },

  createSubject: async (subjectData: any) => {
    const response = await axios.post(`${API_URL}/subjects`, subjectData);
    return response.data;
  },

  updateSubject: async (subjectId: string, subjectData: any) => {
    const response = await axios.put(`${API_URL}/subjects/${subjectId}`, subjectData);
    return response.data;
  },

  deleteSubject: async (subjectId: string) => {
    const response = await axios.delete(`${API_URL}/subjects/${subjectId}`);
    return response.data;
  },
};

// Materials API
export const materialsApi = {
  // Получить список всех файлов из чатов (временное решение)
  getFiles: async (userId?: string) => {
    const response = await axios.get(`${API_URL}/chats`);
    const chats = response.data;
    
    // Собираем все файлы из всех чатов
    const allFiles: any[] = [];
    chats.forEach((chat: any) => {
      chat.messages?.forEach((message: any) => {
        if (message.file && message.originalName) {
          allFiles.push({
            id: message.id,
            name: message.originalName,
            type: message.type,
            size: message.size,
            date: message.createdAt,
            sender: message.sender,
            file: message.file,
            chatId: chat.id,
            chatName: chat.name || 'Чат'
          });
        }
      });
    });
    
    // Фильтруем по пользователю, если указан
    if (userId) {
      return allFiles.filter(file => file.sender === userId);
    }
    
    return allFiles;
  },

  // Загрузить файл
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Получить URL для скачивания файла
  getFileUrl: (filename: string) => {
    return `${API_URL.replace('/api', '')}/uploads/${filename}`;
  },

  // Скачать файл
  downloadFile: async (filename: string, originalName: string) => {
    const url = materialsApi.getFileUrl(filename);
    const response = await axios.get(url, { responseType: 'blob' });
    
    // Создаем ссылку для скачивания
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
  getAnnouncements: async () => {
    const response = await axios.get(`${API_URL}/announcements`);
    return response.data;
  },

  createAnnouncement: async (announcementData: any) => {
    const response = await axios.post(`${API_URL}/announcements`, announcementData);
    return response.data;
  },

  updateAnnouncement: async (announcementId: string, announcementData: any) => {
    const response = await axios.put(`${API_URL}/announcements/${announcementId}`, announcementData);
    return response.data;
  },

  deleteAnnouncement: async (announcementId: string) => {
    const response = await axios.delete(`${API_URL}/announcements/${announcementId}`);
    return response.data;
  },
};

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Add request interceptor to include auth token
axios.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
); 