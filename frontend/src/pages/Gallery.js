import React, { useState, useEffect, useCallback } from 'react';
import {
  CircularProgress,
  Typography,
} from '@mui/material';
import axios from 'axios';
import GalleryCard from '../components/gallery/GalleryCard';
import GalleryModal from '../components/gallery/GalleryModal';
import '../styles/gallery.css';

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/gallery');
        setItems(res.data.gallery || []);
      } catch (err) {
        console.error('Error fetching gallery', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Transform data to match structure
  const transformedItems = items.map(item => ({
    id: item._id,
    title: item.title,
    category: item.category,
    description: item.description || '',
    coverImage: item.titleImage,
    images: item.images || []
  }));

  const itemCount = transformedItems.length;

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedItem(null);
  }, []);

  const handlePrev = useCallback(() => {
    if (isAnimating || itemCount === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating, itemCount]);

  const handleNext = useCallback(() => {
    if (isAnimating || itemCount === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % itemCount);
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating, itemCount]);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && modalOpen) {
        handleModalClose();
      } else if (e.key === 'ArrowLeft' && !modalOpen && !isAnimating) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && !modalOpen && !isAnimating) {
        handleNext();
      }
    },
    [modalOpen, isAnimating, handleModalClose, handlePrev, handleNext]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentItem = transformedItems[activeIndex];

  if (loading) {
    return (
      <div className="gallery-loading">
        <CircularProgress />
      </div>
    );
  }

  if (!transformedItems.length) {
    return (
      <div className="gallery-empty">
        <Typography variant="h6" color="textSecondary">
          No gallery items yet.
        </Typography>
      </div>
    );
  }

  return (
  <div className="gallery-page">
      <h1 className="gallery-page-title">Magic Moments</h1>
      <div className="gallery-container">
        {/* Left Side - Stacked Cards */}
        <div className="gallery-section gallery-left">
          <div className="card-stack-wrapper">
            <div className="card-stack">
              {transformedItems.map((item, index) => {
                // Calculate position in stack relative to active card
                let stackPosition = index - activeIndex;
                if (stackPosition < 0) {
                  stackPosition += transformedItems.length;
                }
                
                return (
                  <GalleryCard
                    key={item.id || index}
                    item={item}
                    index={index}
                    stackPosition={stackPosition}
                    isActive={index === activeIndex}
                    totalCards={transformedItems.length}
                    onClick={() => handleCardClick(item)}
                  />
                );
              })}
            </div>
            <div className="card-stack-hint">
              Click on photo to view more
            </div>
          </div>
        </div>

        {/* Right Side - Content Panel */}
        <div className="gallery-section gallery-right">
          {currentItem && (
            <div className="content-panel">
              <div className="content-category">
                {currentItem.category}
              </div>
              
              <h1 className="content-title">
                {currentItem.title}
              </h1>
              
              <div className="content-description">
                <p>{currentItem.description || 'No description available.'}</p>
              </div>

              <div className="content-navigation">
                <button 
                  className="nav-arrow nav-prev" 
                  onClick={handlePrev}
                  disabled={isAnimating}
                  aria-label="Previous gallery item"
                >
                  ←
                </button>
                <button 
                  className="nav-arrow nav-next" 
                  onClick={handleNext}
                  disabled={isAnimating}
                  aria-label="Next gallery item"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedItem && (
        <GalleryModal
          item={selectedItem}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Gallery;
