import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Chip,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';
import { resolveUploadUrl } from '../utils/resolveUploadUrl';

const GalleryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryItem = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/gallery/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error('Error fetching gallery item', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGalleryItem();
    }
  }, [id]);

  const getImageUrl = (path) => resolveUploadUrl(path);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!item) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="textSecondary" align="center">
          Gallery item not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/gallery')}
          sx={{ mb: 2 }}
        >
          Back to Gallery
        </Button>
        
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          {item.title}
        </Typography>
        
        {item.category && (
          <Chip
            label={item.category}
            color="primary"
            size="medium"
            sx={{ mb: 2 }}
          />
        )}
        
        {item.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {item.description}
          </Typography>
        )}
      </Box>

      {/* Main Image */}
      {item.titleImage && (
        <Box mb={4}>
          <Card>
            <CardMedia
              component="img"
              image={getImageUrl(item.titleImage)}
              alt={item.title}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '500px',
                objectFit: 'contain',
                backgroundColor: '#000',
              }}
            />
          </Card>
        </Box>
      )}

      {/* Additional Images */}
      {item.images && item.images.length > 0 && (
        <Box>
          <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
            More Images
          </Typography>
          <Grid container spacing={3}>
            {item.images.map((img, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card>
                  <CardMedia
                    component="img"
                    image={getImageUrl(img.url)}
                    alt={img.caption || `Image ${idx + 1}`}
                    sx={{
                      width: '100%',
                      height: '250px',
                      objectFit: 'cover',
                    }}
                  />
                  {img.caption && (
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {img.caption}
                      </Typography>
                    </CardContent>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Metadata */}
      <Box mt={4} pt={4} borderTop="1px solid #e0e0e0">
        <Typography variant="body2" color="text.secondary">
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Typography>
      </Box>
    </Container>
  );
};

export default GalleryDetail;
