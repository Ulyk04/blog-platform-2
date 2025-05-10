import { Pool, QueryResult, PoolClient } from 'pg';

export interface IPost {
  id: number;
  title: string;
  content: string;
  tag: string;
  author_id: number;
  created_at: Date;
  updated_at: Date;
}

export type CreatePostData = Omit<IPost, 'id' | 'created_at' | 'updated_at'>;

export interface IComment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: Date;
}

export interface ILike {
  id: number;
  post_id: number;
  user_id: number;
  created_at: Date;
}

export class Post {
  private static pool: Pool;

  static initialize(pool: Pool): void {
    Post.pool = pool;
  }

  static async createTable(): Promise<void> {
    const client: PoolClient = await Post.pool.connect();
    try {
      await client.query('BEGIN');

      // Drop existing table if it exists
      await client.query('DROP TABLE IF EXISTS posts CASCADE;');
      console.log('Dropped existing posts table if it existed');

      // Create posts table
      const query = `
        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          tag VARCHAR(100),
          author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await client.query(query);
      await client.query('COMMIT');
      console.log('Posts table created successfully');
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      console.error('Detailed error creating posts table:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  static async create(postData: CreatePostData): Promise<IPost> {
    const client: PoolClient = await Post.pool.connect();
    try {
      await client.query('BEGIN');

      // Check if author exists
      const authorCheck = await client.query('SELECT id FROM users WHERE id = $1', [postData.author_id]);
      if (authorCheck.rows.length === 0) {
        throw new Error(`User with id ${postData.author_id} does not exist`);
      }

      const query = `
        INSERT INTO posts (title, content, tag, author_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const values = [
        postData.title,
        postData.content,
        postData.tag || null,
        postData.author_id
      ];
      const result: QueryResult<IPost> = await client.query(query, values);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      console.error('Error creating post:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id: number): Promise<IPost | null> {
    const client: PoolClient = await Post.pool.connect();
    try {
      const query = 'SELECT * FROM posts WHERE id = $1';
      const result: QueryResult<IPost> = await client.query(query, [id]);
      return result.rows[0] || null;
    } catch (error: unknown) {
      console.error('Error finding post by id:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByAuthorId(authorId: number): Promise<IPost[]> {
    const client: PoolClient = await Post.pool.connect();
    try {
      const query = 'SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC';
      const result: QueryResult<IPost> = await client.query(query, [authorId]);
      return result.rows;
    } catch (error: unknown) {
      console.error('Error finding posts by author:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findAll(): Promise<IPost[]> {
    const client: PoolClient = await Post.pool.connect();
    try {
      const query = 'SELECT * FROM posts ORDER BY created_at DESC';
      const result: QueryResult<IPost> = await client.query(query);
      return result.rows;
    } catch (error: unknown) {
      console.error('Error finding all posts:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(id: number, postData: Partial<CreatePostData>): Promise<IPost> {
    const client: PoolClient = await Post.pool.connect();
    try {
      await client.query('BEGIN');
      const query = `
        UPDATE posts 
        SET title = COALESCE($1, title),
            content = COALESCE($2, content),
            tag = COALESCE($3, tag),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *;
      `;
      const values = [
        postData.title,
        postData.content,
        postData.tag,
        id
      ];
      const result: QueryResult<IPost> = await client.query(query, values);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      console.error('Error updating post:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id: number): Promise<void> {
    const client: PoolClient = await Post.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM posts WHERE id = $1', [id]);
      await client.query('COMMIT');
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      console.error('Error deleting post:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async addComment(postId: number, userId: number, content: string): Promise<IComment> {
    try {
      const query = `
        INSERT INTO comments (post_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const values = [postId, userId, content];
      const result = await Post.pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  static async toggleLike(postId: number, userId: number): Promise<boolean> {
    try {
      const checkQuery = 'SELECT * FROM likes WHERE post_id = $1 AND user_id = $2';
      const checkResult = await Post.pool.query(checkQuery, [postId, userId]);

      if (checkResult.rows.length > 0) {
        // Unlike
        await Post.pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
        return false;
      } else {
        // Like
        await Post.pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
        return true;
      }
    } catch (error: unknown) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  static async getComments(postId: number): Promise<IComment[]> {
    try {
      const query = 'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC';
      const result = await Post.pool.query(query, [postId]);
      return result.rows;
    } catch (error: unknown) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  static async getLikes(postId: number): Promise<ILike[]> {
    try {
      const query = 'SELECT * FROM likes WHERE post_id = $1';
      const result = await Post.pool.query(query, [postId]);
      return result.rows;
    } catch (error: unknown) {
      console.error('Error getting likes:', error);
      throw error;
    }
  }
} 