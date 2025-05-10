import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import { User } from './models/User';
import { Post } from './models/Post';
// Remove userRoutes import since the file doesn't exist yet

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'projects',
  password: process.env.POSTGRES_PASSWORD || '2020lmn',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Initialize models with pool
User.initialize(pool);
Post.initialize(pool);

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    await User.createTable();
    console.log('Users table created');
    await Post.createTable();
    console.log('Posts table created');
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
// Temporarily comment out userRoutes until implemented
// app.use('/api/users', userRoutes);

// Start server
const PORT = process.env.PORT || 5000;

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    client.release();

    // Initialize database tables
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 