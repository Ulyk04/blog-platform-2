import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, PhotoCamera } from '@mui/icons-material';
import { Post } from '../types';
import { posts, users } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const allPosts = await posts.getAll();
        const filteredPosts = allPosts.filter(post => post.author_id === Number(user?.id));
        setUserPosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      setUsername(user.username);
      setBio(user.bio || '');
      fetchUserPosts();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await users.updateProfile({ username, bio });
      updateUser(updatedUser);
      setSuccess('Profile updated successfully');
    } catch (error) {
      setError('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера файла (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    // Проверка типа файла
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Only JPEG, PNG and GIF images are allowed');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/users/me/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload avatar');
      }

      const data = await response.json();
      updateUser(data);
      setSuccess('Avatar updated successfully');
    } catch (error: any) {
      setError(error.message || 'Failed to upload avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar
          src={user.avatar ? `http://localhost:5000${user.avatar}` : undefined}
          alt={user.username}
          sx={{ width: 100, height: 100, mr: 2 }}
        />
        <Box>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
          <label htmlFor="avatar-upload">
            <IconButton
              color="primary"
              component="span"
              disabled={uploading}
            >
              <PhotoCamera />
            </IconButton>
          </label>
          {uploading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          margin="normal"
          multiline
          rows={4}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        My Posts
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr' }, gap: 3 }}>
          {userPosts.map((post) => (
            <Box key={post.id} sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {post.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {post.content}
              </Typography>
              {post.tag && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ mr: 1 }}
                  >
                    {post.tag}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Profile; 