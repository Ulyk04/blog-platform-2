import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { User } from './models/User';
import { Post } from './models/Post';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL connection
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'social_network',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Initialize models with pool
User.initialize(pool);
Post.initialize(pool);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Initialize database tables
async function initializeDatabase() {
  try {
    await User.createTable();
    await Post.createTable();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    process.exit(1);
  }
}

// Start server
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await initializeDatabase();
}); 