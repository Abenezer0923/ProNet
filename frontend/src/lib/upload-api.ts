import axios from 'axios';

// Direct connection to user-service for file uploads
// This bypasses the API gateway to avoid proxy issues
const USER_SERVICE_URL =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  'https://pronet-user-service.onrender.com';

export const uploadApi = axios.create({
  baseURL: USER_SERVICE_URL,
  timeout: 60000, // 60 seconds for file uploads
});

// Add auth token to all requests
uploadApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors
uploadApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Upload API error:', error);
    return Promise.reject(error);
  },
);

// Helper function to upload images
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await uploadApi.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};
