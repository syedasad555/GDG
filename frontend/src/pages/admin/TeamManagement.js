import React, { useState, useEffect, useMemo } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { resolveUploadUrl } from '../../utils/resolveUploadUrl';

const SECTIONS = [
  { value: 'leadership', label: 'Leadership' },
  { value: 'web', label: 'Web Development' },
  { value: 'cloud', label: 'Cloud Computing' },
  { value: 'android', label: 'Android Development' },
  { value: 'aiml', label: 'AI & ML' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
];

const ROLE_OPTIONS = {
  leadership: ['GDG Lead', 'GDG Co-Lead', 'Faculty Advisor'],
  web: ['Web Lead', 'Web Co-Lead'],
  cloud: ['Cloud Lead', 'Cloud Co-Lead'],
  android: ['Android Lead', 'Android Co-Lead'],
  aiml: ['AI/ML Lead', 'AI/ML Co-Lead'],
  design: ['Design Lead', 'Design Co-Lead'],
  marketing: ['Marketing Lead', 'Marketing Co-Lead'],
};

const defaultRoleForSection = (section) => ROLE_OPTIONS[section]?.[0] || 'Member';

const emptyForm = () => ({
  name: '',
  role: defaultRoleForSection('leadership'),
  section: 'leadership',
  linkedInUrl: '',
  description: '',
  sortOrder: 0,
  photoFile: null,
});

const TeamManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState(emptyForm());

  const roleChoices = useMemo(() => {
    const preset = ROLE_OPTIONS[formData.section] || [];
    if (formData.role && !preset.includes(formData.role)) {
      return [formData.role, ...preset];
    }
    return preset;
  }, [formData.section, formData.role]);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/team', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMembers(response.data.members || []);
    } catch (err) {
      console.error('Error fetching team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm());
    setOpenDialog(true);
    setError('');
  };

  const handleOpenEdit = (m) => {
    setEditingId(m._id);
    setFormData({
      name: m.name || '',
      role: m.role || defaultRoleForSection(m.section),
      section: m.section || 'leadership',
      linkedInUrl: m.linkedInUrl || '',
      description: m.description || '',
      sortOrder: m.sortOrder ?? 0,
      photoFile: null,
    });
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'section') {
        next.role = defaultRoleForSection(value);
      }
      return next;
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({ ...prev, photoFile: file || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('role', formData.role.trim());
      fd.append('section', formData.section);
      fd.append('linkedInUrl', formData.linkedInUrl.trim());
      fd.append('description', formData.description.trim());
      fd.append('sortOrder', String(formData.sortOrder ?? 0));
      if (formData.photoFile) {
        fd.append('photo', formData.photoFile);
      }

      const headers = {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      };

      if (editingId) {
        await axios.put(`/api/admin/team/${editingId}`, fd, { headers });
        setSuccess('Team member updated.');
      } else {
        await axios.post('/api/admin/team', fd, { headers });
        setSuccess('Team member added.');
      }

      handleCloseDialog();
      fetchTeam();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this person from the public team page?')) return;
    try {
      await axios.delete(`/api/admin/team/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess('Removed.');
      fetchTeam();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const sectionLabel = (v) => SECTIONS.find((s) => s.value === v)?.label || v;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
          Team management
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          Add team member
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 720 }}>
        Add photos, names, and LinkedIn profiles. These appear on the public{' '}
        <strong>Team</strong> page. Role defaults are suggested per group; you can pick another from the list.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700 }}>Photo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Section</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>LinkedIn</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.length > 0 ? (
              members.map((member) => (
                <TableRow key={member._id} hover>
                  <TableCell>
                    <Avatar
                      src={member.photo ? resolveUploadUrl(member.photo) : undefined}
                      alt={member.name}
                      sx={{ width: 48, height: 48 }}
                    >
                      {member.name?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{sectionLabel(member.section)}</TableCell>
                  <TableCell>
                    {member.linkedInUrl ? (
                      <IconButton
                        size="small"
                        component="a"
                        href={member.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(member)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(member._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">No team members yet. Add people to show them on /team.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingId ? 'Edit team member' : 'Add team member'}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="outlined" component="label" sx={{ alignSelf: 'flex-start' }}>
              {formData.photoFile ? formData.photoFile.name : 'Choose photo'}
              <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" onChange={handlePhotoChange} />
            </Button>
            {!formData.photoFile && editingId && (
              <Typography variant="caption" color="text.secondary">
                Leave empty to keep the current photo.
              </Typography>
            )}
            <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} required />
            <TextField
              fullWidth
              select
              label="Section (group on Team page)"
              name="section"
              value={formData.section}
              onChange={handleChange}
              required
            >
              {SECTIONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              helperText="Defaults when you change section; pick the closest title."
            >
              {roleChoices.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="LinkedIn profile URL"
              name="linkedInUrl"
              value={formData.linkedInUrl}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/..."
            />
            <TextField
              fullWidth
              label="Short bio (leadership cards only, optional)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              minRows={2}
            />
            <TextField
              fullWidth
              type="number"
              label="Sort order"
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleChange}
              helperText="Lower numbers appear first within a section."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {editingId ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default TeamManagement;
