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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import axios from 'axios';

const AdminGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [titleImageFile, setTitleImageFile] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [titleImagePreview, setTitleImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/gallery', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('Gallery response:', response.data);
      setGallery(response.data.gallery || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingId(item._id);
      setFormData({
        title: item.title,
        category: item.category,
        description: item.description || '',
      });
      setImagePreviews(item.images ? item.images.map(img => `http://localhost:5000${img.url}`) : []);
      // Do not preload files for upload; previews only
      setSelectedFiles([]);
      setTitleImagePreview(item.titleImage ? `http://localhost:5000${item.titleImage}` : '');
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        category: '',
        description: '',
      });
      setSelectedFiles([]);
      setImagePreviews([]);
      setTitleImageFile(null);
      setTitleImagePreview('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setSelectedFiles([]);
    setImagePreviews([]);
    setTitleImageFile(null);
    setTitleImagePreview('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleTitleImageSelect = (e) => {
    const file = e.target.files[0];
    console.log('Title image selected:', file);
    if (file) {
      setTitleImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Title image preview set:', reader.result);
        setTitleImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      // Debug logging
      console.log('Title Image File:', titleImageFile);
      console.log('Title Image Preview:', titleImagePreview);
      console.log('Selected Files:', selectedFiles);
      console.log('Editing ID:', editingId);

      // Validate required fields
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }
      if (!editingId && !titleImageFile) {
        setError('Title image is required');
        return;
      }

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      
      // Combine title image and additional images
      const allImages = titleImageFile ? [titleImageFile, ...selectedFiles] : selectedFiles;
      
      // Add all images
      allImages.forEach((file, index) => {
        console.log(`Adding image ${index + 1}:`, file.name);
        submitData.append('images', file);
      });

      console.log('FormData entries:');
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      if (editingId) {
        await axios.put(`/api/gallery/${editingId}`, submitData, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Gallery item updated successfully!');
      } else {
        await axios.post('/api/gallery', submitData, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Gallery item added successfully!');
      }

      setTimeout(() => {
        handleCloseDialog();
        fetchGallery();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Operation failed. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      try {
        await axios.delete(`/api/gallery/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSuccess('Gallery item deleted successfully!');
        fetchGallery();
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      } catch (err) {
        setError('Failed to delete gallery item');
      }
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(gallery.map(item => item._id));
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
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} gallery item(s)?`)) {
      try {
        await Promise.all(selectedIds.map(id => 
          axios.delete(`/api/gallery/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          })
        ));
        setSuccess(`${selectedIds.length} gallery item(s) deleted successfully!`);
        setSelectedIds([]);
        fetchGallery();
      } catch (err) {
        setError('Failed to delete some gallery items');
      }
    }
  };

  const allSelected = gallery.length > 0 && selectedIds.length === gallery.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < gallery.length;

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
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
              Gallery Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Upload and manage gallery images with titles and descriptions
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
                backgroundColor: '#fff1f2',
              },
            }}
          >
            Add Gallery Item
          </Button>
        </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

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
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Title Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Images</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gallery.length > 0 ? (
              gallery.map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(item._id)}
                      onChange={() => handleSelectItem(item._id)}
                    />
                  </TableCell>
                  <TableCell>
                    {item.titleImage && (
                      <Box
                        component="img"
                        src={`http://localhost:5000${item.titleImage}`}
                        alt={item.title}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary" sx={{ 
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="textSecondary">
                      {item.images?.length || 0} images
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(item)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item._id)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">No gallery items yet. Add one!</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingId ? 'Edit Gallery Item' : 'Add New Gallery Item'}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
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
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="Enter a detailed description for this gallery item..."
          />
          
          {/* Title Image Upload Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Title Image (Main Cover Image)
            </Typography>
            
            {titleImagePreview ? (
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Box
                  component="img"
                  src={titleImagePreview}
                  alt="Title image preview"
                  sx={{
                    width: 200,
                    height: 150,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => {
                    setTitleImageFile(null);
                    setTitleImagePreview('');
                  }}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
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
                  height: 100,
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
                  onChange={handleTitleImageSelect}
                />
                <ImageIcon sx={{ fontSize: 24, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Click to upload title image
                </Typography>
              </Button>
            )}
          </Box>

          {/* Multiple Images Upload Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Additional Images (Max 9)
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<ImageIcon />}
              sx={{
                width: '100%',
                height: 100,
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
                multiple
                onChange={handleFileSelect}
              />
              <ImageIcon sx={{ fontSize: 24, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="textSecondary">
                Click to upload additional images
              </Typography>
            </Button>
          </Box>

          {/* Image Previews */}
          {(titleImagePreview || imagePreviews.length > 0) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Image Previews
              </Typography>
              
              {/* Title Image Preview */}
              {titleImagePreview && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Title Image:
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Box
                      component="img"
                      src={titleImagePreview}
                      alt="Title image preview"
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '2px solid',
                        borderColor: 'primary.main',
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
                      Title Image
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {/* Additional Images Preview */}
              {imagePreviews.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Additional Images:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {imagePreviews.map((preview, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          sx={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleImageRemove(index)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.8)',
                            },
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                        <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
                          Image {index + 1}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default AdminGallery;
