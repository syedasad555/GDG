import React, { useCallback, useEffect, useState } from 'react';

const GalleryModal = ({ item, onClose }) => {
  const [activeImage, setActiveImage] = useState(null);
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        if (activeImage) {
          setActiveImage(null);
        } else {
          onClose();
        }
      }
    },
    [activeImage, onClose]
  );

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  if (!item) return null;

  // Get additional images (exclude cover image from display)
  const additionalImages = (item.images || []).map(img => img.url || img).filter(Boolean);
  const imageCount = additionalImages.length;

  // Determine layout class based on image count
  const getLayoutClass = () => {
    if (imageCount === 1) return 'few-images single-image';
    if (imageCount <= 2) return 'few-images';
    if (imageCount <= 4) return 'medium-images';
    return 'many-images';
  };

  // Assign size classes for masonry effect
  const getImageSizeClass = (index) => {
    if (imageCount <= 2) {
      // For 1-2 images, make them large
      return index === 0 ? 'masonry-large' : 'masonry-medium';
    }
    // For more images, create variation
    const sizes = ['masonry-small', 'masonry-medium', 'masonry-large', 'masonry-wide', 'masonry-tall'];
    return sizes[index % sizes.length];
  };

  return (
    <div className="gallery-modal" onClick={handleBackdropClick}>
      <div className={`modal-overlay ${getLayoutClass()}`} onClick={(e) => e.stopPropagation()}>
        {/* Header with title and close button */}
        <div className="modal-header">
          <h2 className="modal-title">{item.title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        {/* Masonry image layout */}
        <div className="modal-images-container">
          {imageCount > 0 ? (
            <div className={`masonry-grid ${getLayoutClass()}`}>
              {additionalImages.map((image, index) => {
                const url = getImageUrl(image);
                return (
                  <div 
                    key={index} 
                    className={`masonry-item ${getImageSizeClass(index)}`}
                    onClick={() => setActiveImage(url)}
                  >
                    <img 
                      src={url}
                      alt={`${item.title} — ${index + 1}`}
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-images">
              <p>No additional images available</p>
            </div>
          )}
        </div>

        {activeImage && (
          <div className="lightbox-overlay" onClick={() => setActiveImage(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img src={activeImage} alt={item.title} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryModal;
