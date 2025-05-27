import React, { useState, useRef } from 'react';
import { Box, Button, Typography, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import axios from 'axios';

interface Video {
  title: string;
  url: string;
  thumbnail?: string;
  duration?: number;
}

interface ProfileVideoProps {
  video: Video | undefined;
  onVideoUpdate: (video: Video | null) => void;
}

export const ProfileVideo: React.FC<ProfileVideoProps> = ({ video, onVideoUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const validateVideo = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        // Check if video is longer than 60 seconds
        if (video.duration > 60) {
          setError('Video should be shorter than 60 seconds');
          resolve(false);
        } else {
          resolve(true);
        }
      };

      video.onerror = () => {
        setError('Invalid video file');
        resolve(false);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Video size should be less than 50MB');
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Validate video duration
    const isValid = await validateVideo(file);
    if (!isValid) {
      URL.revokeObjectURL(preview);
      setPreviewUrl(null);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await axios.post('/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });

      onVideoUpdate(response.data);
      setPreviewUrl(null);
    } catch (err) {
      setError('Failed to upload video. Please try again.');
      console.error('Error uploading video:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await axios.delete('/api/videos/remove');
      onVideoUpdate(null);
    } catch (err) {
      setError('Failed to remove video. Please try again.');
      console.error('Error removing video:', err);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ 
      border: '1px dashed',
      borderColor: 'divider',
      borderRadius: 2,
      p: 2,
      backgroundColor: 'background.paper'
    }}>
      {video ? (
        <Box>
          <Box sx={{ position: 'relative' }}>
            <video
              ref={videoRef}
              controls
              width="100%"
              style={{ 
                maxHeight: '400px', 
                objectFit: 'contain',
                borderRadius: '8px'
              }}
              src={video.url}
              poster={video.thumbnail}
            />
            {video.duration && (
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: 1
                }}
              >
                {formatDuration(video.duration)}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="subtitle1">
              {video.title}
            </Typography>
            <Tooltip title="Remove Video">
              <IconButton
                color="error"
                onClick={handleRemove}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          {previewUrl ? (
            <Box>
              <video
                controls
                width="100%"
                style={{ 
                  maxHeight: '300px', 
                  objectFit: 'contain',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}
                src={previewUrl}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    const input = document.getElementById('video-upload') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  Upload
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <input
                accept="video/*"
                style={{ display: 'none' }}
                id="video-upload"
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <label htmlFor="video-upload">
                <Button
                  variant="contained"
                  component="span"
                  disabled={isUploading}
                  startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  sx={{ minWidth: '200px' }}
                >
                  {isUploading ? 'Uploading...' : 'Upload Short Video'}
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Max duration: 60 seconds, Max size: 50MB
              </Typography>
            </Box>
          )}
        </Box>
      )}
      {error && (
        <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}; 