import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Grid, Box, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import * as eventApi from '../api/events';
import Hero from '../components/Hero';
import WhyJoinGDG from '../components/WhyJoinGDG';
import TeamScroll from '../components/TeamScroll';
import HomeBlogCarousel from '../components/HomeBlogCarousel';
import EventCard from '../components/EventCard';
import axios from 'axios';
import { parseISO, isFuture, isPast } from 'date-fns';
const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch all events
        const allEventsResponse = await eventApi.getAllEvents();
        const allEvents = allEventsResponse.data.events || [];
        
        // Separate upcoming and past events
        const upcoming = allEvents
          .filter(event => isFuture(parseISO(event.date)))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const past = allEvents
          .filter(event => isPast(parseISO(event.date)))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Get top 3 nearest upcoming events
        const topUpcoming = upcoming.slice(0, 3);
        
        // If only 1 upcoming event, fill remaining slots with recently completed events
        let displayEvents = [];
        if (topUpcoming.length === 1) {
          displayEvents = [...topUpcoming, ...past.slice(0, 2)];
        } else if (topUpcoming.length === 2) {
          displayEvents = [...topUpcoming, ...past.slice(0, 1)];
        } else if (topUpcoming.length >= 3) {
          displayEvents = topUpcoming.slice(0, 3);
        } else {
          // No upcoming events, show past events
          displayEvents = past.slice(0, 3);
        }
        
        setEvents(displayEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSnapshots = async () => {
      try {
        const response = await axios.get('/api/admin/leaderboard/snapshots');
        setSnapshots(response.data.snapshots || []);
      } catch (err) {
        console.error('Error fetching snapshots:', err);
      }
    };

    fetchEvents();
    fetchSnapshots();

    // Set up polling to update events every 5 minutes
    const eventsInterval = setInterval(fetchEvents, 5 * 60 * 1000);
    const snapshotsInterval = setInterval(fetchSnapshots, 5 * 60 * 1000);

    return () => {
      clearInterval(eventsInterval);
      clearInterval(snapshotsInterval);
    };
  }, []);

  return (
    <>
      {/* CSS Animation for continuous scrolling */}
      <Box
        component="style"
        sx={{
          '@keyframes scrollVertical': {
            '0%': {
              transform: 'translateY(0)',
            },
            '100%': {
              transform: 'translateY(-240px)', // 3 performers × 80px each
            },
          },
          '@keyframes scrollHorizontal': {
            '0%': {
              transform: 'translateX(0)',
            },
            '100%': {
              transform: `translateX(-${(snapshots?.length || 1) * 340}px)`, // Each box is 320px + 20px gap
            },
          },
        }}
      />

      <Box sx={{ flexGrow: 1 }}>
        {/* Hero Section */}
        <Hero />

        {/* Why Join GDG Section */}
        <Box sx={{ backgroundColor: '#6FA8FF' }}>
          <WhyJoinGDG />
        </Box>

      {/* Upcoming Events Section */}
      <Box
        sx={{
          background: '#FCD34D',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            component="h2"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 800,
              mb: 6,
              color: '#1a1a1a',
              fontSize: isMobile ? '42px' : '64px',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
              textShadow: '2px 4px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            {events.length > 0 && events.every(event => isPast(parseISO(event.date)))
              ? 'Recent Events' 
              : 'Upcoming Events'}
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress sx={{ color: '#ffffff' }} />
            </Box>
          ) : events.length > 0 ? (
            <Grid container spacing={4}>
              {events.map((event) => (
                <Grid item xs={12} md={4} key={event._id}>
                  <EventCard event={event} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography align="center" sx={{ color: '#ffffff' }}>
              No events scheduled. Check back later!
            </Typography>
          )}
          
          {events.length > 0 && (
            <Box mt={4} textAlign="center">
              <Button
                component={Link}
                to="/events"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  backgroundColor: '#ffffff',
                  color: '#E87070',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                View All Events
              </Button>
            </Box>
          )}
        </Container>
      </Box>
      </Box>
      {/* Team Section */}
      <Box sx={{ backgroundColor: '#4CAF7A' }}>
        <TeamScroll />
      </Box>

      {/* Blog Carousel Section */}
      <HomeBlogCarousel />
    </>
  );
};

export default Home;
