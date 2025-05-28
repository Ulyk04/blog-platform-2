import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Favorite, FavoriteBorder, Delete } from '@mui/icons-material';
import { Post } from '../types';
import { posts } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CommentList from '../components/CommentList';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await posts.getById(id!);
        setPost(data);
      } catch (error) {
        setError('Failed to load post');
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!post) return;

    try {
      const updatedPost = await posts.like(post.id.toString());
      setPost(updatedPost);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    try {
      await posts.delete(post.id.toString());
      navigate('/');
    } catch (error) {
      setError('Failed to delete post');
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Post not found</Alert>
      </Container>
    );
  }

  const isAuthor = user && post.author_id === Number(user.id);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        {post.title}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          By {post.author?.username || 'Unknown'} • {new Date(post.created_at).toLocaleDateString()}
        </Typography>
      </Box>

      {post.tag && (
        <Box sx={{ mb: 3 }}>
          <Chip label={post.tag} sx={{ mr: 1, mb: 1 }} />
        </Box>
      )}

      <Typography variant="body1" paragraph>
        {post.content}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        {user && (
          <Button
            startIcon={post.likes?.includes(Number(user.id)) ? <Favorite color="error" /> : <FavoriteBorder />}
            onClick={handleLike}
          >
            {post.likes?.length || 0} {post.likes?.length === 1 ? 'Like' : 'Likes'}
          </Button>
        )}

        {isAuthor && (
          <Button
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            Delete Post
          </Button>
        )}
      </Box>

      {user && (
        <CommentList
          postId={post.id.toString()}
          currentUserId={user.id.toString()}
        />
      )}
    </Container>
  );
};

export default PostDetail; 