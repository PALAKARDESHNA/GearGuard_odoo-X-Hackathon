import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (name: string, email: string, password: string, role?: string) =>
    api.post('/auth/register', { name, email, password, role }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: (token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return api.get('/auth/me', { headers });
  },
};

// Equipment API
export const equipmentAPI = {
  getAll: (params?: any) => api.get('/equipment', { params }),
  getById: (id: number) => api.get(`/equipment/${id}`),
  getRequests: (id: number) => api.get(`/equipment/${id}/requests`),
  create: (data: any) => api.post('/equipment', data),
  update: (id: number, data: any) => api.put(`/equipment/${id}`, data),
  delete: (id: number) => api.delete(`/equipment/${id}`),
};

// Teams API
export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getById: (id: number) => api.get(`/teams/${id}`),
  create: (data: any) => api.post('/teams', data),
  update: (id: number, data: any) => api.put(`/teams/${id}`, data),
  addMember: (teamId: number, userId: number) => api.post(`/teams/${teamId}/members`, { user_id: userId }),
  removeMember: (teamId: number, userId: number) => api.delete(`/teams/${teamId}/members/${userId}`),
  delete: (id: number) => api.delete(`/teams/${id}`),
};

// Requests API
export const requestsAPI = {
  getAll: (params?: any) => api.get('/requests', { params }),
  getCalendar: (params?: any) => api.get('/requests/calendar', { params }),
  getById: (id: number) => api.get(`/requests/${id}`),
  create: (data: any) => api.post('/requests', data),
  update: (id: number, data: any) => api.put(`/requests/${id}`, data),
  assign: (id: number, technicianId: number, stage?: string) => 
    api.post(`/requests/${id}/assign`, { technician_id: technicianId, stage }),
  delete: (id: number) => api.delete(`/requests/${id}`),
  getPivotReport: (groupBy: 'team' | 'equipment_category') => 
    api.get('/requests/reports/pivot', { params: { group_by: groupBy } }),
};

// Users API
export const usersAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Departments API
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  getById: (id: number) => api.get(`/departments/${id}`),
  create: (data: any) => api.post('/departments', data),
  update: (id: number, data: any) => api.put(`/departments/${id}`, data),
  delete: (id: number) => api.delete(`/departments/${id}`),
};

export default api;

