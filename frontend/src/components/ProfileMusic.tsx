import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  MusicNote as MusicNoteIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Music {
  title: string;
  artist: string;
  url: string;
}

interface ProfileMusicProps {
  music: Music | undefined;
  onMusicUpdate: (music: Music | null) => void;
}

export const ProfileMusic: React.FC<ProfileMusicProps> = ({ music, onMusicUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an audio
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Audio size should be less than 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('music', file);

      const response = await axios.post('/api/music/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });

      onMusicUpdate(response.data);
    } catch (err) {
      setError('Failed to upload music. Please try again.');
      console.error('Error uploading music:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await axios.delete('/api/music/remove');
      onMusicUpdate(null);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      setError('Failed to remove music. Please try again.');
      console.error('Error removing music:', err);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(music?.url);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Box>
      {music ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            backgroundColor: 'background.default',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <IconButton 
            onClick={togglePlay}
            color="primary"
            sx={{ 
              width: 48, 
              height: 48,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" noWrap>
              {music.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {music.artist}
            </Typography>
          </Box>
          <Tooltip title="Remove Music">
            <IconButton
              color="error"
              onClick={handleRemove}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Paper>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <input
            accept="audio/*"
            style={{ display: 'none' }}
            id="music-upload"
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            ref={fileInputRef}
          />
          <label htmlFor="music-upload">
            <Button
              variant="contained"
              component="span"
              disabled={isUploading}
              startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              sx={{ minWidth: '200px' }}
            >
              {isUploading ? 'Uploading...' : 'Upload Music'}
            </Button>
          </label>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Max size: 10MB, Supported formats: MP3, WAV, OGG
          </Typography>
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