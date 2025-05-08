import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Post } from '../models/Post';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

const router = express.Router();

// Get all posts
router.get('/', async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('comments.user', 'username avatar');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/',
  auth,
  [
    body('title').trim().isLength({ min: 1 }).escape(),
    body('content').trim().isLength({ min: 1 }).escape()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content } = req.body;
      const post = new Post({
        title,
        content,
        author: req.user?.id
      });

      await post.save();
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update post
router.put('/:id',
  auth,
  [
    body('title').trim().isLength({ min: 1 }).escape(),
    body('content').trim().isLength({ min: 1 }).escape()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.author.toString() !== req.user?.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { title, content } = req.body;
      post.title = title;
      post.content = content;

      await post.save();
      res.json(post);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete post
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.put('/:id/like', auth, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user?.id as any);
    if (likeIndex === -1) {
      post.likes.push(req.user?.id as any);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post);
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

      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      post.comments.push({
        user: req.user?.id as any,
        content: req.body.content,
        createdAt: new Date()
      });

      await post.save();
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router; 