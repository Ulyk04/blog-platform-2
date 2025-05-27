import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterCredentials, Post, BlogComment, User } from '../types';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data.user;
  },

  register: async (email: string, password: string, username: string): Promise<User> => {
    const response = await api.post('/auth/register', { email, password, username });
    localStorage.setItem('token', response.data.token);
    return response.data.user;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

export const posts = {
  getAll: async (): Promise<Post[]> => {
    const response = await api.get<Post[]>('/posts');
    return response.data;
  },

  getById: async (id: string): Promise<Post> => {
    const response = await api.get<Post>(`/posts/${id}`);
    return response.data;
  },

  create: async (post: { title: string; content: string; tag: string }): Promise<Post> => {
    const response = await api.post<Post>('/posts', post);
    return response.data;
  },

  update: async (id: string, post: { title?: string; content?: string; tags?: string[] }): Promise<Post> => {
    const response = await api.put<Post>(`/posts/${id}`, post);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  like: async (id: string): Promise<Post> => {
    const response = await api.put<Post>(`/posts/${id}/like`);
    return response.data;
  },

  addComment: async (postId: string, content: string): Promise<Post> => {
    const response = await api.post<Post>(`/posts/${postId}/comments`, { content });
    return response.data;
  },
};

export const users = {
  updateProfile: async (data: { username?: string; bio?: string; avatar?: string }) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 