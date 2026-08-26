import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Container, Typography, Grid, Link, Divider } from '@mui/material';
import {
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const isTeamPage = location.pathname === '/team';
  const isHomePage = location.pathname === '/';

  const navigationLinks = [
    { text: 'Home', path: '/' },
    { text: 'Events', path: '/events' },
    { text: 'Contests', path: '/contests' },
    { text: 'Gallery', path: '/gallery' },
    { text: 'Blog', path: '/blog' },
    { text: 'Team', path: '/team' },
  ];

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      component="footer"
      className="app-footer"
      sx={{
        backgroundColor: '#202124',
        color: 'white',
        py: 6,
        mt: (isTeamPage || isHomePage) ? 0 : 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              GDG College Club
            </Typography>
            <Typography variant="body2" sx={{ color: '#9aa0a6', mb: 2 }}>
              Building a community of passionate developers and tech enthusiasts.
            </Typography>
            <Box className="footer-social-icons" sx={{ display: 'flex', gap: 2, ml: -1 }}>
              <Link
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon footer-linkedin"
                aria-label="LinkedIn"
                title="Connect on LinkedIn"
              >
                <LinkedInIcon sx={{ fontSize: 24 }} />
              </Link>
              <Link
                href="mailto:contact@gdg.com"
                className="footer-social-icon footer-email"
                aria-label="Email"
                title="Send us an email"
              >
                <EmailIcon sx={{ fontSize: 24 }} />
              </Link>
              <Link
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon footer-instagram"
                aria-label="Instagram"
                title="Follow us on Instagram"
              >
                <InstagramIcon sx={{ fontSize: 24 }} />
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={8}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, pl: 3 }}>
              Quick Links
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
              gap: 1.5,
              pl: 3
            }}>
              {navigationLinks.map((link) => (
                <Link
                  key={link.text}
                  component={RouterLink}
                  to={link.path}
                  onClick={handleLinkClick}
                  sx={{
                    color: '#9aa0a6',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: 'white',
                    },
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ backgroundColor: '#5f6368', my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#9aa0a6' }}>
            © {currentYear} GDG College Club. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ color: '#9aa0a6' }}>
            Website developed by{' '}
            <a
              href="https://www.linkedin.com/in/sahith-guttikonda-3b89402a3?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="developer-link"
            >
              Sahith Guttikonda
            </a>{' '}
            and{' '}
            <a
              href="https://www.linkedin.com/in/syed-asadullah-4101652a4?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="developer-link"
            >
              Syed Asad
            </a>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
