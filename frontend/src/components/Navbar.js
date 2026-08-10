import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Event as EventIcon,
  PhotoLibrary as GalleryIcon,
  EmojiEvents as LeaderboardIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Events', icon: <EventIcon />, path: '/events' },
    { text: 'Contests', icon: <LeaderboardIcon />, path: '/contests' },
    { text: 'Gallery', icon: <GalleryIcon />, path: '/gallery' },
    { text: 'Team', icon: <InfoIcon />, path: '/team' },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" component="div">
          GDG Club
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={RouterLink}
            to={item.path}
            onClick={handleDrawerToggle}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      {isAuthenticated && (
        <>
          <Divider />
          <List>
            <ListItem
              button
              component={RouterLink}
              to="/admin"
              onClick={handleDrawerToggle}
            >
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Admin Dashboard" />
            </ListItem>
            <ListItem
              button
              component={RouterLink}
              to="/admin/profile"
              onClick={handleDrawerToggle}
            >
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Account" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Container maxWidth="xl" sx={{ px: '0 !important' }}>
          <Toolbar 
            disableGutters
            sx={{
              pl: { xs: 2, sm: 3, md: 4 },
              pr: { xs: 2, sm: 3, md: 4 },
              py: 1.5,
              minHeight: { xs: 64, md: 72 },
              justifyContent: 'space-between',
            }}
          >
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                flex: { md: 1 },
                justifyContent: 'flex-start',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Box
                component="img"
                src="/gdg-logo.png"
                alt="GDG Logo"
                sx={{
                  height: { xs: 36, md: 44 },
                  width: 'auto',
                  mr: 1.5,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  letterSpacing: '-0.5px',
                  m: 0,
                }}
              >
                SAHE
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    sx={{ 
                      mx: 0.75,
                      px: 2.5,
                      py: 1.25,
                      position: 'relative',
                      color: location.pathname === item.path ? '#4285F4' : 'rgba(39, 38, 38, 0.85)',
                      textTransform: 'none',
                      fontWeight: location.pathname === item.path ? 700 : 600,
                      fontSize: '0.975rem',
                      letterSpacing: '0.3px',
                      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: '10px',
                      overflow: 'visible',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '10px',
                        background: location.pathname === item.path 
                          ? 'linear-gradient(135deg, rgba(66, 133, 244, 0.08), rgba(52, 168, 83, 0.06))'
                          : 'transparent',
                        transition: 'all 0.3s ease',
                      },
                      '&:hover': {
                        color: '#4285F4',
                        backgroundColor: 'rgba(66, 133, 244, 0.06)',
                        transform: 'translateY(-1px)',
                        '&::before': {
                          background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(52, 168, 83, 0.08))',
                        },
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      {item.text}
                    </Box>
                  </Button>
                ))}
              </Box>
            )}

            {!isMobile && (
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                {isAuthenticated && (
                  <>
                    <IconButton
                      onClick={handleMenu}
                      size="large"
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      sx={{ 
                        ml: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(66, 133, 244, 0.08)',
                        },
                      }}
                    >
                      <Avatar
                        alt={user?.name}
                        src={user?.profilePhoto}
                        sx={{ 
                          width: 36, 
                          height: 36,
                          border: '2px solid rgba(66, 133, 244, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#4285F4',
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        {user?.name?.charAt(0)}
                      </Avatar>
                    </IconButton>
                    <Menu
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      PaperProps={{
                        sx: {
                          mt: 1.5,
                          minWidth: 200,
                          borderRadius: '12px',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                          overflow: 'hidden',
                        },
                      }}
                    >
                      <MenuItem
                        component={RouterLink}
                        to="/admin"
                        onClick={handleClose}
                        sx={{
                          py: 1.5,
                          px: 2,
                          fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(66, 133, 244, 0.08)',
                            color: '#4285F4',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <DashboardIcon fontSize="small" sx={{ color: 'inherit' }} />
                        </ListItemIcon>
                        Admin Dashboard
                      </MenuItem>
                      <MenuItem
                        component={RouterLink}
                        to="/admin/profile"
                        onClick={handleClose}
                        sx={{
                          py: 1.5,
                          px: 2,
                          fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(66, 133, 244, 0.08)',
                            color: '#4285F4',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <PersonIcon fontSize="small" sx={{ color: 'inherit' }} />
                        </ListItemIcon>
                        Account
                      </MenuItem>
                      <MenuItem 
                        onClick={handleLogout}
                        sx={{
                          py: 1.5,
                          px: 2,
                          fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.08)',
                            color: '#F44336',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <LogoutIcon fontSize="small" sx={{ color: 'inherit' }} />
                        </ListItemIcon>
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </Box>
            )}

            {isMobile && (
              <IconButton
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{
                  color: 'rgba(39, 38, 38, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(66, 133, 244, 0.08)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
