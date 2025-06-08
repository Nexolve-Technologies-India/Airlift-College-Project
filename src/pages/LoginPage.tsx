// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from '../api/authService';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await authenticateUser(credentials.email, credentials.password);
      localStorage.setItem('authToken', user.token);
      localStorage.setItem('userEmail', user.email);
      navigate('/recommendations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Properly typed styles
  const styles = {
    navbar: {
      backgroundColor: '#004080',
      padding: '14px 20px',
      display: 'flex',
      justifyContent: 'left',
      gap: '20px',
    } as React.CSSProperties,
    navLink: {
      color: 'white',
      textDecoration: 'none',
      padding: '12px 16px',
      fontSize: '17px',
    } as React.CSSProperties,
    loginContainer: {
      width: '100%',
      maxWidth: '400px',
      margin: '50px auto',
      padding: '30px',
      backgroundColor: 'white',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      borderRadius: '8px',
    } as React.CSSProperties,
    header: {
      textAlign: 'center' as const,
      color: '#004080',
      marginBottom: '24px',
    } as React.CSSProperties,
    formGroup: {
      marginBottom: '20px',
    } as React.CSSProperties,
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#333',
    } as React.CSSProperties,
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#004080',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    } as React.CSSProperties,
    error: {
      color: '#d32f2f',
      backgroundColor: '#fde8e8',
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '20px',
      textAlign: 'center' as const,
    } as React.CSSProperties
  };

  return (
    <div>
      <nav style={styles.navbar}>
        <a href="/" style={styles.navLink}>Home</a>
        <a href="/flights" style={styles.navLink}>Flights</a>
        <a href="/login" style={styles.navLink}>Login</a>
        <a href="/contact" style={styles.navLink}>Contact</a>
      </nav>

      <div style={styles.loginContainer}>
        <h2 style={styles.header}>Login to Your Account</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;