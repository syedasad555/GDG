import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Paper,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { format, parseISO, isFuture } from 'date-fns';
import * as eventApi from '../api/events';

const getDefaultEventImage = (category) => {
  switch(category) {
    case 'Workshop':
      return '/assets/workshop_default.jpeg';
    case 'Hackathon':
      return '/assets/hackathon_default.jpeg';
    case 'Talk':
      return '/assets/talk_default.jpeg';
    case 'Meetup':
      return '/assets/meetup_default.jpeg';
    default:
      return null;
  }
};

const EventDetail = () => {
  const { id } = useParams();
  const theme = useTheme();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    phone: '',
    rollNumber: '',
    branch: '',
    year: '',
    teamName: '',
    members: [],
  });

  useEffect(() => {
    const key = `gdg_event_reg_${id}`;
    setIsRegistered(sessionStorage.getItem(key) === '1');
  }, [id]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventApi.getEventById(id);
        setEvent(response.data.event);
      } catch (err) {
        setError('Failed to fetch event details');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const isHackathon = event?.category === 'Hackathon';
  const maxTeamSize = event?.teamSize || 4;

  const handleRegistrationOpen = () => {
    const emptyMembers = isHackathon
      ? Array.from({ length: maxTeamSize - 1 }, () => ({ name: '', rollNumber: '', phone: '', email: '' }))
      : [];
    setRegistrationData({
      name: '',
      email: '',
      phone: '',
      rollNumber: '',
      branch: '',
      year: '',
      teamName: '',
      members: emptyMembers,
    });
    setRegistrationOpen(true);
  };

  const handleRegistrationClose = () => {
    setRegistrationOpen(false);
  };

  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberChange = (index, field, value) => {
    setRegistrationData((prev) => {
      const updated = [...prev.members];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, members: updated };
    });
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...registrationData };
      if (isHackathon) {
        // Filter out empty member rows (where name is blank)
        payload.members = registrationData.members.filter((m) => m.name.trim() !== '');
      } else {
        delete payload.teamName;
        delete payload.members;
      }
      await eventApi.registerEvent(id, payload);
      setIsRegistered(true);
      sessionStorage.setItem(`gdg_event_reg_${id}`, '1');
      setRegistrationOpen(false);
      setSnackbar({
        open: true,
        message: 'Successfully registered for the event!',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Registration failed. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
        <Box textAlign="center" mt={2}>
          <Button
            component={Link}
            to="/events"
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
          >
            Back to Events
          </Button>
        </Box>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Event not found
        </Typography>
        <Button
          component={Link}
          to="/events"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Browse Events
        </Button>
      </Container>
    );
  }

  const isEventUpcoming = isFuture(parseISO(event.date));
  
  // Check if registration is closed
  const isRegistrationClosed = event?.registrationEndTime 
    ? new Date() > new Date(event.registrationEndTime)
    : false;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button
        component={Link}
        to="/events"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, textTransform: 'none' }}
      >
        Back to Events
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              mb: 4,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardMedia
              component="img"
              height="400"
              image={event.coverImage || getDefaultEventImage(event.category)}
              alt={event.title}
              sx={{
                objectFit: 'cover',
                objectPosition: 'top center',
                backgroundColor: event.coverImage ? 'transparent' : 'grey.200'
              }}
            />

            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 2,
                }}
              >
                <Chip
                  label={event.category || 'Event'}
                  color="primary"
                  size="small"
                  sx={{
                    borderRadius: '4px',
                    fontWeight: 600,
                    backgroundColor: `${theme.palette.primary.main}15`,
                    color: theme.palette.primary.main,
                  }}
                />
              </Box>

              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                {event.title}
              </Typography>

              <Box
                dangerouslySetInnerHTML={{ __html: event.description }}
                sx={{
                  '& h2, & h3, & h4': {
                    mt: 3,
                    mb: 2,
                    color: 'text.primary',
                    fontWeight: 600,
                  },
                  '& p': {
                    mb: 2,
                    lineHeight: 1.7,
                  },
                  '& ul, & ol': {
                    pl: 3,
                    mb: 2,
                    '& li': {
                      mb: 1,
                    },
                  },
                  '& a': {
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box
            sx={{
              position: 'sticky',
              top: 20,
            }}
          >
            {isEventUpcoming && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ mb: 2, fontWeight: 700 }}
                >
                  Register for this event
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 3 }}
                >
                  {isRegistered
                    ? 'You are registered for this event!'
                    : isRegistrationClosed
                    ? 'Registration for this event has closed.'
                    : 'Secure your spot by registering. No account required — just your details below.'}
                </Typography>

                {isRegistered ? (
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    disabled
                    sx={{ mb: 2 }}
                  >
                    Registered
                  </Button>
                ) : isRegistrationClosed ? (
                  <Button
                    fullWidth
                    variant="contained"
                    color="inherit"
                    size="large"
                    disabled
                    sx={{ mb: 2 }}
                  >
                    Registrations Closed
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleRegistrationOpen}
                    sx={{ mb: 2 }}
                  >
                    Register Now
                  </Button>
                )}
              </Paper>
            )}

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Typography
                variant="h6"
                component="h3"
                sx={{ mb: 2, fontWeight: 700 }}
              >
                Event Details
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    mb: 2,
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <CalendarIcon
                    sx={{ mr: 2, color: 'primary.main', mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Date & Time
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}
                      {event.time && ` • ${event.time}`}
                    </Typography>
                  </Box>
                </Box>

                {event.registrationEndTime && (
                  <Box
                    sx={{
                      display: 'flex',
                      mb: 2,
                      pb: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <CalendarIcon
                      sx={{ mr: 2, color: 'primary.main', mt: 0.5 }}
                    />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Registration Ends
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(parseISO(event.registrationEndTime), 'EEEE, MMMM d, yyyy, hh:mm a')}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {event.venue && (
                  <Box
                    sx={{
                      display: 'flex',
                      mb: 2,
                      pb: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <LocationIcon
                      sx={{ mr: 2, color: 'primary.main', mt: 0.5 }}
                    />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Location
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.venue}
                      </Typography>
                      {event.address && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {event.address}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

                {event.category === 'Hackathon' && event.teamSize && (
                  <Box
                    sx={{
                      display: 'flex',
                      mb: 2,
                      pb: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <GroupsIcon
                      sx={{ mr: 2, color: 'primary.main', mt: 0.5 }}
                    />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Team Info
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Max {event.teamSize} members per team
                      </Typography>
                      {event.teamMembers && (
                        <Typography variant="body2" color="text.secondary">
                          {event.teamMembers} total participants allowed
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

                {event.speaker && (
                  <Box
                    sx={{
                      display: 'flex',
                    }}
                  >
                    <PersonIcon
                      sx={{ mr: 2, color: 'primary.main', mt: 0.5 }}
                    />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Speaker
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.speaker.name}
                      </Typography>
                      {event.speaker.role && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: 'italic' }}
                        >
                          {event.speaker.role}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={registrationOpen}
        onClose={handleRegistrationClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {isHackathon ? 'Team Registration' : 'Register'} for {event.title}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleRegistrationClose}
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}
            {event.time && ` • ${event.time}`}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleRegistrationSubmit}>
          <DialogContent dividers>
            {isHackathon && (
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Team Lead Details
              </Typography>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  name="name"
                  label={isHackathon ? 'Team Lead Name' : 'Full Name'}
                  value={registrationData.name}
                  onChange={handleRegistrationChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={registrationData.email}
                  onChange={handleRegistrationChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  value={registrationData.phone}
                  onChange={handleRegistrationChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="rollNumber"
                  name="rollNumber"
                  label="Roll Number"
                  value={registrationData.rollNumber}
                  onChange={handleRegistrationChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="branch"
                  name="branch"
                  label="Branch"
                  value={registrationData.branch}
                  onChange={handleRegistrationChange}
                  margin="normal"
                  select
                  SelectProps={{ native: true }}
                >
                  <option value=""></option>
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="IT">Information Technology</option>
                  <option value="ECE">Electronics & Communication</option>
                  <option value="EEE">Electrical & Electronics</option>
                  <option value="MECH">Mechanical Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="year"
                  name="year"
                  label="Year of Study"
                  value={registrationData.year}
                  onChange={handleRegistrationChange}
                  margin="normal"
                  select
                  SelectProps={{ native: true }}
                >
                  <option value=""></option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </TextField>
              </Grid>

              {/* Hackathon Team Fields */}
              {isHackathon && (
                <>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2, mb: 1, borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Team Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Max team size: {maxTeamSize} (including you as team lead)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="teamName"
                      name="teamName"
                      label="Team Name"
                      value={registrationData.teamName}
                      onChange={handleRegistrationChange}
                      margin="normal"
                    />
                  </Grid>

                  {registrationData.members.map((member, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Team Member {idx + 1}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Name"
                              value={member.name}
                              onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Roll Number"
                              value={member.rollNumber}
                              onChange={(e) => handleMemberChange(idx, 'rollNumber', e.target.value)}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Email"
                              type="email"
                              value={member.email}
                              onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Phone Number"
                              value={member.phone}
                              onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={handleRegistrationClose} color="inherit" sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Register
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventDetail;
