import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Stack,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, ApiError, apiFetch, formatApiErrorMessage } from '../lib/api';
import { LOGIN_FAILED_MESSAGE } from '../lib/loginMessages';
import {
  getPasswordHint,
  isRegisterPasswordValid,
} from '../lib/registerValidation';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const pwdValidation = {
    length: password.length >= 8,
    complexity: /[a-z]/.test(password) && /[A-Z]/.test(password) && (/[0-9]/.test(password) || /[!@#$%^&*]/.test(password)),
    noMatch: !password.toLowerCase().includes((displayName || ' ').toLowerCase()) && !password.toLowerCase().includes((email.split('@')[0] || ' ').toLowerCase())
  };

  const switchMode = () => {
    setIsLogin((v) => !v);
    setFormError(null);
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setFormError('Password is required');
      return;
    }

    if (!isLogin && !isSuccess) {
      if (!isRegisterPasswordValid(password)) {
        setFormError(getPasswordHint(password) ?? 'Password does not meet requirements');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isLogin || isSuccess) {
        const res = await apiFetch<{ access_token: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: trimmedEmail, password }),
          auth: false,
        });
        localStorage.setItem('access_token', res.access_token);
        navigate('/', { replace: true });
        return;
      }

      await apiFetch<{ id: string; email: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          ...(displayName.trim() ? { displayName: displayName.trim() } : {}),
        }),
        auth: false,
      });

      setIsSuccess(true);
      setToast({ open: true, message: 'Account successfully created!' });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setToast({ open: true, message: 'Email already in use' });
          setFormError('Email already in use');
        } else if (err.status === 401) {
          setFormError(LOGIN_FAILED_MESSAGE);
          if (isLogin || isSuccess) {
            setToast({ open: true, message: LOGIN_FAILED_MESSAGE });
          }
        } else {
          setFormError(formatApiErrorMessage(err.body));
        }
      } else {
        setFormError('Network error. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'white' }}>
      {/* Left Branding Side */}
      {isLg && (
        <Box sx={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(13, 127, 242, 0.1)', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBePysr3pIBnJ87By3tLv_WGOpqN6Us514Jk7BcHBVR1Lt_Teb2WWYjHKMJ1zINemGDC2fmbOFe25ori_OAhzU7R0NJg8QPLmSmFrXrB8t5GOM9WG0AFj7t14WI-a0u4okZmcKCybtSjwf9vgFNL6FPFx9KOpm0KsoUS1vvGRgDuNoTdQSb1xCHzLShvTw9CtIf5qDCCA88rpXo0obpuM--uqjpdCyOSEi3YJ2NvxZbyK_-rGg8oqqjBQNHSI5Nh53-FBCxN7ghYqk")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <Box sx={{ position: 'relative', zIndex: 10, p: 6, textAlign: 'center' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ mb: 4 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#0d7ff2', color: 'white', display: 'grid', placeItems: 'center' }}>
                <RocketLaunchIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h3" fontWeight={900} color="#0F172A">NavTask</Typography>
            </Stack>
            <Box sx={{ maxWidth: 440, mx: 'auto' }}>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>Start your journey today.</Typography>
              <Typography variant="body1" color="text.secondary">Join thousands of teams who manage their projects with precision and speed using NavTask.</Typography>
            </Box>
          </Box>
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, h: 128, backgroundImage: 'linear-gradient(to top, white, transparent)' }} />
        </Box>
      )}

      {/* Right Form Side */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: { xs: 3, md: 10, lg: 15 }, py: 6 }}>
        <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>
          {!isLg && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#0d7ff2', color: 'white', display: 'grid', placeItems: 'center' }}>
                <RocketLaunchIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={800}>NavTask</Typography>
            </Stack>
          )}

          <header style={{ marginBottom: '32px' }}>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#0F172A', mb: 1 }}>
              {isSuccess ? 'Account successfully created. Sign in to continue' : isLogin ? 'Welcome back' : 'Create an account'}
            </Typography>
            {!isSuccess && (
              <Typography variant="body2" color="text.secondary">
                {isLogin ? 'Enter your credentials to access your account.' : 'Join NavTask to streamline your workflow.'}
              </Typography>
            )}
          </header>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {formError ? (
                <Alert severity="error" onClose={() => setFormError(null)}>
                  {formError}
                </Alert>
              ) : null}

              {( !isLogin || isSuccess ) && (
                <Box>
                  <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.5, display: 'block' }}>{isSuccess ? 'Name' : 'User Name'}</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder={isSuccess ? '' : 'Enter your name'} 
                    value={isSuccess ? 'Jhon Doe_456' : displayName} 
                    onChange={e => setDisplayName(e.target.value)} 
                    error={formError === 'Email already in use'}
                    helperText={formError === 'Email already in use' ? 'Email already in use' : null}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                </Box>
              )}

              <Box>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.5, display: 'block' }}>Email</Typography>
                <TextField 
                  fullWidth 
                  size="small" 
                  placeholder="name@company.com" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                />
              </Box>

              <Box>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.5, display: 'block' }}>Password</Typography>
                <TextField 
                  fullWidth 
                  size="small" 
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                />
              </Box>

              {!isLogin && !isSuccess && (
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                  <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password Requirements</Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {pwdValidation.noMatch ? <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <Box sx={{ width: 16, display: 'grid', placeItems: 'center' }}><span style={{ fontSize: '10px' }}>•</span></Box>}
                      <Typography variant="caption" color={pwdValidation.noMatch ? '#10b981' : '#64748B'}>Cannot contain your name or email address</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {pwdValidation.length ? <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <Box sx={{ width: 16, display: 'grid', placeItems: 'center' }}><span style={{ fontSize: '10px' }}>•</span></Box>}
                      <Typography variant="caption" color={pwdValidation.length ? '#10b981' : '#64748B'}>At least 8 characters</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {pwdValidation.complexity ? <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <Box sx={{ width: 16, display: 'grid', placeItems: 'center' }}><span style={{ fontSize: '10px' }}>•</span></Box>}
                      <Typography variant="caption" color={pwdValidation.complexity ? '#10b981' : '#64748B'}>Contains a number or symbol</Typography>
                    </Stack>
                  </Stack>
                </Box>
              )}

              {isSuccess && (
                <Box sx={{ p: 2, borderRadius: 2 }}>
                   <Typography variant="caption" fontWeight={600} color="#0d7ff2" sx={{ display: 'block', mb: 1 }}>Password strength: Strong</Typography>
                   <Stack spacing={1}>
                      {[1,2,3].map(i => (
                        <Stack key={i} direction="row" spacing={1} alignItems="center">
                          <CheckIcon sx={{ fontSize: 16, color: '#0d7ff2' }} />
                          <Typography variant="caption" color="#64748B">Requirement {i} met</Typography>
                        </Stack>
                      ))}
                   </Stack>
                </Box>
              )}

              <Button 
                fullWidth 
                type="submit" 
                variant="contained" 
                disabled={submitting}
                sx={{ py: 1.5, borderRadius: 2, bgcolor: '#0d7ff2', fontWeight: 700, textTransform: 'none', boxShadow: '0 10px 15px -3px rgba(13, 127, 242, 0.2)' }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : isLogin || isSuccess ? 'Sign in' : 'Sign up'}
              </Button>

              <Box sx={{ position: 'relative', my: 1 }}>
                <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, h: '1px', bgcolor: '#e2e8f0' }} />
                <Typography variant="caption" sx={{ position: 'relative', bgcolor: 'white', px: 2, mx: 'auto', display: 'table', color: '#64748B', fontWeight: 600 }}>OR</Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" />}
                  onClick={() => window.location.href = `${API_BASE_URL}/auth/google`}
                  sx={{ borderRadius: 2, borderColor: '#e2e8f0', color: '#475569', fontWeight: 600, textTransform: 'none' }}
                >
                  Google
                </Button>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<Box sx={{ color: '#1877F2' }}><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></Box>}
                  onClick={() => window.location.href = `${API_BASE_URL}/auth/facebook`}
                  sx={{ borderRadius: 2, borderColor: '#e2e8f0', color: '#475569', fontWeight: 600, textTransform: 'none' }}
                >
                  Facebook
                </Button>
              </Stack>

              <Typography variant="body2" sx={{ textAlign: 'center', mt: 4, color: '#64748B' }}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <Typography component="span" variant="body2" fontWeight={700} color="#0d7ff2" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={switchMode}>
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Typography>
              </Typography>
            </Stack>
          </form>
        </Box>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        message={toast.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default LoginPage;
