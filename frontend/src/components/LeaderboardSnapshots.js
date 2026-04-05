import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { EmojiEvents as EmojiEventsIcon } from '@mui/icons-material';
import axios from 'axios';

const LeaderboardSnapshots = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSnapshots = async () => {
    try {
      const response = await axios.get('/api/admin/leaderboard/snapshots');
      setSnapshots(response.data.snapshots || []);
    } catch (err) {
      console.error('Error fetching snapshots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
    
    // Set up a refresh interval to check for new snapshots every 30 seconds
    const interval = setInterval(fetchSnapshots, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return null; // Don't show loading state for this component
  }

  if (snapshots.length === 0) {
    return null; // Don't show anything if no snapshots
  }

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <>
      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes scrollVertical {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-300px);
          }
        }
        
        .scrolling-performers {
          animation: scrollVertical 6s linear infinite;
        }
        
        .scrolling-performers:hover {
          animation-play-state: paused;
        }
        
        @media (max-width: 600px) {
          .scrolling-performers {
            animation-duration: 8s;
          }
        }
      `}</style>

      <Box sx={{ py: 8 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <EmojiEventsIcon
            sx={{
              fontSize: 40,
              color: theme.palette.primary.main,
              mb: 2,
            }}
          />
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: theme.palette.text.primary,
              fontSize: isMobile ? '1.8rem' : '2.5rem',
            }}
          >
            Past Champions
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Hall of Fame - Previous Leaderboard Winners
          </Typography>
        </Box>

        {/* Horizontal Scrollable Container */}
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            pb: 2,
            px: 2,
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.grey[200],
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary.main,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          {snapshots.map((snapshot) => (
            <Paper
              key={snapshot._id}
              sx={{
                minWidth: isMobile ? 280 : 320,
                maxWidth: isMobile ? 280 : 320,
                border: '2px solid',
                borderColor: 'divider',
                backgroundColor: 'transparent',
                borderRadius: 2,
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {/* Month Header */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {snapshot.month}
                </Typography>
              </Box>

              {/* Top Performers with Animation */}
              <Box sx={{ p: 2, height: 300, position: 'relative', overflow: 'hidden' }}>
                <Box
                  className="scrolling-performers"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {/* Duplicate data for seamless scrolling */}
                  {[...snapshot.topPerformers, ...snapshot.topPerformers].map((performer, index) => {
                    return (
                      <Box
                        key={`${snapshot._id}-${index}`}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          backgroundColor: 'background.paper',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          minHeight: 80,
                        }}
                      >
                        {/* Rank Medal */}
                        <Box
                          sx={{
                            fontSize: '2rem',
                            color: getMedalColor(performer.rank),
                            fontWeight: 700,
                            minWidth: 40,
                            textAlign: 'center',
                          }}
                        >
                          {getMedalIcon(performer.rank)}
                        </Box>

                        {/* Performer Info */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {performer.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                            @{performer.hackerRankId}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                            {performer.score} pts
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default LeaderboardSnapshots;
