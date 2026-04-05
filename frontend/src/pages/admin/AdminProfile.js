import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import api from '../../api/axios';

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    email: '',
    role: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/admin-profile/profile');
      setProfile(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Error fetching profile');
      setMessageType('error');
    }
  };

  const handleEmailChange = (e) => {
    setProfile({ ...profile, email: e.target.value });
  };

  const handlePasswordChange = (field) => (e) => {
    setPasswordData({ ...passwordData, [field]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setMessage('');

    try {
      console.log('Updating email to:', profile.email);
      const response = await api.put('/admin-profile/profile', { 
        email: profile.email 
      });

      console.log('Email update response:', response.data);
      
      if (response.data.status === 'success') {
        setMessage('Email updated successfully!');
        setMessageType('success');
        // Refresh profile
        await fetchProfile();
      }
    } catch (error) {
      console.error('Email update error:', error);
      setMessage(error.response?.data?.message || 'Error updating email');
      setMessageType('error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setMessage('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long');
      setMessageType('error');
      setPasswordLoading(false);
      return;
    }

    try {
      console.log('Updating password...');
      const response = await api.put('/admin-profile/profile', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword,
      });

      console.log('Password update response:', response.data);

      if (response.data.status === 'success') {
        setMessage('Password updated successfully! Please login with your new password.');
        setMessageType('success');
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    } catch (error) {
      console.error('Password update error:', error);
      setMessage(error.response?.data?.message || 'Error updating password');
      setMessageType('error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 700,
          mb: 6,
          textAlign: 'center',
        }}
      >
        Admin Profile Settings
      </Typography>

      {message && (
        <Alert severity={messageType} sx={{ mb: 4 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon
                  sx={{
                    fontSize: 32,
                    color: 'primary.main',
                    mr: 2,
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Profile Information
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Role
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                  {profile.role}
                </Typography>
              </Box>

              <form onSubmit={handleEmailUpdate}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={profile.email}
                    onChange={handleEmailChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    required
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={emailLoading}
                  startIcon={emailLoading ? null : <SaveIcon />}
                  sx={{ py: 1.5 }}
                >
                  {emailLoading ? <CircularProgress size={24} /> : 'Update Email'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Change */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LockIcon
                  sx={{
                    fontSize: 32,
                    color: 'secondary.main',
                    mr: 2,
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Change Password
                </Typography>
              </Box>

              <form onSubmit={handlePasswordUpdate}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange('currentPassword')}
                    variant="outlined"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('current')}
                            edge="end"
                          >
                            {showPasswords.current ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange('newPassword')}
                    variant="outlined"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('new')}
                            edge="end"
                          >
                            {showPasswords.new ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange('confirmNewPassword')}
                    variant="outlined"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('confirm')}
                            edge="end"
                          >
                            {showPasswords.confirm ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={passwordLoading}
                  startIcon={passwordLoading ? null : <SaveIcon />}
                  sx={{ py: 1.5 }}
                >
                  {passwordLoading ? <CircularProgress size={24} /> : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          🔒 All password changes are securely encrypted using bcrypt
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminProfile;
