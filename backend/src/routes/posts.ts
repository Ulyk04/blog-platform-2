import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Post } from '../models/Post';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

const router = express.Router();


router.get('/', async (_req: Request, res: Response) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:id', async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('tag').optional().trim()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      console.log('Received post creation request:', req.body); // Debug log

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user?.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { title, content, tag } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      console.log('Creating post with data:', { title, content, tag, author_id: req.user.id }); // Debug log

      try {
        const post = await Post.create({
          title,
          content,
          tag,
          author_id: req.user.id
        });

        console.log('Post created successfully:', post); // Debug log
        res.status(201).json(post);
      } catch (error) {
        console.error('Error in Post.create:', error);
        if (error instanceof Error && error.message.includes('does not exist')) {
          return res.status(400).json({ message: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error('Detailed error creating post:', error); // Detailed error log
      res.status(500).json({ 
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  }
);

// Update post
router.put('/:id',
  auth,
  [
    body('title').optional().trim(),
    body('content').optional().trim(),
    body('tag').optional().trim()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user?.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.author_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this post' });
      }

      const { title, content, tag } = req.body;
      const updatedPost = await Post.update(postId, { title, content, tag });
      res.json(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete post
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.delete(postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.put('/:id/like', auth, async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = await Post.toggleLike(postId, req.user?.id as number);
    const likes = await Post.getLikes(postId);

    res.json({
      ...post,
      likes,
      isLiked
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comments',
  auth,
  [
    body('content').trim().isLength({ min: 1 }).escape()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const postId = parseInt(req.params.id);
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const comment = await Post.addComment(postId, req.user?.id as number, req.body.content);
      const comments = await Post.getComments(postId);

      res.json({
        ...post,
        comments
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router; 