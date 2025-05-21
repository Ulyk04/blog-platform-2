import { Pool, QueryResult, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';

export interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
  bio?: string | null;
  avatar?: string | null;
  music?: {
    title: string;
    artist: string;
    url: string;
  };
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'banned' | 'inactive';
  last_login?: Date | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: Date;
  updated_at: Date;
}

export type CreateUserData = Omit<IUser, 'id' | 'created_at' | 'updated_at' | 'followers_count' | 'following_count' | 'posts_count'>;

export class User {
  private static pool: Pool;

  static initialize(pool: Pool): void {
    User.pool = pool;
  }

  static async createTable(): Promise<void> {
    const client: PoolClient = await User.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query('DROP TABLE IF EXISTS users CASCADE;');
      console.log('Dropped existing users table if it existed');

      const query = `
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          bio TEXT,
          avatar VARCHAR(255),
          music JSON,
          role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'banned', 'inactive')),
          last_login TIMESTAMP,
          followers_count INTEGER DEFAULT 0,
          following_count INTEGER DEFAULT 0,
          posts_count INTEGER DEFAULT 0,
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
        INSERT INTO users (username, email, password, bio, avatar, music)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const values = [
        userData.username,
        userData.email,
        hashedPassword,
        userData.bio || null,
        userData.avatar || null,
        userData.music ? JSON.stringify(userData.music) : null
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
            email = COALESCE($2, email),
            password = COALESCE($3, password),
            bio = COALESCE($4, bio),
            avatar = COALESCE($5, avatar),
            music = COALESCE($6, music),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *;
      `;
      const values = [
        userData.username,
        userData.email,
        userData.password ? await bcrypt.hash(userData.password, 10) : null,
        userData.bio,
        userData.avatar,
        userData.music ? JSON.stringify(userData.music) : null,
        id
      ];
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

  static async search(query: string): Promise<User[]> {
    const result = await this.pool.query(
      `SELECT * FROM users 
       WHERE (username ILIKE $1 
       OR email ILIKE $1 
       OR bio ILIKE $1)
       AND status = 'active'
       ORDER BY 
         CASE 
           WHEN username ILIKE $2 THEN 1
           WHEN email ILIKE $2 THEN 2
           ELSE 3
         END,
         username ASC
       LIMIT 20`,
      [`%${query}%`, `${query}%`]
    );
    return result.rows;
  }

  static async follow(followerId: number, followingId: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Проверяем, не подписан ли уже пользователь
      const existingFollow = await client.query(
        'SELECT * FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );

      if (existingFollow.rows.length > 0) {
        throw new Error('Already following this user');
      }

      // Добавляем подписку
      await client.query(
        'INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2)',
        [followerId, followingId]
      );

      // Обновляем счетчики
      await client.query(
        'UPDATE users SET followers_count = followers_count + 1 WHERE id = $1',
        [followingId]
      );
      await client.query(
        'UPDATE users SET following_count = following_count + 1 WHERE id = $1',
        [followerId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async unfollow(followerId: number, followingId: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Удаляем подписку
      await client.query(
        'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );

      // Обновляем счетчики
      await client.query(
        'UPDATE users SET followers_count = followers_count - 1 WHERE id = $1',
        [followingId]
      );
      await client.query(
        'UPDATE users SET following_count = following_count - 1 WHERE id = $1',
        [followerId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getFollowers(userId: number): Promise<User[]> {
    const result = await this.pool.query(
      `SELECT u.* FROM users u
       INNER JOIN user_follows f ON u.id = f.follower_id
       WHERE f.following_id = $1
       ORDER BY u.username ASC`,
      [userId]
    );
    return result.rows;
  }

  static async getFollowing(userId: number): Promise<User[]> {
    const result = await this.pool.query(
      `SELECT u.* FROM users u
       INNER JOIN user_follows f ON u.id = f.following_id
       WHERE f.follower_id = $1
       ORDER BY u.username ASC`,
      [userId]
    );
    return result.rows;
  }

  static async updateLastLogin(userId: number): Promise<void> {
    await this.pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  }

  static async updateStatus(userId: number, status: 'active' | 'banned' | 'inactive'): Promise<void> {
    await this.pool.query(
      'UPDATE users SET status = $1 WHERE id = $2',
      [status, userId]
    );
  }

  static async updateRole(userId: number, role: 'user' | 'admin' | 'moderator'): Promise<void> {
    await this.pool.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      [role, userId]
    );
  }
} 