import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ===============================
  // Handle Google Login Callback
  // ===============================

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const googleStatus = params.get('google');
    const token = params.get('token');

    // Google login successful
    if (googleStatus === 'success' && token) {
      try {
        // Store JWT
        localStorage.setItem('token', token);

        // Remove token from URL
        window.history.replaceState(
          {},
          document.title,
          '/login'
        );

        // Redirect to dashboard
        navigate('/dashboard', { replace: true });

      } catch (error) {
        console.error('Google login error:', error);
        setError('Google login failed');
      }
    }

    // Google login failed
    if (googleStatus === 'error') {
      setError('Google login failed. Please try again.');

      // Remove error from URL
      window.history.replaceState(
        {},
        document.title,
        '/login'
      );
    }
  }, [navigate]);


  // ===============================
  // Login Handler
  // ===============================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5001/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      console.log('Login successful:', data);

      // Store JWT
      localStorage.setItem('token', data.token);

      // Store user information
      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      setError('Unable to connect to the server');

    } finally {
      setLoading(false);
    }
  };


  // ===============================
  // Component UI
  // ===============================

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
          <h1>Welcome back 👋</h1>

          <p>
            Log in to manage your shared expenses.
          </p>
        </div>


        {/* Login Form */}
        <form
          className="auth-form"
          onSubmit={handleLogin}
        >

          {/* Email */}
          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>


          {/* Password */}
          <div className="form-group">

            <div className="password-label">

              <label htmlFor="password">
                Password
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>

            </div>


            <div className="password-input-wrapper">

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />


              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
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


          {/* Error Message */}
          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}


          {/* Login Button */}
          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Logging in...'
              : 'Log In →'}
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
            window.location.href =
              'http://localhost:5001/api/auth/google';
          }}
        >
          <span className="google-icon">
            G
          </span>

          Continue with Google
        </button>


        {/* Signup */}
        <p className="auth-switch">

          Don't have an account?

          <Link to="/signup">
            {' '}Sign up
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;