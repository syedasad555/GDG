import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';

const AdminContests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: '',
    startDate: '',
    endDate: '',
    link: '',
  });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/contests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('Contests response:', response.data);
      setContests(response.data.contests || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching contests:', err);
      setLoading(false);
    }
  };

  const handleOpenDialog = (contest = null) => {
    if (contest) {
      setEditingId(contest.id);
      setFormData({
        title: contest.title,
        description: contest.description,
        platform: contest.platform,
        startDate: contest.startDate,
        endDate: contest.endDate,
        link: contest.link,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        platform: '',
        startDate: '',
        endDate: '',
        link: '',
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
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingId) {
        await axios.put(`/api/contests/${editingId}`, submitData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSuccess('Contest updated successfully!');
      } else {
        await axios.post('/api/contests', submitData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSuccess('Contest created successfully!');
      }

      setTimeout(() => {
        handleCloseDialog();
        fetchContests();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Operation failed. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contest?')) {
      try {
        await axios.delete(`/api/contests/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSuccess('Contest deleted successfully!');
        fetchContests();
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      } catch (err) {
        setError('Failed to delete contest');
      }
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(contests.map(contest => contest._id));
    } else {
      setSelectedIds([]);
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
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} contest(s)?`)) {
      try {
        await Promise.all(selectedIds.map(id => 
          axios.delete(`/api/contests/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          })
        ));
        setSuccess(`${selectedIds.length} contest(s) deleted successfully!`);
        setSelectedIds([]);
        fetchContests();
      } catch (err) {
        setError('Failed to delete some contests');
      }
    }
  };

  const allSelected = contests.length > 0 && selectedIds.length === contests.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < contests.length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f0ff 0%, #e9d5ff 100%)',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Header Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #8461BD 0%, #6E48AD 100%)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(110, 72, 173, 0.3)',
          }}
        >
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              Contest Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Create contests and upload HackerRank scores for leaderboards
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#ffffff',
              color: '#6E48AD',
              fontWeight: 700,
              px: 3,
              py: 1.2,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                backgroundColor: '#f5f0ff',
              },
            }}
          >
            Create Contest
          </Button>
        </Paper>

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Platform</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contests.length > 0 ? (
              contests.map((contest) => (
                <TableRow key={contest._id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(contest._id)}
                      onChange={() => handleSelectItem(contest._id)}
                    />
                  </TableCell>
                  <TableCell>{contest.title}</TableCell>
                  <TableCell>{contest.platform}</TableCell>
                  <TableCell>
                    {contest.startDate ? new Date(contest.startDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {contest.endDate ? new Date(contest.endDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(contest)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(contest._id)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">No contests yet. Create one!</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingId ? 'Edit Contest' : 'Create New Contest'}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Contest Title"
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
              rows={3}
            />
            <TextField
              fullWidth
              label="Platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              placeholder="e.g. HackerRank, CodeChef"
            />
            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Contest Link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              type="url"
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
    </Box>
  );
};

export default AdminContests;
