import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    profession?: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getProfile: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', data),

  loginWithOtp: (data: { email: string; otp: string }) =>
    api.post('/auth/login-with-otp', data),

  verifyEmail: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-email', data),

  resendOtp: (data: { email: string }) =>
    api.post('/auth/resend-otp', data),
};
