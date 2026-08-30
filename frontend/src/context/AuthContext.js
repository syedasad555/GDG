import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.user) {
          if (response.data.user.role !== 'admin') {
            localStorage.removeItem('token');
            setUser(null);
          } else {
            setUser(response.data.user);
          }
        }
      } catch (err) {
        console.error('Auth check failed', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      setError('');
      const response = await axios.post('/api/auth/login', { email, password });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.data.user);
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await axios.get('/api/auth/logout', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put(
        '/api/users/profile',
        userData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (err) {
      console.error('Update profile error', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Update failed' 
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        error,
        login,
        logout,
        updateProfile,
        setError
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/gdg-auth-7m2p', { state: { from: location.pathname } });
      } else if (!isAdmin) {
        navigate('/');
      }
    }
  }, [isAuthenticated, isAdmin, loading, navigate, location]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && isAdmin ? children : null;
};
