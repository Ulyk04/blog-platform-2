import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  MusicNote as MusicNoteIcon,
  Videocam as VideocamIcon,
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface ProfileStatsProps {
  stats: {
    totalVideos: number;
    totalMusic: number;
    totalLikes: number;
    totalViews: number;
  };
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  const statItems = [
    {
      icon: <VideocamIcon />,
      label: 'Videos',
      value: stats.totalVideos,
      tooltip: 'Total number of uploaded videos'
    },
    {
      icon: <MusicNoteIcon />,
      label: 'Music',
      value: stats.totalMusic,
      tooltip: 'Total number of uploaded music tracks'
    },
    {
      icon: <FavoriteIcon />,
      label: 'Likes',
      value: stats.totalLikes,
      tooltip: 'Total number of likes received'
    },
    {
      icon: <VisibilityIcon />,
      label: 'Views',
      value: stats.totalViews,
      tooltip: 'Total number of profile views'
    }
  ];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        backgroundColor: 'background.default',
        borderRadius: 2
      }}
    >
      <Grid container spacing={2}>
        {statItems.map((item, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 0.5
                }}
              >
                {item.icon}
                <Typography variant="subtitle2" color="text.secondary">
                  {item.label}
                </Typography>
                <Tooltip title={item.tooltip}>
                  <IconButton size="small" sx={{ p: 0.5 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h6" component="div">
                {item.value.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}; 