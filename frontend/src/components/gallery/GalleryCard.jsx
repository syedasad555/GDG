import React from 'react';
import { resolveUploadUrl } from '../../utils/resolveUploadUrl';

const GalleryCard = ({ item, index, isActive, totalCards, onClick }) => {
  const getImageUrl = (path) => resolveUploadUrl(path);

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
        {item.category && (
          <div className="card-category-badge">
            {item.category}
          </div>
        )}
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{item.title}</h3>
        {item.description && (
          <p className="card-description">{item.description}</p>
        )}
      </div>
    </div>
  );
};

export default GalleryCard;
