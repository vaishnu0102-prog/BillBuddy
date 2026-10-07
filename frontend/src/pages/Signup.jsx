import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    // Check passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5001/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed.');
        return;
      }

      alert('Account created successfully! 🎉');

      navigate('/login');

    } catch (error) {
      console.error('Signup error:', error);
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* Brand */}
        <Link to="/" className="auth-brand">
          <span className="brand-icon">B</span>
          <span>BillBuddy</span>
        </Link>

        {/* Heading */}
        <div className="auth-heading">
          <h1>Create your account ✨</h1>
          <p>Start managing your shared expenses today.</p>
        </div>

        {/* Signup Form */}
        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              type="text"
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">
              Email
            </label>

            <input
              type="email"
              id="signup-email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">
              Password
            </label>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="signup-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">
              Confirm Password
            </label>

            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
              >
                {showConfirmPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>

        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Google */}
        <button
  type="button"
  className="google-btn"
  onClick={() => {
    window.location.href = "http://localhost:5001/api/auth/google";
  }}
>
  <span className="google-icon">G</span>
  Continue with Google
</button>

        {/* Login */}
        <p className="auth-switch">
          Already have an account?
          <Link to="/login"> Log in</Link>
        </p>

      </div>

    </div>
  );
}

export default Signup;