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
  Chip,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import * as blogApi from '../../api/blogs';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogApi.getAllBlogsAdmin();
      const blogsList = response.data.data?.blogs || response.data.blogs || [];
      setBlogs(blogsList);
    } catch (err) {
      setError('Failed to fetch blogs');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (blog = null) => {
    if (blog) {
      setEditingId(blog._id);
      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt || '',
        category: blog.category || '',
        tags: blog.tags?.join(', ') || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setSelectedFile(null);
    setImagePreview('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setSelectedFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('category', formData.category);
      submitData.append('tags', formData.tags);
      
      if (selectedFile) {
        submitData.append('coverImage', selectedFile);
      }

      if (editingId) {
        await blogApi.updateBlog(editingId, submitData);
        setSuccess('Blog updated successfully!');
      } else {
        await blogApi.createBlog(submitData);
        setSuccess('Blog created successfully!');
      }

      setTimeout(() => {
        handleCloseDialog();
        fetchBlogs();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Operation failed. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogApi.deleteBlog(id);
        setSuccess('Blog deleted successfully!');
        fetchBlogs();
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      } catch (err) {
        setError('Failed to delete blog');
      }
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(blogs.map(blog => blog._id));
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
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} blog(s)?`)) {
      try {
        await Promise.all(selectedIds.map(id => blogApi.deleteBlog(id)));
        setSuccess(`${selectedIds.length} blog(s) deleted successfully!`);
        setSelectedIds([]);
        fetchBlogs();
      } catch (err) {
        setError('Failed to delete some blogs');
      }
    }
  };

  const allSelected = blogs.length > 0 && selectedIds.length === blogs.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < blogs.length;

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
        background: 'linear-gradient(135deg, #fff0f0 0%, #fed7d7 100%)',
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
            background: 'linear-gradient(135deg, #D85F5F 0%, #C54545 100%)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(197, 69, 69, 0.3)',
          }}
        >
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              Blog Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Create, edit, and publish blog posts for the community
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#ffffff',
              color: '#C54545',
              fontWeight: 700,
              px: 3,
              py: 1.2,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                backgroundColor: '#fff5f5',
              },
            }}
          >
            Create Blog
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
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tags</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <TableRow key={blog._id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(blog._id)}
                      onChange={() => handleSelectItem(blog._id)}
                    />
                  </TableCell>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.category || '-'}</TableCell>
                  <TableCell>
                    {blog.tags?.map((tag) => (
                      <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(blog)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(blog._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">No blogs yet. Create one!</Typography>
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
            {editingId ? 'Edit Blog' : 'Create New Blog'}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Blog Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              multiline
              rows={2}
            />
            
            {/* Image Upload Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Cover Image
              </Typography>
              
              {imagePreview ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleImageRemove}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  sx={{
                    width: '100%',
                    height: 120,
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Click to upload cover image
                  </Typography>
                </Button>
              )}
            </Box>
            
            <TextField
              fullWidth
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Tags (comma separated)"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. react, javascript, web"
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

export default AdminBlogs;
