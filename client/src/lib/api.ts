import axios from 'axios';
import type {
  User, FarmerProfile, Crop, FarmerCrop, FarmingActivity,
  CalendarEntry, WeatherData, Notification, Conversation,
  Message, DiseaseReport, SoilRecord, KnowledgeArticle,
  AdminStats, RegisterData,
} from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === 'object' && 'data' in res.data) {
      const payload = res.data.data;
      const original = res.data;

      if (Array.isArray(payload)) {
        res.data = {
          ...original,
          data: payload,
          crops: payload,
          farmer_crops: payload,
          entries: payload,
          activities: payload,
          conversations: payload,
          reports: payload,
          records: payload,
          articles: payload,
          notifications: payload,
          farmers: payload,
        };
      } else if (payload && typeof payload === 'object') {
        res.data = {
          ...original,
          ...payload,
          crop: payload,
          farmer_crop: payload,
          article: payload,
          report: payload,
          record: payload,
          profile: payload.profile || payload,
        };
      }
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (mobile: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { mobile, password }),
  register: (data: RegisterData) =>
    api.post<{ token: string; user: User }>('/auth/register', data),
  me: () => api.get<{ user: User }>('/auth/me'),
};

// Profile
export const profileApi = {
  get: () => api.get<{ profile: FarmerProfile }>('/profile'),
  update: (data: Partial<FarmerProfile>) => api.put('/profile', data),
};

// Crops (reference)
export const cropsApi = {
  list: () => api.get<{ crops: Crop[] }>('/crops'),
  get: (id: number) => api.get<{ crop: Crop }>(`/crops/${id}`),
  create: (data: Partial<Crop>) => api.post('/crops', data),
  update: (id: number, data: Partial<Crop>) => api.put(`/crops/${id}`, data),
  delete: (id: number) => api.delete(`/crops/${id}`),
};

// Farmer Crops
export const farmerCropsApi = {
  list: () => api.get<{ farmer_crops: FarmerCrop[] }>('/farmer-crops'),
  get: (id: number) => api.get<{ farmer_crop: FarmerCrop }>(`/farmer-crops/${id}`),
  add: (data: { crop_id: number; sowing_date: string; field_size: number; variety?: string }) =>
    api.post<{ farmer_crop: FarmerCrop }>('/farmer-crops', data),
  update: (id: number, data: Partial<FarmerCrop>) => api.put(`/farmer-crops/${id}`, data),
  delete: (id: number) => api.delete(`/farmer-crops/${id}`),
};

// Activities
export const activitiesApi = {
  list: (farmerCropId: number) =>
    api.get<{ activities: FarmingActivity[] }>(`/activities?farmer_crop_id=${farmerCropId}`),
  create: (data: Partial<FarmingActivity>) => api.post('/activities', data),
};

// Calendar
export const calendarApi = {
  list: (params?: { farmer_crop_id?: number; start_date?: string; end_date?: string }) =>
    api.get<{ entries: CalendarEntry[] }>('/calendar', { params }),
  updateStatus: (id: number, status: string) => api.put(`/calendar/${id}`, { status }),
};

// Weather
export const weatherApi = {
  get: (lat?: number, lng?: number) =>
    api.get<WeatherData>('/weather', { params: { lat, lng } }),
};

// Assistant
export const assistantApi = {
  conversations: () => api.get<{ conversations: Conversation[] }>('/assistant/conversations'),
  getConversation: (id: number) =>
    api.get<{ conversation: Conversation; messages: Message[] }>(`/assistant/conversations/${id}`),
  createConversation: (title: string, crop_id?: number) =>
    api.post<{ conversation: Conversation }>('/assistant/conversations', { title, crop_id }),
  deleteConversation: (id: number) => api.delete(`/assistant/conversations/${id}`),
  chat: (conversationId: number, message: string, crop_id?: number) =>
    api.post<{ message: Message }>('/assistant/chat', {
      conversation_id: conversationId,
      message,
      crop_id,
    }),
};

// Disease
export const diseaseApi = {
  analyze: (formData: FormData) =>
    api.post<{ report: DiseaseReport }>('/disease/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  reports: () => api.get<{ reports: DiseaseReport[] }>('/disease/reports'),
};

// Soil
export const soilApi = {
  records: () => api.get<{ records: SoilRecord[] }>('/soil'),
  analyze: (data: Partial<SoilRecord>) =>
    api.post<{ record: SoilRecord; recommendations: string }>('/soil', data),
};

// Knowledge
export const knowledgeApi = {
  list: (params?: { category?: string; crop_id?: number; search?: string }) =>
    api.get<{ articles: KnowledgeArticle[] }>('/knowledge', { params }),
  get: (id: number) => api.get<{ article: KnowledgeArticle }>(`/knowledge/${id}`),
  create: (data: Partial<KnowledgeArticle>) => api.post('/knowledge', data),
  update: (id: number, data: Partial<KnowledgeArticle>) => api.put(`/knowledge/${id}`, data),
  delete: (id: number) => api.delete(`/knowledge/${id}`),
};

// Notifications
export const notificationsApi = {
  list: () => api.get<{ notifications: Notification[] }>('/notifications'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id: number) => api.delete(`/notifications/${id}`),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
};

// Admin
export const adminApi = {
  stats: () => api.get<AdminStats>('/admin/stats'),
  farmers: () => api.get<{ farmers: (User & { profile: FarmerProfile })[] }>('/admin/farmers'),
  deleteFarmer: (id: number) => api.delete(`/admin/farmers/${id}`),
};

export default api;
