import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

const router = express.Router();

// Get current user profile
router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/me',
  auth,
  [
    body('username').optional().trim().isLength({ min: 3 }).escape(),
    body('bio').optional().trim().escape(),
    body('avatar').optional().trim().isURL()
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

      const { username, bio, avatar } = req.body;
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = await User.update(req.user.id, {
        username: username || user.username,
        bio: bio || user.bio,
        avatar: avatar || user.avatar
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 