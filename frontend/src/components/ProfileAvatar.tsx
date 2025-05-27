import React, { useState, useRef } from 'react';
import { 
  Avatar, 
  Box, 
  IconButton, 
  Tooltip, 
  CircularProgress,
  Typography
} from '@mui/material';
import { 
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

interface ProfileAvatarProps {
  avatarUrl?: string;
  username: string;
  onAvatarUpdate: (url: string | null) => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarUrl,
  username,
  onAvatarUpdate
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });

      onAvatarUpdate(response.data.avatarUrl);
    } catch (err) {
      setError('Failed to upload avatar. Please try again.');
      console.error('Error uploading avatar:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await axios.delete('/api/users/avatar');
      onAvatarUpdate(null);
    } catch (err) {
      setError('Failed to remove avatar. Please try again.');
      console.error('Error removing avatar:', err);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="avatar-upload"
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        ref={fileInputRef}
      />
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          src={avatarUrl}
          alt={username}
          sx={{ 
            width: 100, 
            height: 100,
            border: '2px solid',
            borderColor: 'primary.main',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8
            }
          }}
          onClick={() => fileInputRef.current?.click()}
        />
        {isUploading && (
          <CircularProgress
            size={100}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
            }}
          />
        )}
      </Box>
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        right: 0,
        display: 'flex',
        gap: 1
      }}>
        <Tooltip title="Change Avatar">
          <IconButton
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            sx={{ 
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'background.paper' }
            }}
          >
            <PhotoCameraIcon />
          </IconButton>
        </Tooltip>
        {avatarUrl && (
          <Tooltip title="Remove Avatar">
            <IconButton
              size="small"
              onClick={handleRemove}
              disabled={isUploading}
              sx={{ 
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'background.paper' }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {error && (
        <Typography 
          color="error" 
          variant="caption" 
          sx={{ 
            display: 'block',
            mt: 1,
            textAlign: 'center'
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}; 