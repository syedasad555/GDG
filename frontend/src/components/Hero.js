import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { LinkedIn as LinkedInIcon, Email as EmailIcon, Instagram as InstagramIcon } from '@mui/icons-material';
import "./Hero.css";

const Hero = () => {
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPerformers = async () => {
      try {
        const response = await axios.get('/api/leaderboard/all-time');
        const leaderboard = response.data.leaderboard || [];
        // Get top 10 performers
        const top10 = leaderboard.slice(0, 10).map((entry, index) => ({
          rank: entry.rank || index + 1,
          name: entry.user?.name || entry.name || 'Unknown',
          rollNumber: entry.user?.rollNumber || entry.rollNumber || 'N/A',
          hackerRankId: entry.user?.hackerrankHandle || entry.hackerRankId || entry.hackerrankHandle || 'N/A',
          score: entry.score || 0
        }));
        setTopPerformers(top10);
      } catch (err) {
        console.error('Error fetching top performers:', err);
        setTopPerformers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPerformers();
  }, []);

  const renderVerticalText = (text, startIndex, endIndex) => {
    return text.slice(startIndex, endIndex).split('').map((char, idx) => (
      <span key={`${startIndex}-${idx}`} className="label-char">{char === ' ' ? '\u00A0' : char}</span>
    ));
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="highlight">GDG Student Club - SAHE</span>
          </h1>

          <p className="hero-subtitle">
            Connect, learn, and build with fellow developers. Join workshops,
            hackathons, and tech events to grow your skills and become part of
            something amazing.
          </p>

          <div className="hero-actions">
            <Link
              to="/contests#contest-leaderboard"
              state={{ scrollToContestLeaderboard: true }}
              className="btn-hero"
            >
              View Leaderboard →
            </Link>
          </div>

          <div className="social-icons">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="LinkedIn"
            >
              <LinkedInIcon sx={{ fontSize: 30, zIndex: 1 }} />
            </a>
            <a
              href="mailto:contact@gdg.com"
              className="social-icon"
              aria-label="Email"
            >
              <EmailIcon sx={{ fontSize: 30, zIndex: 1 }} />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Instagram"
            >
              <InstagramIcon sx={{ fontSize: 30, zIndex: 1 }} />
            </a>
          </div>
        </div>

        {/* RIGHT SIDE MARQUEE */}
        <div className="hero-side">
          <div className="performers-label">
            {renderVerticalText("Top ", 0, 4)}
            <span className="label-number">10</span>
            {renderVerticalText(" Performers", 0, 11)}
          </div>
          {loading ? (
            <div className="marquee-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: '#E0E0E0' }}>Loading performers...</div>
            </div>
          ) : (
            <div className="marquee-container">
              <Marquee direction="down" performers={topPerformers.slice(0, 5)} />
              <Marquee direction="up" performers={topPerformers.slice(5, 10)} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const getMedalIcon = (rank) => {
  switch (rank) {
    case 1: return "🥇";
    case 2: return "🥈";
    case 3: return "🥉";
    default: return "🏆";
  }
};

const getMedalColor = (rank) => {
  switch (rank) {
    case 1: return '#FFD700';
    case 2: return '#C0C0C0';
    case 3: return '#CD7F32';
    default: return 'rgba(255, 255, 255, 0.9)';
  }
};

const Marquee = ({ direction, performers }) => {
  // Duplicate performers for seamless scrolling
  const duplicatedPerformers = [...performers, ...performers];
  
  if (performers.length === 0) {
    return (
      <div className={`marquee-column static`}>
        <div className="marquee-content">
          <div className="review-card">
            <div className="review-header">
              <div className="profile-icon">📊</div>
              <div>
                <div className="review-author">No performers yet</div>
              </div>
            </div>
            <div className="review-body">Check back later for top performers!</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`marquee-column ${direction}`}>
      <div className="marquee-content">
        {duplicatedPerformers.map((performer, i) => (
          <div className="review-card" key={`${performer.rank}-${i}`}>
            <div className="review-header">
              <div className="profile-icon" style={{ 
                width: '48px',
                height: '48px',
                minWidth: '48px',
                minHeight: '48px',
                flexShrink: 0,
                fontSize: performer.rank <= 3 ? '24px' : '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: performer.rank > 3 ? 700 : 'normal'
              }}>
                {performer.rank <= 3 ? getMedalIcon(performer.rank) : `#${performer.rank}`}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="review-author">{performer.name}</div>
                <div className="review-username">Rank #{performer.rank}</div>
              </div>
            </div>
            <div className="review-body">
              <div style={{ marginBottom: '8px', fontWeight: 600 }}>
                <span style={{ opacity: 0.8 }}>HackerRank: </span>
                {performer.hackerRankId}
              </div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: getMedalColor(performer.rank), marginTop: '4px' }}>
                Score: {performer.score} pts
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
