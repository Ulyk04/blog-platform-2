import React from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { format } from 'date-fns';

interface CommentProps {
  id: string;
  content: string;
  author: {
    username: string;
  };
  createdAt: string;
  isAuthor: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
}

const Comment: React.FC<CommentProps> = ({
  id,
  content,
  author,
  createdAt,
  isAuthor,
  onDelete,
  onEdit
}) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {author.username} • {format(new Date(createdAt), 'MMM d, yyyy HH:mm')}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {content}
            </Typography>
          </Box>
          {isAuthor && (
            <Box>
              <IconButton size="small" onClick={() => onEdit(id, content)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default Comment; 