import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Skeleton,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { ProfileMusic } from './ProfileMusic';
import { ProfileVideo } from './ProfileVideo';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileStats } from './ProfileStats';
import axios from 'axios';

interface Music {
  title: string;
  artist: string;
  url: string;
}

interface Video {
  title: string;
  url: string;
  thumbnail?: string;
  duration?: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  music?: Music;
  video?: Video;
  stats?: {
    totalVideos: number;
    totalMusic: number;
    totalLikes: number;
    totalViews: number;
  };
}

export const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/users/me');
        setUser(response.data);
        setEditedBio(response.data.bio || '');
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load profile data');
        showSnackbar('Failed to load profile data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleMusicUpdate = (music: Music | null) => {
    setUser(prev => prev ? { ...prev, music: music || undefined } : null);
    showSnackbar(
      music ? 'Music updated successfully' : 'Music removed successfully',
      'success'
    );
  };

  const handleVideoUpdate = (video: Video | null) => {
    setUser(prev => prev ? { ...prev, video: video || undefined } : null);
    showSnackbar(
      video ? 'Video updated successfully' : 'Video removed successfully',
      'success'
    );
  };

  const handleAvatarUpdate = (avatarUrl: string | null) => {
    setUser(prev => prev ? { ...prev, avatar: avatarUrl || undefined } : null);
    showSnackbar(
      avatarUrl ? 'Avatar updated successfully' : 'Avatar removed successfully',
      'success'
    );
  };

  const handleBioSave = async () => {
    try {
      const response = await axios.patch('/api/users/me', { bio: editedBio });
      setUser(prev => prev ? { ...prev, bio: response.data.bio } : null);
      setIsEditing(false);
      showSnackbar('Bio updated successfully', 'success');
    } catch (error) {
      console.error('Error updating bio:', error);
      setError('Failed to update bio');
      showSnackbar('Failed to update bio', 'error');
    }
  };

  const handleBioCancel = () => {
    setEditedBio(user?.bio || '');
    setIsEditing(false);
  };

  const handleShare = async () => {
    try {
      const profileUrl = `${window.location.origin}/profile/${user?.username}`;
      await navigator.clipboard.writeText(profileUrl);
      showSnackbar('Profile link copied to clipboard', 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showSnackbar('Failed to copy profile link', 'error');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={100} height={100} sx={{ mr: 2 }} />
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="80%" />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={100} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          {error || 'Failed to load profile'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
          <ProfileAvatar
            avatarUrl={user.avatar}
            username={user.username}
            onAvatarUpdate={handleAvatarUpdate}
          />
          <Box sx={{ flex: 1, ml: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h4">
                {user.username}
              </Typography>
              <Tooltip title="Share Profile">
                <IconButton onClick={handleShare} size="small">
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {isEditing ? (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    resize: 'vertical'
                  }}
                  placeholder="Write something about yourself..."
                />
                <Box>
                  <Tooltip title="Save">
                    <IconButton color="primary" onClick={handleBioSave}>
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton color="error" onClick={handleBioCancel}>
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    flex: 1,
                    fontStyle: user.bio ? 'normal' : 'italic'
                  }}
                >
                  {user.bio || 'No bio yet. Click edit to add one.'}
                </Typography>
                <Tooltip title="Edit Bio">
                  <IconButton 
                    size="small" 
                    onClick={() => setIsEditing(true)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>

        {user.stats && <ProfileStats stats={user.stats} />}
      </Paper>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          My Music
        </Typography>
        <ProfileMusic 
          music={user.music} 
          onMusicUpdate={handleMusicUpdate}
        />
      </Paper>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          My Short Video
        </Typography>
        <ProfileVideo
          video={user.video}
          onVideoUpdate={handleVideoUpdate}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 