import React from 'react';
import './lightBackground.css';

const LightBackground = ({ position = 'center' }) => {
  return (
    <div className="light-background">
      <div className={`spotlight-beam position-${position}`}>
        <div className="spotlight-core"></div>
        <div className="spotlight-glow"></div>
        <div className="spotlight-shimmer"></div>
      </div>
    </div>
  );
};

export default LightBackground;
