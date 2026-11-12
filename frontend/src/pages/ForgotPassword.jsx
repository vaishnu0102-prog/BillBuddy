
import { Link } from 'react-router-dom';
import { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5001/api/auth/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Something went wrong.');
        return;
      }

      setSuccess(data.message);

    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <Link to="/" className="auth-brand">
          <span className="brand-icon">B</span>
          <span>BillBuddy</span>
        </Link>

        <div className="auth-heading">
          <h1>Forgot Password? 🔐</h1>
          <p>
            No worries! Enter your registered email
            and we'll send you a reset link.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label htmlFor="forgot-email">
              Email Address
            </label>

            <input
              type="email"
              id="forgot-email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          {success && (
            <p className="auth-success" role="status">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Sending...'
              : 'Send Reset Link →'}
          </button>

        </form>

        <p className="auth-switch">
          Remember your password?
          <Link to="/login"> Back to Login</Link>
        </p>

      </div>

    </div>
  );
}

export default ForgotPassword;
