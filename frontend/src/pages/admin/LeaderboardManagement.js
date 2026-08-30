import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Pagination,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import axios from 'axios';

const LeaderboardManagement = () => {
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const entriesPerPage = 10;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [pastChampionsDialogOpen, setPastChampionsDialogOpen] = useState(false);
  const [pastChampionsResetLoading, setPastChampionsResetLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboards();
    fetchSnapshots();
  }, []);

  const fetchSnapshots = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/leaderboard/snapshots', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnapshots(response.data.snapshots || []);
    } catch (err) {
      console.error('Error fetching snapshots:', err);
    }
  };

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const allTime = await axios.get('/api/leaderboard/all-time', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllTimeLeaderboard(allTime.data.leaderboard || []);
    } catch (err) {
      console.error('Error fetching leaderboards:', err);
      setError('Failed to fetch leaderboards');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Calculate pagination
  const totalPages = Math.ceil(allTimeLeaderboard.length / entriesPerPage);
  const startIndex = (page - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedData = allTimeLeaderboard.slice(startIndex, endIndex);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setError('Please select a file');
      return;
    }

    try {
      setError('');
      setSuccess('');
      const formData = new FormData();
      formData.append('file', uploadFile);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/leaderboard/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(`Leaderboard updated successfully! ${response.data.count} entries processed.`);
      setUploadFile(null);
      fetchLeaderboards();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.message || 'Failed to upload file');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/leaderboard/${entryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Entry deleted successfully!');
        fetchLeaderboards();
      } catch (err) {
        setError('Failed to delete entry');
      }
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = [
      'name,hackerRankId,score,contestName',
      'John Doe,johndoe,100,GDG CodeFest 2026',
      'Jane Smith,janesmith,95,GDG CodeFest 2026',
      'Bob Johnson,bobjohnson,88,Weekly HackerRank Challenge',
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', 'leaderboard-template.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleResetPastChampions = async () => {
    try {
      setPastChampionsResetLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      const response = await axios.delete('/api/admin/leaderboard/snapshots/reset', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(`Past champions data has been successfully deleted! ${response.data.deletedCount} snapshots removed.`);
      setPastChampionsDialogOpen(false);
      setSnapshots([]);
    } catch (err) {
      console.error('Error resetting past champions:', err);
      setError(err.response?.data?.message || 'Failed to reset past champions');
    } finally {
      setPastChampionsResetLoading(false);
    }
  };

  const LeaderboardTable = ({ data, startIndex: startIdx, totalPages: totalPagesProp, currentPage, onPageChange, totalEntries, entriesPerPage: entriesPerPageProp }) => (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contest Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>HackerRank ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Score
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((entry, index) => {
                const actualRank = startIdx + index + 1;
                return (
                  <TableRow key={entry._id} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {actualRank}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{entry.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={entry.contestName || 'Contest'}
                        size="small"
                        sx={{
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>{entry.hackerRankId || 'N/A'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {entry.score}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteEntry(entry._id)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">No entries yet</Typography>
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Header Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #4A8BC2 0%, #2E75B0 100%)',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(46, 117, 176, 0.3)',
          }}
        >
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            Leaderboard Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Upload contest scores and manage student leaderboards
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Upload Section */}
        <Card sx={{ mb: 6, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Upload Leaderboard Data
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Upload a CSV file with contest scores to update the leaderboard.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                color="primary"
                startIcon={<UploadIcon />}
                sx={{
                  borderRadius: '30px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderWidth: '2px',
                  '&:hover': { borderWidth: '2px' },
                }}
              >
                Choose CSV File
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>

              {uploadFile ? (
                <Chip
                  label={`📄 ${uploadFile.name}`}
                  onDelete={() => setUploadFile(null)}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600, py: 1 }}
                />
              ) : (
                <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  No file chosen
                </Typography>
              )}

              <Button
                variant="contained"
                color="primary"
                startIcon={<UploadIcon />}
                onClick={handleUpload}
                disabled={!uploadFile}
                sx={{
                  borderRadius: '30px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Upload Data
              </Button>

              <Button
                variant="outlined"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
                sx={{
                  borderRadius: '30px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Download Template
              </Button>

              <IconButton
                onClick={() => setInfoOpen(true)}
                title="CSV Format Info"
                color="primary"
              >
                <InfoIcon />
              </IconButton>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<WarningIcon />}
                onClick={() => setPastChampionsDialogOpen(true)}
                sx={{
                  borderRadius: '30px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  ml: 'auto',
                }}
              >
                Reset Past Champions ({snapshots.length})
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Leaderboard Table */}
        <LeaderboardTable 
          data={paginatedData} 
          startIndex={startIndex}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={handlePageChange}
          totalEntries={allTimeLeaderboard.length}
          entriesPerPage={entriesPerPage}
        />

        {/* CSV Format Info Dialog */}
        <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>CSV File Format</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Required Columns:
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 2, fontFamily: 'monospace', backgroundColor: '#f5f5f5', p: 1.5, borderRadius: 1 }}>
                name, hackerRankId, score, contestName
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Example CSV Content:
              </Typography>
              <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', p: 1.5, borderRadius: 1, whiteSpace: 'pre-wrap' }}>
{`name,hackerRankId,score,contestName
John Doe,johndoe,100,GDG CodeFest 2026
Jane Smith,janesmith,95,GDG CodeFest 2026
Bob Johnson,bobjohnson,88,Weekly HackerRank Challenge`}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                Notes:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li>Name, HackerRank ID, and Score are required</li>
                <li>Contest Name is optional (defaults to "Contest")</li>
                <li>Score must be a positive number</li>
                <li>First row should contain the headers</li>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInfoOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Past Champions Reset Dialog */}
        <Dialog open={pastChampionsDialogOpen} onClose={() => setPastChampionsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', color: 'secondary.main' }}>
            <WarningIcon sx={{ mr: 1, color: 'secondary.main' }} />
            Reset Past Champions
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to reset all past champions data? This action will:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 2 }}>
                <li>Delete all past champion snapshots</li>
                <li>Remove all historical winner data</li>
                <li>This action cannot be undone</li>
              </Typography>
              <Box sx={{ backgroundColor: '#fff3e0', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Total snapshots to be deleted: {snapshots.length}
                </Typography>
              </Box>
              <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 600 }}>
                ⚠️ This will permanently remove all past champions data from the Hall of Fame.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPastChampionsDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={handleResetPastChampions} 
              color="secondary" 
              variant="contained"
              disabled={pastChampionsResetLoading || snapshots.length === 0}
              startIcon={pastChampionsResetLoading ? <CircularProgress size={16} /> : <WarningIcon />}
            >
              {pastChampionsResetLoading ? 'Deleting...' : 'Reset Past Champions'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default LeaderboardManagement;
