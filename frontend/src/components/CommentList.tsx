import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';
import Comment from './Comment';

interface CommentListProps {
  postId: string;
  currentUserId: string;
}

interface CommentData {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

const CommentList: React.FC<CommentListProps> = ({ postId, currentUserId }) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/post/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axios.post('/api/comments', {
        content: newComment,
        postId
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/comments/${id}`);
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEdit = (id: string, content: string) => {
    setEditingComment({ id, content });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingComment) return;

    try {
      await axios.put(`/api/comments/${editingComment.id}`, {
        content: editingComment.content
      });
      setEditDialogOpen(false);
      setEditingComment(null);
      fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={2}
          variant="outlined"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!newComment.trim()}
        >
          Post Comment
        </Button>
      </form>

      <Box sx={{ mt: 4 }}>
        {comments.map((comment) => (
          <Comment
            key={comment._id}
            id={comment._id}
            content={comment.content}
            author={comment.author}
            createdAt={comment.createdAt}
            isAuthor={comment.author._id === currentUserId}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editingComment?.content || ''}
            onChange={(e) => setEditingComment(prev => prev ? { ...prev, content: e.target.value } : null)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentList; 