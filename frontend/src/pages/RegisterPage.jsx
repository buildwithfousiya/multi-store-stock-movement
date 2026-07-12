import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = ({ onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${apiBaseUrl}/api/auth/register`, { name, email, password});
      const { user: userData, token } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      onRegisterSuccess(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.toString() || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>StockFlow</h1>
          <p>Multi-Store Stock Management</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Create Account</h2>

          {error && <div className="alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>



          <button type="submit" className="btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
