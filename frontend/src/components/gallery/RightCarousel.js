import React from 'react';

const RightCarousel = ({ images = [], currentIndex = 0, category, onPrev, onNext, onMainClick }) => {
  if (!images.length) return null;

  const total = images.length;
  const topIndex = (currentIndex - 1 + total) % total;
  const middleIndex = currentIndex;
  const bottomIndex = (currentIndex + 1) % total;

  return (
    <div className="right-carousel">
      <div className="carousel-track">
        <div className="carousel-item top" onClick={onPrev}>
          <img src={images[topIndex]} alt="previous" />
        </div>

        <div className="carousel-item middle" onClick={onMainClick}>
          <img src={images[middleIndex]} alt="current" />
          {category && (
            <div className="category-badge">
              {category}
            </div>
          )}
        </div>

        <div className="carousel-item bottom" onClick={onNext}>
          <img src={images[bottomIndex]} alt="next" />
        </div>
      </div>
    </div>
  );
};

export default RightCarousel;
