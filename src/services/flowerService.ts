import axios from 'axios';

export interface LikeResponse {
  success: boolean;
  message: string;
  isLiked: boolean;
  flowerId: string;
  userId: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
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
        `http://localhost:4000/api/flowers/test-like/${flowerId}/${userId}`,
        { withCredentials: true }
      );
      return testResponse.data;
    } catch (testError) {
      console.error('Test like endpoint also failed:', testError);
      throw testError;
    }
  }
};
