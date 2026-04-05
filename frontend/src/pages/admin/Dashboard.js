import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Avatar,
  Fade,
  Grow,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  Book as BookIcon,
  EmojiEvents as EmojiEventsIcon,
  Leaderboard as LeaderboardIcon,
  Image as ImageIcon,
  ArrowForward,
} from '@mui/icons-material';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setStats(response.data.stats);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#fff' }} />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Gallery pictures',
      value: stats?.totalGalleryPictures ?? 0,
      icon: <ImageIcon />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      lightColor: '#667eea20',
    },
    {
      title: 'Total Events',
      value: stats?.totalEvents || 0,
      icon: <EventIcon />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      lightColor: '#f093fb20',
    },
    {
      title: 'Total Blogs',
      value: stats?.totalBlogs || 0,
      icon: <BookIcon />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      lightColor: '#4facfe20',
    },
    {
      title: 'Total Contests',
      value: stats?.totalContests || 0,
      icon: <EmojiEventsIcon />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      lightColor: '#43e97b20',
    },
  ];

  const managementCards = [
    {
      title: 'Event Management',
      description: 'Create, update, and manage all events for the GDG College Club.',
      icon: <EventIcon />,
      link: '/admin/events',
      gradient: 'linear-gradient(135deg, #4A8BC2 0%, #2E75B0 100%)',
      color: '#4A8BC2',
      buttonColor: '#2563A8',
    },
    {
      title: 'Blog Management',
      description: 'Create, edit, and publish blog posts for the community.',
      icon: <BookIcon />,
      link: '/admin/blogs',
      gradient: 'linear-gradient(135deg, #D85F5F 0%, #C54545 100%)',
      color: '#D85F5F',
      buttonColor: '#B83C3C',
    },
    {
      title: 'Contest Management',
      description: 'Create contests and upload HackerRank scores.',
      icon: <EmojiEventsIcon />,
      link: '/admin/contests',
      gradient: 'linear-gradient(135deg, #8461BD 0%, #6E48AD 100%)',
      color: '#8461BD',
      buttonColor: '#5D3A9A',
    },
    {
      title: 'Team management',
      description: 'Add photos, names, and LinkedIn links for the public Team page.',
      icon: <PeopleIcon />,
      link: '/admin/team',
      gradient: 'linear-gradient(135deg, #54AC58 0%, #3E9642 100%)',
      color: '#54AC58',
      buttonColor: '#348239',
    },
    {
      title: 'Leaderboard Management',
      description: 'Upload contest scores and manage leaderboards.',
      icon: <LeaderboardIcon />,
      link: '/admin/leaderboard',
      gradient: 'linear-gradient(135deg, #4A8BC2 0%, #2E75B0 100%)',
      color: '#4A8BC2',
      buttonColor: '#2563A8',
    },
    {
      title: 'Gallery Management',
      description: 'Upload and manage gallery images with titles and descriptions.',
      icon: <ImageIcon />,
      link: '/admin/gallery',
      gradient: 'linear-gradient(135deg, #D85F5F 0%, #C54545 100%)',
      color: '#D85F5F',
      buttonColor: '#B83C3C',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 6, mt: 2 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                color: '#2d3436',
                mb: 1,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(0,0,0,0.6)',
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Manage your GDG platform with ease
            </Typography>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Grow in timeout={600 + index * 100}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    background: '#fff',
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '0.5px solid rgba(0,0,0,0.08)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      borderColor: 'rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(0,0,0,0.5)',
                          fontWeight: 500,
                          fontSize: '0.813rem',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          background: `${card.lightColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {React.cloneElement(card.icon, { 
                          sx: { fontSize: 22, color: card.gradient.match(/#[0-9a-f]{6}/i)?.[0] } 
                        })}
                      </Box>
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: '#1a1a1a',
                        fontSize: { xs: '2rem', md: '2.25rem' },
                        lineHeight: 1,
                      }}
                    >
                      {card.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Management Sections */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              mb: 3,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Quick Actions
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {managementCards.map((card, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Grow in timeout={800 + index * 100}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    background: card.gradient,
                    borderRadius: 4,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: 'none',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${card.color}60`,
                      '& .action-button': {
                        background: 'rgba(255,255,255,0.3)',
                        color: '#fff',
                        backdropFilter: 'blur(10px)',
                        '& .arrow-icon': {
                          transform: 'translateX(4px)',
                        },
                      },
                      '& .card-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                      },
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Avatar
                      className="card-icon"
                      sx={{
                        width: 64,
                        height: 64,
                        background: 'rgba(255,255,255,0.6)',
                        backdropFilter: 'blur(10px)',
                        mb: 3,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {React.cloneElement(card.icon, { sx: { fontSize: 32, color: '#2d3436' } })}
                    </Avatar>

                    <Typography
                      variant="h6"
                      className="card-title"
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        color: '#1a1a1a',
                        fontSize: '1.25rem',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {card.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      className="card-description"
                      sx={{
                        color: 'rgba(0,0,0,0.7)',
                        mb: 3,
                        lineHeight: 1.6,
                        minHeight: '48px',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {card.description}
                    </Typography>

                    <Button
                      component={Link}
                      to={card.link}
                      className="action-button"
                      fullWidth
                      endIcon={
                        <ArrowForward
                          className="arrow-icon"
                          sx={{
                            transition: 'transform 0.3s ease',
                          }}
                        />
                      }
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        background: 'rgba(255, 255, 255, 0.25)',
                        color: '#1a1a1a',
                        transition: 'all 0.3s ease',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.35)',
                          transform: 'scale(1.02)',
                          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                        },
                      }}
                    >
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
