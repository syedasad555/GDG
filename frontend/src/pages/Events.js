import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  TextField,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { parseISO, isFuture, isPast } from 'date-fns';
import * as eventApi from '../api/events';
import EventCard from '../components/EventCard';
import './Events.css';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `event-tab-${index}`,
    'aria-controls': `event-tabpanel-${index}`,
  };
}


const Events = () => {
  const [tabValue, setTabValue] = useState(0);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const eventsPerPage = 6;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventApi.getAllEvents();
        console.log('Events response:', response.data);
        const eventsList = response.data.events || response.data.data || [];
        setEvents(eventsList);
        setFilteredEvents(eventsList);
        console.log('Events loaded:', eventsList.length);
      } catch (err) {
        console.error('Error fetching events:', err);
        console.error('Error details:', err.response?.data);
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    
    // Set up polling to update events every 5 minutes
    const eventsInterval = setInterval(fetchEvents, 5 * 60 * 1000);

    return () => {
      clearInterval(eventsInterval);
    };
  }, []);

  useEffect(() => {
    let result = [...events];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        event =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(result);
    setUpcomingPage(1);
    setPastPage(1);
  }, [events, searchQuery]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setUpcomingPage(1);
    setPastPage(1);
  };

  // Pagination logic
  const upcomingEvents = filteredEvents.filter(event => tabValue === 0 && isFuture(parseISO(event.date)));
  const pastEvents = filteredEvents.filter(event => tabValue === 1 && isPast(parseISO(event.date)));
  
  const upcomingStartIndex = (upcomingPage - 1) * eventsPerPage;
  const upcomingEndIndex = upcomingStartIndex + eventsPerPage;
  const paginatedUpcomingEvents = upcomingEvents.slice(upcomingStartIndex, upcomingEndIndex);
  const upcomingTotalPages = Math.ceil(upcomingEvents.length / eventsPerPage);

  const pastStartIndex = (pastPage - 1) * eventsPerPage;
  const pastEndIndex = pastStartIndex + eventsPerPage;
  const paginatedPastEvents = pastEvents.slice(pastStartIndex, pastEndIndex);
  const pastTotalPages = Math.ceil(pastEvents.length / eventsPerPage);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#667eea',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ 
              color: '#fff',
              mb: 2,
            }} 
          />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
            Loading Events...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#667eea',
      py: 6,
      position: 'relative',
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              color: '#ffffff',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              animation: 'fadeInDown 0.8s ease',
              '@keyframes fadeInDown': {
                from: {
                  opacity: 0,
                  transform: 'translateY(-20px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            Discover Our Events
          </Typography>
          <Typography
            variant="h6"
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6,
              animation: 'fadeInUp 0.8s ease 0.2s both',
              '@keyframes fadeInUp': {
                from: {
                  opacity: 0,
                  transform: 'translateY(20px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            Join workshops, hackathons, and tech talks with industry experts
          </Typography>
        </Box>

        {/* Search and Tabs */}
        <Box sx={{ 
          mb: 4,
          animation: 'fadeIn 0.8s ease 0.4s both',
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <TextField
              placeholder="Search events..."
              variant="outlined"
              size="medium"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                width: { xs: '100%', sm: '500px' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '50px',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: '#fff',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.8)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                },
                '& input': {
                  fontSize: '1rem',
                  fontWeight: 500,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#667eea', fontSize: 24 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="event tabs"
                variant="fullWidth"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 4,
                    borderRadius: '4px 4px 0 0',
                    backgroundColor: '#fff',
                  },
                }}
              >
                <Tab
                  label="Upcoming Events"
                  {...a11yProps(0)}
                  sx={{
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-selected': {
                      color: '#fff',
                    },
                  }}
                />
                <Tab
                  label="Past Events"
                  {...a11yProps(1)}
                  sx={{
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-selected': {
                      color: '#fff',
                    },
                  }}
                />
              </Tabs>
            </Box>
          </Box>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {upcomingEvents.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {paginatedUpcomingEvents.map((event, index) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={6} 
                    md={4} 
                    key={event._id}
                    sx={{
                      animation: `slideUp 0.5s ease ${index * 0.1}s both`,
                      '@keyframes slideUp': {
                        from: {
                          opacity: 0,
                          transform: 'translateY(30px)',
                        },
                        to: {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                      },
                    }}
                  >
                    <EventCard event={event} />
                  </Grid>
                ))}
              </Grid>
              {upcomingTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                  <Pagination
                    count={upcomingTotalPages}
                    page={upcomingPage}
                    onChange={(e, value) => setUpcomingPage(value)}
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#fff',
                        fontWeight: 600,
                        border: '2px solid rgba(255,255,255,0.3)',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#fff',
                          color: '#667eea',
                          borderColor: '#fff',
                          '&:hover': {
                            backgroundColor: '#fff',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 10,
                textAlign: 'center',
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 4,
                backdropFilter: 'blur(10px)',
              }}
            >
              <EventIcon
                sx={{
                  fontSize: 64,
                  color: 'rgba(0,0,0,0.2)',
                  mb: 2,
                }}
              />
              <Typography
                variant="h6"
                sx={{ 
                  color: 'rgba(0,0,0,0.6)',
                  fontWeight: 500,
                }}
              >
                No upcoming events found
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {pastEvents.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {paginatedPastEvents.map((event, index) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={6} 
                    md={4} 
                    key={event._id}
                    sx={{
                      animation: `slideUp 0.5s ease ${index * 0.1}s both`,
                      '@keyframes slideUp': {
                        from: {
                          opacity: 0,
                          transform: 'translateY(30px)',
                        },
                        to: {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                      },
                    }}
                  >
                    <EventCard event={event} isPast={true} />
                  </Grid>
                ))}
              </Grid>
              {pastTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                  <Pagination
                    count={pastTotalPages}
                    page={pastPage}
                    onChange={(e, value) => setPastPage(value)}
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#fff',
                        fontWeight: 600,
                        border: '2px solid rgba(255,255,255,0.3)',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#fff',
                          color: '#667eea',
                          borderColor: '#fff',
                          '&:hover': {
                            backgroundColor: '#fff',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 10,
                textAlign: 'center',
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 4,
                backdropFilter: 'blur(10px)',
              }}
            >
              <EventIcon
                sx={{
                  fontSize: 64,
                  color: 'rgba(0,0,0,0.2)',
                  mb: 2,
                }}
              />
              <Typography
                variant="h6"
                sx={{ 
                  color: 'rgba(0,0,0,0.6)',
                  fontWeight: 500,
                }}
              >
                No past events found
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Events;
