import React from 'react';
import LightBackground from './LightBackground';

const textFallback = {
  left: 'GDG Events & Workshops',
  center: 'Welcome to GDG Gallery',
  right: 'Tech Talks & Hackathons',
};

const LeftPanel = ({ position = 'center', title }) => {
  const displayText = title || textFallback[position] || textFallback.center;

  return (
    <div className="left-panel">
      <LightBackground position={position} />

      <div className="light-text-overlay">
        <div className="light-text">{displayText}</div>
      </div>
    </div>
  );
};

export default LeftPanel;
