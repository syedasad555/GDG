import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import GDGAnimatedLogo from '../components/GDGAnimatedLogo';
import './LoginSignup.css';

const LoginSignup = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    showPassword: false,
  });

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const result = await login(loginData.email, loginData.password);
      if (result.success) {
        const dest = from && String(from).startsWith('/gdg-cms-9x4k') ? from : '/gdg-cms-9x4k';
        navigate(dest, { replace: true });
      } else {
        setLoginError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setLoginError('An error occurred. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="login-signup-page admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <GDGAnimatedLogo staticLogo />
        </div>
        <h1>Admin sign in</h1>
        <p className="admin-login-subtitle">Google Developer Group — dashboard access only</p>

        {loginError && <div className="error-message">{loginError}</div>}

        <form onSubmit={handleLoginSubmit} className="admin-login-form">
          <div className="input-wrapper">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
              autoComplete="username"
            />
          </div>
          <div className="input-wrapper">
            <input
              type={loginData.showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
              autoComplete="current-password"
            />
            <span
              className="password-toggle"
              onClick={() => setLoginData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLoginData(prev => ({ ...prev, showPassword: !prev.showPassword }));
                }
              }}
            >
              {loginData.showPassword ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>
          <button type="submit" disabled={loginLoading} className="admin-login-submit">
            <span>{loginLoading ? 'Signing in...' : 'Sign in'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginSignup;
