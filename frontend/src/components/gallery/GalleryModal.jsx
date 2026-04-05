import React, { useCallback, useEffect } from 'react';

const GalleryModal = ({ item, onClose }) => {
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!item) return null;

  const allImages = [
    ...(item.coverImage ? [item.coverImage] : []),
    ...(item.titleImage ? [item.titleImage] : []),
    ...(item.images || []).map(img => img.url || img)
  ].filter((img, index, self) => self.indexOf(img) === index); // Remove duplicates

  return (
    <div className="gallery-modal" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        
        <div className="modal-header">
          <h2 className="modal-title">{item.title}</h2>
          {item.category && (
            <span className="modal-category">{item.category}</span>
          )}
        </div>

        {item.description && (
          <div className="modal-description">
            <p>{item.description}</p>
          </div>
        )}

        <div className="modal-images">
          {allImages.length > 0 ? (
            <div className="image-grid">
              {allImages.map((image, index) => (
                <div key={index} className="image-item">
                  <img 
                    src={getImageUrl(image)} 
                    alt={`${item.title} — ${index + 1}`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-images">
              <p>No images available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
