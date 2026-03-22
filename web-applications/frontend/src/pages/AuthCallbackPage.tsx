import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('access_token', token);
      const redirect = params.get('redirect') || '/';
      // Small delay to ensure storage is updated before redirect
      setTimeout(() => {
        navigate(redirect, { replace: true });
      }, 100);
    } else {
      console.error('No token found in callback URL');
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={64} thickness={4} />
      <Typography variant="h6" fontWeight={600}>
        Authenticating...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we finalize your sign-in.
      </Typography>
    </Box>
  );
};

export default AuthCallbackPage;
