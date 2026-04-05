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
  TextField,
  Pagination,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
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
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [finalConfirmationOpen, setFinalConfirmationOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
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

      setSuccess(`Leaderboard updated successfully! ${response.data.count} entries added.`);
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
      'name,email,rollNumber,hackerRankId,score,contestName',
      'John Doe,john@example.com,CS001,johndoe,100,HackerRank Contest',
      'Jane Smith,jane@example.com,IT002,janesmith,95,HackerRank Contest',
      'Bob Johnson,bob@example.com,ECE003,bobjohnson,88,CodeChef Contest',
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', 'leaderboard-template.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleResetLeaderboard = async () => {
    try {
      setResetLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      await axios.delete('/api/admin/leaderboard/reset', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('All leaderboard data has been successfully deleted!');
      setResetDialogOpen(false);
      setFinalConfirmationOpen(false);
      fetchLeaderboards();
      fetchSnapshots();
    } catch (err) {
      console.error('Error resetting leaderboard:', err);
      setError(err.response?.data?.message || 'Failed to reset leaderboard');
    } finally {
      setResetLoading(false);
    }
  };

  const openResetDialog = () => {
    setResetDialogOpen(true);
  };

  const openFinalConfirmation = () => {
    setResetDialogOpen(false);
    setFinalConfirmationOpen(true);
  };

  const cancelReset = () => {
    setResetDialogOpen(false);
    setFinalConfirmationOpen(false);
    setConfirmationText('');
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
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Roll Number</TableCell>
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
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>{entry.rollNumber || 'N/A'}</TableCell>
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
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Leaderboard Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Upload contest scores to update the leaderboard
        </Typography>
      </Box>

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
      <Card sx={{ mb: 6 }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Upload Leaderboard Data
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Upload a CSV file with contest scores to update the leaderboard.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ flex: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
              onClick={handleUpload}
              disabled={!uploadFile}
            >
              Upload
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
            <IconButton
              onClick={() => setInfoOpen(true)}
              title="CSV Format Info"
            >
              <InfoIcon />
            </IconButton>
            <Button
              variant="outlined"
              color="error"
              startIcon={<RefreshIcon />}
              onClick={openResetDialog}
              sx={{ ml: 2 }}
            >
              Reset All Data
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<WarningIcon />}
              onClick={() => setPastChampionsDialogOpen(true)}
              sx={{ ml: 2 }}
            >
              Reset Past Champions ({snapshots.length})
            </Button>
          </Box>

          {uploadFile && (
            <Typography variant="caption" color="success.main">
              ✓ File selected: {uploadFile.name}
            </Typography>
          )}
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
            <Typography variant="body2" component="div" sx={{ mb: 2, fontFamily: 'monospace', backgroundColor: '#f5f5f5', p: 1 }}>
              name, email, rollNumber, score, contestName
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Example:
            </Typography>
            <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', p: 1, whiteSpace: 'pre-wrap' }}>
{`name,email,rollNumber,score,contestName
John Doe,john@example.com,CS001,100,HackerRank
Jane Smith,jane@example.com,IT002,95,CodeChef`}
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
              Notes:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>All columns are required</li>
              <li>Score should be a number</li>
              <li>Email must be valid</li>
              <li>First row should be headers</li>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* First Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onClose={cancelReset} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
          <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
          Reset Leaderboard Data
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to reset all leaderboard data? This action will:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 2 }}>
              <li>Delete all leaderboard entries</li>
              <li>This action cannot be undone</li>
            </Typography>
            <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
              ⚠️ This is a destructive action that will permanently remove all leaderboard data.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelReset} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={openFinalConfirmation} 
            color="error" 
            variant="contained"
            startIcon={<WarningIcon />}
          >
            I Understand, Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog open={finalConfirmationOpen} onClose={cancelReset} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
          <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
          Final Confirmation
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" color="error.main" sx={{ mb: 2, fontWeight: 700 }}>
              THIS IS YOUR LAST CHANCE TO CANCEL
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are about to permanently delete ALL leaderboard data including:
            </Typography>
            <Box sx={{ backgroundColor: '#ffebee', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Total entries to be deleted:
              </Typography>
              <Typography variant="body2">
                • All-Time: {allTimeLeaderboard.length} entries
              </Typography>
            </Box>
            <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
              Type "RESET" in the confirmation box below to proceed:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type RESET to confirm"
              sx={{ mt: 2 }}
              size="small"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelReset} color="primary">
            Cancel (Keep Data)
          </Button>
          <Button 
            onClick={handleResetLeaderboard} 
            color="error" 
            variant="contained"
            disabled={resetLoading || confirmationText !== 'RESET'}
            startIcon={resetLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
          >
            {resetLoading ? 'Deleting...' : 'DELETE ALL DATA'}
          </Button>
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
  );
};

export default LeaderboardManagement;
