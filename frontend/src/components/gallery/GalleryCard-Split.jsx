import React from 'react';

const GalleryCard = ({ item, index, isActive, totalCards, onClick }) => {
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const cardStyle = {
    '--index': index,
    '--total': totalCards,
    '--angle': isActive ? '0deg' : `${(index - (isActive ? index : index)) * 15}deg`,
    '--z-index': isActive ? totalCards : totalCards - Math.abs(index - (isActive ? index : index)),
  };

  return (
    <div 
      className={`gallery-card ${isActive ? 'active' : ''}`}
      style={cardStyle}
      onClick={onClick}
    >
      <div className="card-image-container">
        <img 
          src={getImageUrl(item.coverImage || item.titleImage)} 
          alt={item.title}
          className="card-image"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default GalleryCard;
