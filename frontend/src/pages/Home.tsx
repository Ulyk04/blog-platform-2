import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Post } from '../types';
import { posts } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await posts.getAll();
        setBlogPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId: number) => {
    try {
      const updatedPost = await posts.like(postId.toString());
      setBlogPosts(posts =>
        posts.map(post =>
          post.id === postId ? updatedPost : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
        {blogPosts.map((post) => (
          <Box key={post.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {post.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {post.content}
                </Typography>
                {post.tag && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label={post.tag} size="small" />
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  component={RouterLink}
                  to={`/posts/${post.id}`}
                >
                  Read More
                </Button>
                {user && (
                  <Button
                    size="small"
                    startIcon={
                      post.likes?.includes(Number(user.id)) ? (
                        <Favorite color="error" />
                      ) : (
                        <FavoriteBorder />
                      )
                    }
                    onClick={() => handleLike(post.id)}
                  >
                    {post.likes?.length || 0}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default Home; 