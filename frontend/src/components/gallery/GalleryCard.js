import React from 'react';
import { resolveUploadUrl } from '../../utils/resolveUploadUrl';

const GalleryCard = ({ item, index, stackPosition, isActive, wasActive, totalCards, onClick }) => {
  const getImageUrl = (path) => resolveUploadUrl(path);

  // Calculate rotation angle based on stack position
  // Active card: 0deg, others: slight rotation
  const getAngle = () => {
    if (isActive) return 0;
    // Cards behind active get negative rotation, cards ahead get positive
    const offset = stackPosition;
    if (offset === 0) return 0;
    // Alternate rotation direction for visual depth
    return offset % 2 === 0 ? -8 : 8;
  };

  // Calculate z-index: active card on top, others based on distance
  const getZIndex = () => {
    if (isActive) return totalCards + 1;
    // Cards closer to active have higher z-index
    const distance = Math.min(stackPosition, totalCards - stackPosition);
    return totalCards - distance;
  };

  // Calculate translate offset for non-active cards
  const getOffset = () => {
    if (isActive) return { x: 0, y: 0 };
    const offset = stackPosition;
    // Slight offset for depth
    return {
      x: (offset % 2 === 0 ? -2 : 2) * Math.min(offset, 3),
      y: (offset % 2 === 0 ? 2 : -2) * Math.min(offset, 3)
    };
  };

  const angle = getAngle();
  const zIndex = getZIndex();
  const offset = getOffset();

  // Build transform string
  let transform = '';
  if (isActive) {
    transform = 'translate(-50%, -50%) rotate(0deg)';
  } else {
    transform = `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) rotate(${angle}deg)`;
  }

  const cardStyle = {
    '--angle': `${angle}deg`,
    '--offset-x': `${offset.x}px`,
    '--offset-y': `${offset.y}px`,
    transform: transform,
    zIndex: zIndex,
  };

  return (
    <div 
      className={`gallery-card ${isActive ? 'active' : ''} ${wasActive ? 'prev-active' : ''}`}
      style={cardStyle}
      onClick={onClick}
    >
      <div className="card-image-wrapper">
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
