export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  tag?: string;
  author_id: number;
  author?: User;
  created_at: string;
  updated_at: string;
  likes?: number[];
  comments?: BlogComment[];
}

export interface BlogComment {
  id: number;
  content: string;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
} 