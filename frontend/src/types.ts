export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'banned' | 'inactive';
  followers_count: number;
  following_count: number;
  posts_count: number;
  isFollowing?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author: User;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  isLiked?: boolean;
  hashtags?: Hashtag[];
}

export interface Comment {
  id: number;
  content: string;
  author_id: number;
  post_id: number;
  author: User;
  created_at: string;
  updated_at: string;
  likes_count: number;
  isLiked?: boolean;
}

export interface Hashtag {
  id: number;
  name: string;
  posts_count: number;
  created_at: string;
} 