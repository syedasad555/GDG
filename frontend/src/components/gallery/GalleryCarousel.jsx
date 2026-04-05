import React, { useState, useEffect, useCallback } from 'react';
import GalleryCard from './GalleryCard';
import GalleryModal from './GalleryModal';
import '../../styles/gallery-carousel.css';

const GalleryCarousel = ({ items = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const itemCount = items.length;

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
  }, [itemCount]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const handleCardClick = (item, index) => {
    if (index === activeIndex) {
      setSelectedItem(item);
      setModalOpen(true);
    } else {
      setActiveIndex(index);
    }
  };

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedItem(null);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && modalOpen) {
        handleModalClose();
      } else if (e.key === 'ArrowLeft' && !modalOpen) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && !modalOpen) {
        handleNext();
      }
    },
    [modalOpen, handleModalClose, handlePrev, handleNext]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!items.length) {
    return (
      <div className="gallery-carousel-empty">
        <p>No gallery items available.</p>
      </div>
    );
  }

  return (
    <div className="gallery-carousel">
      <div className="cards-container">
        {items.map((item, index) => (
          <GalleryCard
            key={item.id || index}
            item={item}
            index={index}
            isActive={index === activeIndex}
            totalCards={items.length}
            onClick={() => handleCardClick(item, index)}
          />
        ))}
      </div>

      <div className="carousel-controls">
        <button 
          className="carousel-btn carousel-btn-prev" 
          onClick={handlePrev}
          aria-label="Previous card"
        >
          ←
        </button>
        
        <div className="carousel-indicators">
          {items.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
        
        <button 
          className="carousel-btn carousel-btn-next" 
          onClick={handleNext}
          aria-label="Next card"
        >
          →
        </button>
      </div>

      {modalOpen && selectedItem && (
        <GalleryModal
          item={selectedItem}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default GalleryCarousel;
