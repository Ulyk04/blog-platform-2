import { Pool, QueryResult, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';

export interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
  bio?: string | null;
  avatar?: string | null;
  created_at: Date;
  updated_at: Date;
}

export type CreateUserData = Omit<IUser, 'id' | 'created_at' | 'updated_at'>;

export class User {
  private static pool: Pool;

  static initialize(pool: Pool): void {
    User.pool = pool;
  }

  static async createTable(): Promise<void> {
    const client: PoolClient = await User.pool.connect();
    try {
      await client.query('BEGIN');

      // Drop existing table if it exists
      await client.query('DROP TABLE IF EXISTS users CASCADE;');
      console.log('Dropped existing users table if it existed');

      // Create users table
      const query = `
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          bio TEXT,
          avatar VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await client.query(query);
      await client.query('COMMIT');
      console.log('Users table created successfully');
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      console.error('Detailed error creating users table:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const client: PoolClient = await User.pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result: QueryResult<IUser> = await client.query(query, [email]);
      return result.rows[0] || null;
    } catch (error: unknown) {
      console.error('Error finding user by email:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id: number): Promise<IUser | null> {
    const client: PoolClient = await User.pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result: QueryResult<IUser> = await client.query(query, [id]);
      return result.rows[0] || null;
    } catch (error: unknown) {
      console.error('Error finding user by id:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async create(userData: CreateUserData): Promise<IUser> {
    const client: PoolClient = await User.pool.connect();
    try {
      await client.query('BEGIN');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const query = `
        INSERT INTO users (username, email, password, bio, avatar)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const values = [
        userData.username,
        userData.email,
        hashedPassword,
        userData.bio || null,
        userData.avatar || null
      ];
      const result: QueryResult<IUser> = await client.query(query, values);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      console.error('Error creating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async comparePassword(hashedPassword: string, candidatePassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error: unknown) {
      console.error('Error comparing passwords:', error);
      throw error;
    }
  }

  static async update(id: number, userData: Partial<CreateUserData>): Promise<IUser> {
    const client: PoolClient = await User.pool.connect();
    try {
      await client.query('BEGIN');
      const query = `
        UPDATE users 
        SET username = COALESCE($1, username),
            bio = COALESCE($2, bio),
            avatar = COALESCE($3, avatar),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *;
      `;
      const values = [userData.username, userData.bio, userData.avatar, id];
      const result: QueryResult<IUser> = await client.query(query, values);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      console.error('Error updating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }
} 