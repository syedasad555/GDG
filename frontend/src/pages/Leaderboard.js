import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Pagination,
  useTheme,
} from '@mui/material';
import { EmojiEvents as EmojiEventsIcon } from '@mui/icons-material';
import * as leaderboardApi from '../api/leaderboard';

const Leaderboard = () => {
  const theme = useTheme();
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const entriesPerPage = 10;

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const allTime = await leaderboardApi.getAllTimeLeaderboard();
        setAllTimeLeaderboard(allTime.data.leaderboard || allTime.data.data || []);
      } catch (err) {
        console.error('Error fetching leaderboards:', err);
        console.error('Error details:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Calculate pagination
  const totalPages = Math.ceil(allTimeLeaderboard.length / entriesPerPage);
  const startIndex = (page - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedData = allTimeLeaderboard.slice(startIndex, endIndex);

  const LeaderboardTable = ({ data, startIndex: startIdx, totalPages: totalPagesProp, currentPage, onPageChange, totalEntries, entriesPerPage: entriesPerPageProp }) => {
    return (
      <>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    width: '60px',
                  }}
                >
                  Rank
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>
                  User
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                  }}
                >
                  HackerRank ID
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                  }}
                >
                  Score
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                  }}
                >
                  Contests
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((entry, index) => {
                  const actualRank = startIdx + index + 1;
                  return (
                    <TableRow
                      key={entry._id || index}
                      sx={{
                        backgroundColor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                        '&:hover': {
                          backgroundColor: 'action.selected',
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, width: '60px' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor:
                              actualRank === 1
                                ? '#FFD700'
                                : actualRank === 2
                                  ? '#C0C0C0'
                                  : actualRank === 3
                                    ? '#CD7F32'
                                    : theme.palette.grey[200],
                            color: actualRank <= 3 ? 'white' : 'text.primary',
                          }}
                        >
                          {entry.rank || actualRank}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            alt={entry.user?.name}
                            src={entry.user?.profilePhoto}
                            sx={{ width: 40, height: 40 }}
                          >
                            {entry.user?.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {entry.user?.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {entry.user?.rollNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="textSecondary">
                          {entry.hackerRankId || entry.user?.hackerrankHandle || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.primary.main,
                          }}
                        >
                          {entry.score}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={entry.contestsParticipated || 0}
                          size="small"
                          sx={{
                            backgroundColor: `${theme.palette.primary.main}15`,
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No data available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {totalEntries > entriesPerPageProp && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPagesProp}
              page={currentPage}
              onChange={onPageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <EmojiEventsIcon
            sx={{
              fontSize: 48,
              color: theme.palette.primary.main,
            }}
          />
        </Box>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 2,
          }}
        >
          Leaderboard
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ maxWidth: '700px', mx: 'auto' }}
        >
          Compete with your peers and climb the rankings. Check out the top performers in our coding contests.
        </Typography>
      </Box>

      <Box sx={{ width: '100%' }}>
        <LeaderboardTable 
          data={paginatedData} 
          startIndex={startIndex}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={handlePageChange}
          totalEntries={allTimeLeaderboard.length}
          entriesPerPage={entriesPerPage}
        />
      </Box>
    </Container>
  );
};

export default Leaderboard;
