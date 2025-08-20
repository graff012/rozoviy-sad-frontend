import axios from 'axios';
import { API_URL } from '../config';

export interface LikeResponse {
  success: boolean;
  message: string;
  isLiked: boolean;
  flowerId: string;
  userId: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const toggleLike = async (flowerId: string, userId: string): Promise<LikeResponse> => {
  try {
    const response = await api.post<LikeResponse>(
      `/flowers/${flowerId}/like`,
      { userId }
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling like:', error);
    // For now, we'll use the test endpoint
    try {
      const testResponse = await axios.get<LikeResponse>(
        `${API_URL}/flowers/test-like/${flowerId}/${userId}`,
        { withCredentials: true }
      );
      return testResponse.data;
    } catch (testError) {
      console.error('Test like endpoint also failed:', testError);
      throw testError;
    }
  }
};
