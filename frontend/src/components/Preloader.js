import { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation at 3 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3000);

    // Complete and unmount at 3.5 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`preloader-container ${isExiting ? 'preloader-exit' : ''}`}>
      {/* Subtle background grid pattern */}
      <div className="preloader-grid" />

      {/* Main logo container */}
      <div className="logo-glow">
        {/* Brackets and letters row */}
        <div className="brackets-snap">
          {/* Left bracket < with blue/green gradient */}
          <span className="bracket-left">
            {'<'}
          </span>

          {/* GDG Letters */}
          <div className="gdg-letters">
            <span className="letter-g">G</span>
            <span className="letter-d">D</span>
            <span className="letter-g2">G</span>
          </div>

          {/* Right bracket > with red/yellow gradient */}
          <span className="bracket-right">
            {'>'}
          </span>
        </div>

        {/* SAHE Subtitle */}
        <div className="subtitle">
          <span className="letter-s">S</span>
          <span className="letter-a">A</span>
          <span className="letter-h">H</span>
          <span className="letter-e">E</span>
        </div>

        {/* Google Developers Group */}
        <p className="subtitle-text">
          Google Developers Group
        </p>

        {/* Animated underline */}
        <div className="animated-underline">
          <span className="dot dot-blue" />
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
      </div>

      {/* Corner decorations */}
      <div className="corner corner-top-left" />
      <div className="corner corner-top-right" />
      <div className="corner corner-bottom-left" />
      <div className="corner corner-bottom-right" />
    </div>
  );
};

export default Preloader;
