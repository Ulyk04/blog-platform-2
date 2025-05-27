import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { AccountCircle, Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          Blog Platform
        </Typography>

        <div className="flex items-center space-x-4">
          <Link
            to="/search"
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Search Users
          </Link>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                component={RouterLink}
                to="/create-post"
                color="inherit"
                sx={{ mr: 2 }}
              >
                <AddIcon />
              </IconButton>
              <IconButton
                onClick={handleMenu}
                color="inherit"
              >
                {user.avatar ? (
                  <Avatar src={user.avatar} alt={user.username} />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  component={RouterLink}
                  to="/profile"
                  onClick={handleClose}
                >
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/register"
              >
                Register
              </Button>
            </Box>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 