import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Grid,
  IconButton,
  Alert,
  Menu,
  MenuItem,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { Checkbox } from '@mui/material';
import * as eventApi from '../../api/events';
import EventCard from '../../components/EventCard';

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [page, setPage] = useState(1);
  const eventsPerPage = 6;
  const [selectedIds, setSelectedIds] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    context: '',
    date: '',
    time: '',
    venue: '',
    category: '',
    registrationEndTime: '',
  });

  useEffect(() => {
    fetchEvents();
    
    // Set up polling to update events every 5 minutes
    const eventsInterval = setInterval(fetchEvents, 5 * 60 * 1000);

    return () => {
      clearInterval(eventsInterval);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getAllEvents();
      setEvents(response.data.events || []);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      setEditingId(event._id);
      setFormData({
        title: event.title,
        description: event.description,
        context: event.context || '',
        date: event.date?.split('T')[0] || '',
        time: event.time || '',
        venue: event.venue || '',
        category: event.category || '',
        registrationEndTime: event.registrationEndTime ? new Date(event.registrationEndTime).toISOString().slice(0, 16) : '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        context: '',
        date: '',
        time: '',
        venue: '',
        category: '',
        registrationEndTime: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      const submitData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        registrationEndTime: formData.registrationEndTime ? new Date(formData.registrationEndTime).toISOString() : null,
      };

      if (editingId) {
        await eventApi.updateEvent(editingId, submitData);
        setSuccess('Event updated successfully!');
      } else {
        await eventApi.createEvent(submitData);
        setSuccess('Event created successfully!');
      }

      setTimeout(() => {
        handleCloseDialog();
        fetchEvents();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Operation failed. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventApi.deleteEvent(id);
        setSuccess('Event deleted successfully!');
        fetchEvents();
        handleCloseMenu();
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      } catch (err) {
        setError('Failed to delete event');
      }
    }
  };

  const handleSelectAll = (event) => {
    const currentPageEvents = events.slice((page - 1) * eventsPerPage, page * eventsPerPage);
    if (event.target.checked) {
      setSelectedIds([...selectedIds, ...currentPageEvents.map(e => e._id).filter(id => !selectedIds.includes(id))]);
    } else {
      const currentPageIds = currentPageEvents.map(e => e._id);
      setSelectedIds(selectedIds.filter(id => !currentPageIds.includes(id)));
    }
  };

  const handleSelectItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} event(s)?`)) {
      try {
        await Promise.all(selectedIds.map(id => eventApi.deleteEvent(id)));
        setSuccess(`${selectedIds.length} event(s) deleted successfully!`);
        setSelectedIds([]);
        fetchEvents();
      } catch (err) {
        setError('Failed to delete some events');
      }
    }
  };

  const currentPageEvents = events.slice((page - 1) * eventsPerPage, page * eventsPerPage);
  const allSelected = currentPageEvents.length > 0 && currentPageEvents.every(event => selectedIds.includes(event._id));
  const someSelected = currentPageEvents.some(event => selectedIds.includes(event._id)) && !allSelected;

  const handleMenuOpen = (event, eventData) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(eventData);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleEdit = (event) => {
    handleOpenDialog(event);
    handleCloseMenu();
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
          Event Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Event
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {selectedIds.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {selectedIds.length} item(s) selected
          </Typography>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
            size="small"
          >
            Delete Selected
          </Button>
          <Button
            variant="outlined"
            onClick={() => setSelectedIds([])}
            size="small"
          >
            Clear Selection
          </Button>
        </Box>
      )}

      {events.length > 0 ? (
        <>
          <Grid container spacing={4}>
            {currentPageEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event._id}>
                <Box sx={{ position: 'relative' }}>
                  <Checkbox
                    checked={selectedIds.includes(event._id)}
                    onChange={() => handleSelectItem(event._id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 10,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <EventCard 
                    event={event} 
                    isAdmin={true}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      zIndex: 10,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      },
                    }}
                    onClick={(e) => handleMenuOpen(e, event)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
          {events.length > eventsPerPage && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                />
                <Typography variant="body2">
                  Select All ({currentPageEvents.length} on this page)
                </Typography>
              </Box>
            </Box>
          )}
          {Math.ceil(events.length / eventsPerPage) > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(events.length / eventsPerPage)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
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
            justifyContent: 'center',
            py: 8,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No events yet. Create one!
          </Typography>
        </Box>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            if (selectedEvent) {
              handleEdit(selectedEvent);
            }
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit Event
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedEvent) {
              navigate(`/admin/events/${selectedEvent._id}/registrations`);
            }
            handleCloseMenu();
          }}
        >
          <PeopleIcon sx={{ mr: 1, fontSize: 20 }} />
          View Registrations
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedEvent) {
              handleDelete(selectedEvent._id);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Event
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingId ? 'Edit Event' : 'Create New Event'}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={6}
            />
            <TextField
              fullWidth
              label="Context"
              name="context"
              value={formData.context}
              onChange={handleChange}
              multiline
              rows={2}
              placeholder="This text will be displayed on the back of the card in admin view"
              helperText="Context text shown when card is flipped in admin view"
            />
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              select
              SelectProps={{ native: true }}
            >
              <option value=""></option>
              <option value="Workshop">Workshop</option>
              <option value="Talk">Talk</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Meetup">Meetup</option>
              <option value="Competition">Competition</option>
            </TextField>
            <TextField
              fullWidth
              label="Registration End Time"
              name="registrationEndTime"
              type="datetime-local"
              value={formData.registrationEndTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              helperText="After this time, registrations will be closed"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default AdminEvents;
