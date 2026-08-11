import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  EmojiEvents as EmojiEventsIcon,
  CalendarToday as CalendarIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Contests = () => {
  const location = useLocation();
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const leaderboardEntriesPerPage = 10;

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await axios.get('/api/contests');
        console.log('Contests response:', response.data);
        const contestsList = response.data.contests || response.data.data || [];
        setContests(contestsList);
        setFilteredContests(contestsList);
        console.log('Contests loaded:', contestsList.length);
      } catch (err) {
        console.error('Error fetching contests:', err);
        console.error('Error details:', err.response?.data);
        setContests([]);
        setFilteredContests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  useEffect(() => {
    let result = [...contests];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        contest =>
          contest.title.toLowerCase().includes(query) ||
          contest.description.toLowerCase().includes(query) ||
          contest.platform.toLowerCase().includes(query)
      );
    }

    setFilteredContests(result);
  }, [searchQuery, contests]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const allTimeRes = await axios.get('/api/leaderboard/all-time');
        setLeaderboardData(allTimeRes.data.leaderboard || []);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (location.hash !== '#contest-leaderboard') return;
    const scrollToLeaderboard = () => {
      document.getElementById('contest-leaderboard')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    };
    const t1 = setTimeout(scrollToLeaderboard, 0);
    const t2 = setTimeout(scrollToLeaderboard, 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading, location.hash]);

  const handleLeaderboardPageChange = (event, value) => {
    setLeaderboardPage(value);
  };

  // Calculate pagination for leaderboard
  const leaderboardTotalPages = Math.ceil(leaderboardData.length / leaderboardEntriesPerPage);
  const leaderboardStartIndex = (leaderboardPage - 1) * leaderboardEntriesPerPage;
  const leaderboardEndIndex = leaderboardStartIndex + leaderboardEntriesPerPage;
  const paginatedLeaderboardData = leaderboardData.slice(leaderboardStartIndex, leaderboardEndIndex);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #5B9FED 0%, #4A8FDC 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ 
              color: '#fff',
              mb: 2,
            }} 
          />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
            Loading Contests...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #5B9FED 0%, #4A8FDC 100%)',
      py: 6,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      },
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box sx={{ 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            animation: 'bounce 2s ease-in-out infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' },
            },
          }}>
            <EmojiEventsIcon sx={{ 
              fontSize: 60, 
              color: '#fff',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
            }} />
          </Box>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              color: '#2d3436',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '0 2px 10px rgba(0,0,0,0.05)',
              animation: 'fadeInDown 0.8s ease',
              '@keyframes fadeInDown': {
                from: {
                  opacity: 0,
                  transform: 'translateY(-20px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            Contests & Competitions
          </Typography>
          <Typography
            variant="h6"
            sx={{ 
              color: 'rgba(0,0,0,0.6)',
              maxWidth: '700px',
              mx: 'auto',
              mb: 4,
              lineHeight: 1.6,
              animation: 'fadeInUp 0.8s ease 0.2s both',
              '@keyframes fadeInUp': {
                from: {
                  opacity: 0,
                  transform: 'translateY(20px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            Participate in exciting coding contests and compete with fellow developers
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', animation: 'fadeIn 0.8s ease 0.4s both' }}>
            <TextField
              placeholder="Search contests..."
              variant="outlined"
              size="medium"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                width: { xs: '100%', sm: '500px' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '50px',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: '#fff',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.8)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                },
                '& input': {
                  fontSize: '1rem',
                  fontWeight: 500,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#5B9FED', fontSize: 24 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

      {filteredContests.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
          }}
        >
          <EmojiEventsIcon
            sx={{
              fontSize: 64,
              color: 'rgba(0,0,0,0.2)',
              mb: 2,
            }}
          />
          <Typography variant="h6" sx={{ color: 'rgba(0,0,0,0.6)', fontWeight: 500 }}>
            {searchQuery ? 'No contests found matching your search' : 'No contests available yet'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)', mt: 1 }}>
            Check back soon for upcoming contests!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredContests.map((contest, index) => {
            const colors = [
              { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', light: 'rgba(102, 126, 234, 0.15)', shadow: 'rgba(102, 126, 234, 0.25)' },
              { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', light: 'rgba(240, 147, 251, 0.15)', shadow: 'rgba(240, 147, 251, 0.25)' },
              { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', light: 'rgba(79, 172, 254, 0.15)', shadow: 'rgba(79, 172, 254, 0.25)' },
              { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', light: 'rgba(67, 233, 123, 0.15)', shadow: 'rgba(67, 233, 123, 0.25)' },
              { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', light: 'rgba(250, 112, 154, 0.15)', shadow: 'rgba(250, 112, 154, 0.25)' },
              { gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', light: 'rgba(48, 207, 208, 0.15)', shadow: 'rgba(48, 207, 208, 0.25)' },
            ];
            const cardColor = colors[index % colors.length];
            
            return (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                key={contest._id}
                sx={{
                  animation: `slideUp 0.5s ease ${index * 0.1}s both`,
                  '@keyframes slideUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(30px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(180deg, #ffffff 0%, #fafbff 100%)',
                    borderRadius: 4,
                    border: 'none',
                    boxShadow: `0 10px 40px ${cardColor.shadow}, 0 2px 10px rgba(0,0,0,0.04)`,
                    transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '6px',
                      background: cardColor.gradient,
                      zIndex: 10,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${cardColor.light} 0%, transparent 100%)`,
                      opacity: 0,
                      transition: 'opacity 0.5s ease',
                      pointerEvents: 'none',
                    },
                    '&:hover::after': {
                      opacity: 1,
                    },
                    '&:hover': {
                      transform: 'translateY(-16px) scale(1.02)',
                      boxShadow: `0 30px 60px ${cardColor.shadow}, 0 10px 30px ${cardColor.shadow}`,
                    },
                  }}
                >
                <CardContent sx={{ flexGrow: 1, p: 3, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Header with Icon */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ flex: 1, pr: 2 }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 800,
                        color: '#1a1a1a',
                        lineHeight: 1.3,
                        mb: 0.5,
                        fontSize: '1.4rem',
                        letterSpacing: '-0.5px',
                      }}>
                        {contest.title}
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      background: cardColor.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 15px ${cardColor.shadow}`,
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        transform: 'rotate(10deg) scale(1.1)',
                        boxShadow: `0 6px 20px ${cardColor.shadow}`,
                      },
                    }}>
                      <EmojiEventsIcon
                        sx={{
                          color: '#fff',
                          fontSize: 28,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(0,0,0,0.7)',
                    mb: 2,
                    lineHeight: 1.6,
                    fontSize: '0.9rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {contest.description}
                  </Typography>

                  {/* Platform Badge */}
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={contest.platform}
                      size="medium"
                      sx={{
                        background: cardColor.gradient,
                        color: '#fff',
                        fontWeight: 700,
                        border: 'none',
                        fontSize: '0.8rem',
                        letterSpacing: '0.5px',
                        py: 2.5,
                        px: 1,
                        textTransform: 'uppercase',
                        boxShadow: `0 3px 10px ${cardColor.shadow}`,
                      }}
                    />
                  </Box>

                  {/* Date Information */}
                  <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {contest.startDate && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1.5,
                        background: `${cardColor.light}`,
                        borderRadius: 2.5,
                        border: `1px solid ${cardColor.light}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: cardColor.gradient,
                          transform: 'translateX(4px)',
                          '& .date-label, & .date-text': {
                            color: '#fff',
                          },
                        },
                      }}>
                        <Box sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          background: cardColor.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1.5,
                          boxShadow: `0 2px 8px ${cardColor.shadow}`,
                        }}>
                          <CalendarIcon sx={{ fontSize: 20, color: '#fff' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" className="date-label" sx={{ color: 'rgba(0,0,0,0.5)', fontWeight: 600, display: 'block', mb: 0.25, transition: 'color 0.3s' }}>
                            Start Date
                          </Typography>
                          <Typography variant="body2" className="date-text" sx={{ color: 'rgba(0,0,0,0.8)', fontWeight: 600, transition: 'color 0.3s' }}>
                            {format(parseISO(contest.startDate), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {contest.endDate && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        p: 1.5,
                        background: `${cardColor.light}`,
                        borderRadius: 2.5,
                        border: `1px solid ${cardColor.light}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: cardColor.gradient,
                          transform: 'translateX(4px)',
                          '& .date-label, & .date-text': {
                            color: '#fff',
                          },
                        },
                      }}>
                        <Box sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          background: cardColor.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1.5,
                          boxShadow: `0 2px 8px ${cardColor.shadow}`,
                        }}>
                          <CalendarIcon sx={{ fontSize: 20, color: '#fff' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" className="date-label" sx={{ color: 'rgba(0,0,0,0.5)', fontWeight: 600, display: 'block', mb: 0.25, transition: 'color 0.3s' }}>
                            End Date
                          </Typography>
                          <Typography variant="body2" className="date-text" sx={{ color: 'rgba(0,0,0,0.8)', fontWeight: 600, transition: 'color 0.3s' }}>
                            {format(parseISO(contest.endDate), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Action Button */}
                  {contest.link && (
                    <Button
                      variant="contained"
                      fullWidth
                      href={contest.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<LinkIcon />}
                      sx={{ 
                        mt: 'auto',
                        py: 1.8,
                        background: '#1a1a1a',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '1rem',
                        borderRadius: '50px',
                        textTransform: 'none',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s ease',
                        },
                        '&:hover::before': {
                          left: '100%',
                        },
                        '&:hover': {
                          background: '#2d3436',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                          transform: 'translateY(-3px)',
                        },
                        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                      }}
                    >
                      View Contest
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
            );
          })}
        </Grid>
      )}

      {/* Leaderboard Section */}
      <Box id="contest-leaderboard" sx={{ mt: 8, mb: 4, scrollMarginTop: '88px' }}>
        <Box sx={{ 
          textAlign: 'center', 
          mb: 6,
          animation: 'fadeIn 1s ease',
        }}>
          <Typography variant="h3" component="h2" sx={{ 
            fontWeight: 800, 
            mb: 2,
            color: '#2d3436',
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}>
            🏆 Contest Leaderboard
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'rgba(0,0,0,0.6)',
            fontWeight: 500,
          }}>
            Top performers in our coding contests
          </Typography>
        </Box>

        <Card sx={{ 
          mb: 4,
          borderRadius: 4,
          border: 'none',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
        }}>
          <CardContent sx={{ p: 4 }}>
            {leaderboardLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress sx={{ color: '#5B9FED' }} />
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(135deg, #5B9FED 0%, #4A8FDC 100%)' }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Rank</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Name</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Email</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Roll Number</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>HackerRank ID</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Score</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedLeaderboardData.length > 0 ? (
                        paginatedLeaderboardData.map((entry, index) => {
                          const actualRank = leaderboardStartIndex + index + 1;
                          const isTopThree = actualRank <= 3;
                          return (
                            <TableRow 
                              key={entry._id || index}
                              sx={{
                                background: isTopThree 
                                  ? actualRank === 1 
                                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)'
                                    : actualRank === 2
                                    ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(192, 192, 192, 0.05) 100%)'
                                    : 'linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(205, 127, 50, 0.05) 100%)'
                                  : 'transparent',
                                '&:hover': {
                                  background: 'rgba(91, 159, 237, 0.05)',
                                },
                                transition: 'background 0.3s ease',
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {actualRank === 1 && <Typography sx={{ fontSize: '2rem', mr: 1 }}>🥇</Typography>}
                                  {actualRank === 2 && <Typography sx={{ fontSize: '2rem', mr: 1 }}>🥈</Typography>}
                                  {actualRank === 3 && <Typography sx={{ fontSize: '2rem', mr: 1 }}>🥉</Typography>}
                                  {actualRank > 3 && (
                                    <Box sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: '50%',
                                      background: 'rgba(91, 159, 237, 0.15)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 700,
                                      color: '#5B9FED',
                                      border: '2px solid rgba(91, 159, 237, 0.3)',
                                    }}>
                                      {actualRank}
                                    </Box>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar sx={{ 
                                    mr: 2, 
                                    width: 40, 
                                    height: 40,
                                    background: 'linear-gradient(135deg, #5B9FED 0%, #4A8FDC 100%)',
                                    fontWeight: 700,
                                  }}>
                                    {entry.user?.name?.charAt(0) || entry.name?.charAt(0) || 'U'}
                                  </Avatar>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                                    {entry.user?.name || entry.name || 'Unknown'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                                  {entry.user?.email || entry.email || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)', fontWeight: 500 }}>
                                  {entry.user?.rollNumber || entry.rollNumber || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                                  {entry.hackerRankId || entry.user?.hackerRankId || entry.user?.hackerrankHandle || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={entry.score || 0}
                                  sx={{
                                    background: 'linear-gradient(135deg, #5B9FED 0%, #4A8FDC 100%)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => window.open(`https://www.hackerrank.com/${entry.hackerRankId || entry.user?.hackerRankId || entry.user?.hackerrankHandle}`, '_blank')}
                                  sx={{
                                    background: '#1a1a1a',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: '20px',
                                    px: 2,
                                    '&:hover': {
                                      background: '#2d3436',
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    },
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  View Profile
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Box sx={{ py: 6 }}>
                              <EmojiEventsIcon sx={{ fontSize: 48, color: 'rgba(0,0,0,0.2)', mb: 2 }} />
                              <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                                No leaderboard data available. Upload contest scores from the admin panel.
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {leaderboardData.length > leaderboardEntriesPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={leaderboardTotalPages}
                      page={leaderboardPage}
                      onChange={handleLeaderboardPageChange}
                      size="large"
                      showFirstButton
                      showLastButton
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontWeight: 600,
                          border: '2px solid rgba(91, 159, 237, 0.3)',
                          color: '#5B9FED',
                          '&:hover': {
                            background: 'rgba(91, 159, 237, 0.1)',
                            borderColor: 'rgba(91, 159, 237, 0.5)',
                          },
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #5B9FED 0%, #4A8FDC 100%)',
                            color: '#fff',
                            borderColor: 'transparent',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #4A8FDC 0%, #5B9FED 100%)',
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
    </Box>
  );
};

export default Contests;
