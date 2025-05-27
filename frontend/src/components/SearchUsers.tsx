import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  TextField,
  CircularProgress,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Pagination,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as FollowIcon,
  PersonRemove as UnfollowIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  Block as BlockIcon,
  Report as ReportIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

const STORAGE_KEY = 'searchUsersState';
const ITEMS_PER_PAGE = 10;

interface SearchState {
  query: string;
  sortBy: 'relevance' | 'followers' | 'posts' | 'recent';
  showFilters: boolean;
  page: number;
}

interface UserWithActions extends User {
  isFollowing?: boolean;
  isBlocked?: boolean;
}

const SearchUsers: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserWithActions[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SearchState['sortBy']>('relevance');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithActions | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Загрузка сохраненного состояния
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state: SearchState = JSON.parse(savedState);
        setSearchQuery(state.query);
        setSortBy(state.sortBy);
        setShowFilters(state.showFilters);
        setPage(state.page);
      } catch (e) {
        console.error('Error loading saved state:', e);
      }
    }
  }, []);

  // Сохранение состояния
  useEffect(() => {
    const state: SearchState = {
      query: searchQuery,
      sortBy,
      showFilters,
      page,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [searchQuery, sortBy, showFilters, page]);

  // Поиск пользователей с пагинацией
  const searchUsers = useCallback(async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/search?query=${encodeURIComponent(searchQuery)}&sort=${sortBy}&page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
    } catch (err) {
      setError('Error searching users');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, page]);

  useEffect(() => {
    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchUsers]);

  const handleFollow = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to follow user');
      }

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, followers_count: u.followers_count + 1, isFollowing: true }
          : u
      ));
      showSnackbar('Successfully followed user', 'success');
    } catch (err) {
      console.error('Follow error:', err);
      showSnackbar('Failed to follow user', 'error');
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/unfollow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unfollow user');
      }

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, followers_count: u.followers_count - 1, isFollowing: false }
          : u
      ));
      showSnackbar('Successfully unfollowed user', 'success');
    } catch (err) {
      console.error('Unfollow error:', err);
      showSnackbar('Failed to unfollow user', 'error');
    }
  };

  const handleBlock = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to block user');
      }

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, isBlocked: true }
          : u
      ));
      showSnackbar('User has been blocked', 'success');
      setShowBlockDialog(false);
    } catch (err) {
      console.error('Block error:', err);
      showSnackbar('Failed to block user', 'error');
    }
  };

  const handleReport = async (userId: number, reason: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to report user');
      }

      showSnackbar('User has been reported', 'success');
      setShowReportDialog(false);
    } catch (err) {
      console.error('Report error:', err);
      showSnackbar('Failed to report user', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: UserWithActions) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setUsers([]);
    setPage(1);
  };

  return (
    <Box className="max-w-4xl mx-auto p-4">
      <Box className="mb-6">
        <Typography variant="h4" className="mb-4">
          Search Users
        </Typography>
        <Box className="flex items-center gap-2">
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username, email, or bio..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={clearSearch} size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Filter results">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {showFilters && (
          <Box className="mt-4 flex gap-2 flex-wrap">
            <Chip
              label="Relevance"
              onClick={() => setSortBy('relevance')}
              color={sortBy === 'relevance' ? 'primary' : 'default'}
            />
            <Chip
              label="Most Followers"
              onClick={() => setSortBy('followers')}
              color={sortBy === 'followers' ? 'primary' : 'default'}
            />
            <Chip
              label="Most Posts"
              onClick={() => setSortBy('posts')}
              color={sortBy === 'posts' ? 'primary' : 'default'}
            />
            <Chip
              label="Recently Active"
              onClick={() => setSortBy('recent')}
              color={sortBy === 'recent' ? 'primary' : 'default'}
            />
          </Box>
        )}
      </Box>

      {loading && (
        <Box className="flex justify-center my-8">
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" className="text-center my-4">
          {error}
        </Typography>
      )}

      <Box className="space-y-4">
        {users.map((user) => (
          <Box
            key={user.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
          >
            <Box className="flex items-center justify-between">
              <Box className="flex items-center space-x-4">
                <Avatar
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.username}
                  className="w-16 h-16 cursor-pointer"
                  onClick={() => navigate(`/profile/${user.id}`)}
                />
                <Box>
                  <Link
                    to={`/profile/${user.id}`}
                    className="text-xl font-semibold hover:text-blue-600"
                  >
                    {user.username}
                  </Link>
                  {user.bio && (
                    <Typography className="text-gray-600 mt-1">
                      {user.bio}
                    </Typography>
                  )}
                  <Box className="flex gap-4 mt-2">
                    <Typography variant="body2" color="textSecondary">
                      {user.followers_count} followers
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.following_count} following
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.posts_count} posts
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box className="flex items-center gap-2">
                {currentUser && currentUser.id !== user.id && (
                  <>
                    <Button
                      variant={user.isFollowing ? 'outlined' : 'contained'}
                      color={user.isFollowing ? 'secondary' : 'primary'}
                      startIcon={user.isFollowing ? <UnfollowIcon /> : <FollowIcon />}
                      onClick={() => user.isFollowing ? handleUnfollow(user.id) : handleFollow(user.id)}
                      disabled={user.isBlocked}
                    >
                      {user.isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                    <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                      <MoreVertIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {totalPages > 1 && (
        <Box className="flex justify-center mt-6">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {searchQuery && !loading && users.length === 0 && (
        <Typography className="text-center text-gray-500 my-8">
          No users found matching your search
        </Typography>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          setShowBlockDialog(true);
        }}>
          <BlockIcon className="mr-2" /> Block User
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          setShowReportDialog(true);
        }}>
          <ReportIcon className="mr-2" /> Report User
        </MenuItem>
      </Menu>

      <Dialog open={showBlockDialog} onClose={() => setShowBlockDialog(false)}>
        <DialogTitle>Block User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to block {selectedUser?.username}? You won't see their content anymore.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBlockDialog(false)}>Cancel</Button>
          <Button
            onClick={() => selectedUser && handleBlock(selectedUser.id)}
            color="error"
          >
            Block
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showReportDialog} onClose={() => setShowReportDialog(false)}>
        <DialogTitle>Report User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Please describe the reason for reporting this user..."
            variant="outlined"
            className="mt-2"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportDialog(false)}>Cancel</Button>
          <Button
            onClick={() => selectedUser && handleReport(selectedUser.id, 'Report reason')}
            color="error"
          >
            Report
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SearchUsers;