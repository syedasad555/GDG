import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

import { AuthProvider, AdminRoute } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Team from './pages/Team';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Contests from './pages/Contests';
import Gallery from './pages/Gallery';
import GalleryDetail from './pages/GalleryDetail';
import Leaderboard from './pages/Leaderboard';
import LoginSignup from './pages/LoginSignup';
import AdminDashboard from './pages/admin/Dashboard';
import AdminEvents from './pages/admin/Events';
import AdminBlogs from './pages/admin/Blogs';
import AdminContests from './pages/admin/Contests';
import TeamManagement from './pages/admin/TeamManagement';
import AdminGallery from './pages/admin/Gallery';
import AdminProfile from './pages/admin/AdminProfile';
import EventRegistrations from './pages/admin/EventRegistrations';
import LeaderboardManagement from './pages/admin/LeaderboardManagement';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4285F4',
    },
    secondary: {
      main: '#0F9D58',
    },
    error: {
      main: '#DB4437',
    },
    warning: {
      main: '#F4B400',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 500 },
    h2: { fontWeight: 500 },
    h3: { fontWeight: 500 },
  },
});

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/gdg-auth-7m2p';
  
  return (
    <div className="app">
      <ScrollToTop />
      {!isAuthPage && <Navbar />}
      <main className={`main-content ${isAuthPage ? 'auth-page' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:id" element={<GalleryDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/gdg-auth-7m2p" element={<LoginSignup />} />
          {/* Old /login and /signup paths → 404 (not redirected, to prevent discovery) */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          
          {/* Admin Routes — obfuscated paths */}
          <Route path="/gdg-cms-9x4k" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/gdg-cms-9x4k/events" element={<AdminRoute><AdminEvents /></AdminRoute>} />
          <Route path="/gdg-cms-9x4k/events/:eventId/registrations" element={<AdminRoute><EventRegistrations /></AdminRoute>} />
          <Route path="/gdg-cms-9x4k/blogs" element={<AdminRoute><AdminBlogs /></AdminRoute>} />
          <Route path="/gdg-cms-9x4k/contests" element={<AdminRoute><AdminContests /></AdminRoute>} />
          <Route path="/gdg-cms-9x4k/gallery" element={<AdminRoute><AdminGallery /></AdminRoute>} />
          <Route path="/gdg-cms-9x4k/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
          <Route path="/gdg-cms-9x4k/members" element={<Navigate to="/gdg-cms-9x4k/team" replace />} />
          <Route path="/gdg-cms-9x4k/team" element={<AdminRoute><TeamManagement /></AdminRoute>} />
          <Route path="/gdg-cms-9x4k/leaderboard" element={<AdminRoute><LeaderboardManagement /></AdminRoute>} />
          {/* Old /admin paths → redirect to home to prevent discovery */}
          <Route path="/admin/*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
