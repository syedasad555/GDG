import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

const EventRegistrations = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchEventAndRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const eventResponse = await axios.get(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvent(eventResponse.data.event);

      const regResponse = await axios.get(`/api/events/${eventId}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegistrations(regResponse.data.registrations || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch event registrations');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventAndRegistrations();
  }, [fetchEventAndRegistrations]);

  const handleDeleteRegistration = async (registrationId) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `/api/events/${eventId}/registrations/${registrationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess('Registration deleted successfully!');
        fetchEventAndRegistrations();
      } catch (err) {
        setError('Failed to delete registration');
      }
    }
  };

  const isHackathon = event?.category === 'Hackathon';

  const handleDownloadCSV = () => {
    if (registrations.length === 0) {
      setError('No registrations to download');
      return;
    }

    const regDate = (reg) =>
      reg.registeredAt
        ? format(parseISO(reg.registeredAt), 'MMM dd, yyyy HH:mm')
        : reg.createdAt
        ? format(parseISO(reg.createdAt), 'MMM dd, yyyy HH:mm')
        : 'N/A';

    let csvContent;

    if (isHackathon) {
      const headers = [
        'Team Name',
        'Role',
        'Name',
        'Email',
        'Phone',
        'Roll Number',
        'Branch',
        'Year',
        'Registration Date',
      ];
      const rows = [];
      registrations.forEach((reg) => {
        rows.push([
          reg.teamName || 'N/A',
          'Team Lead',
          reg.name,
          reg.email,
          reg.phone || 'N/A',
          reg.rollNumber || 'N/A',
          reg.branch || 'N/A',
          reg.year || 'N/A',
          regDate(reg),
        ]);
        if (reg.members && reg.members.length > 0) {
          reg.members.forEach((m, i) => {
            rows.push([
              reg.teamName || 'N/A',
              `Member ${i + 1}`,
              m.name || 'N/A',
              m.email || 'N/A',
              m.phone || 'N/A',
              m.rollNumber || 'N/A',
              '',
              '',
              '',
            ]);
          });
        }
      });
      csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');
    } else {
      const headers = ['Name', 'Email', 'Phone', 'Roll Number', 'Branch', 'Year', 'Registration Date'];
      const rows = registrations.map((reg) => [
        reg.name,
        reg.email,
        reg.phone || 'N/A',
        reg.rollNumber || 'N/A',
        reg.branch || 'N/A',
        reg.year || 'N/A',
        regDate(reg),
      ]);
      csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');
    }

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', `${event?.title || 'event'}-registrations.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setSuccess('Registrations downloaded successfully!');
  };

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedRegistration(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/gdg-cms-9x4k/events')}
        sx={{ mb: 3 }}
      >
        Back to Events
      </Button>

      {/* Event Info */}
      {event && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {event.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {event.category && (
                    <Chip label={event.category} size="small" color="primary" />
                  )}
                  {event.date && (
                    <Chip
                      label={format(parseISO(event.date), 'MMM dd, yyyy')}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {registrations.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Registrations
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Download Button */}
      {registrations.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadCSV}
          >
            Download as CSV
          </Button>
        </Box>
      )}

      {/* Registrations Table */}
      {registrations.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="textSecondary">
            No registrations yet
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                {isHackathon && (
                  <TableCell sx={{ fontWeight: 700 }}>Team Name</TableCell>
                )}
                <TableCell sx={{ fontWeight: 700 }}>
                  {isHackathon ? 'Team Lead' : 'Name'}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Roll Number</TableCell>
                {!isHackathon && (
                  <>
                    <TableCell sx={{ fontWeight: 700 }}>Branch</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Year</TableCell>
                  </>
                )}
                {isHackathon && (
                  <TableCell sx={{ fontWeight: 700 }}>Members</TableCell>
                )}
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registrations.map((registration) => (
                <TableRow key={registration._id} hover>
                  {isHackathon && (
                    <TableCell sx={{ fontWeight: 600 }}>
                      {registration.teamName || 'N/A'}
                    </TableCell>
                  )}
                  <TableCell>{registration.name}</TableCell>
                  <TableCell>{registration.email}</TableCell>
                  <TableCell>{registration.rollNumber || 'N/A'}</TableCell>
                  {!isHackathon && (
                    <>
                      <TableCell>{registration.branch || 'N/A'}</TableCell>
                      <TableCell>{registration.year || 'N/A'}</TableCell>
                    </>
                  )}
                  {isHackathon && (
                    <TableCell>
                      {registration.members?.length || 0} member(s)
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(registration)}
                      title="View Details"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteRegistration(registration._id)}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Registration Details</DialogTitle>
        <DialogContent>
          {selectedRegistration && (
            <Box sx={{ pt: 2 }}>
              {/* Team Name (hackathon only) */}
              {isHackathon && selectedRegistration.teamName && (
                <Box sx={{ mb: 2, p: 2, backgroundColor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
                  <Typography variant="caption" color="textSecondary">
                    Team Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedRegistration.teamName}
                  </Typography>
                </Box>
              )}

              {isHackathon && (
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 1 }}>
                  Team Lead
                </Typography>
              )}

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedRegistration.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Email</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedRegistration.email}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Phone</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedRegistration.phone || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Roll Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedRegistration.rollNumber || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Branch</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedRegistration.branch || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Year</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedRegistration.year || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Registration Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedRegistration.registeredAt
                      ? format(parseISO(selectedRegistration.registeredAt), 'MMM dd, yyyy HH:mm')
                      : selectedRegistration.createdAt
                      ? format(parseISO(selectedRegistration.createdAt), 'MMM dd, yyyy HH:mm')
                      : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Team Members (hackathon only) */}
              {isHackathon && selectedRegistration.members && selectedRegistration.members.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                    Team Members ({selectedRegistration.members.length})
                  </Typography>
                  {selectedRegistration.members.map((member, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                        Member {idx + 1}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">Name</Typography>
                          <Typography variant="body2">{member.name || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">Roll Number</Typography>
                          <Typography variant="body2">{member.rollNumber || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">Email</Typography>
                          <Typography variant="body2">{member.email || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">Phone</Typography>
                          <Typography variant="body2">{member.phone || 'N/A'}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventRegistrations;
