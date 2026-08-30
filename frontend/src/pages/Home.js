import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Hero from '../components/Hero';
import WhyJoinGDG from '../components/WhyJoinGDG';
import TeamScroll from '../components/TeamScroll';
import HomeBlogCarousel from '../components/HomeBlogCarousel';
import axios from 'axios';

const Home = () => {
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const response = await axios.get('/api/admin/leaderboard/snapshots');
        setSnapshots(response.data.snapshots || []);
      } catch (err) {
        console.error('Error fetching snapshots:', err);
      }
    };

    fetchSnapshots();
    const snapshotsInterval = setInterval(fetchSnapshots, 5 * 60 * 1000);

    return () => {
      clearInterval(snapshotsInterval);
    };
  }, []);

  return (
    <>
      {/* CSS Animation for continuous scrolling */}
      <Box
        component="style"
        sx={{
          '@keyframes scrollVertical': {
            '0%': {
              transform: 'translateY(0)',
            },
            '100%': {
              transform: 'translateY(-240px)', // 3 performers × 80px each
            },
          },
          '@keyframes scrollHorizontal': {
            '0%': {
              transform: 'translateX(0)',
            },
            '100%': {
              transform: `translateX(-${(snapshots?.length || 1) * 340}px)`, // Each box is 320px + 20px gap
            },
          },
        }}
      />

      <Box sx={{ flexGrow: 1 }}>
        {/* Hero Section */}
        <Hero />

        {/* Why Join GDG Section */}
        <Box sx={{ backgroundColor: '#6FA8FF' }}>
          <WhyJoinGDG />
        </Box>
      </Box>
      {/* Team Section */}
      <Box sx={{ backgroundColor: '#4CAF7A' }}>
        <TeamScroll />
      </Box>

      {/* Blog Carousel Section */}
      <HomeBlogCarousel />
    </>
  );
};

export default Home;
