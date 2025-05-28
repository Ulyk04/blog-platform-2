import express from 'express';
import { createComment, getCommentsByPost, updateComment, deleteComment } from '../controllers/commentController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Create a new comment
router.post('/', auth, createComment);

// Get all comments for a post
router.get('/post/:postId', getCommentsByPost);

// Update a comment
router.put('/:id', auth, updateComment);

// Delete a comment
router.delete('/:id', auth, deleteComment);

export default router; 