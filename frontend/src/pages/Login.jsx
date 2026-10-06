import { Link } from 'react-router-dom';
import { useState } from 'react';

function Login() {
  const [showPassword, setShowPassword] = useState(false);

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
          <p>Log in to manage your shared expenses.</p>
        </div>

        {/* Login Form */}
        <form className="auth-form">

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <div className="password-label">
              <label htmlFor="password">Password</label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </div>
           </div> 

            <div className="password-input-wrapper">


            <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Enter your password"
            />

            <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
           >
            {showPassword ? '🙈' : '👁'}
            </button>

          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
          >
            Log In →
          </button>

        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Google */}
        <button className="google-btn">
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        {/* Signup */}
        <p className="auth-switch">
          Don't have an account?
          <Link to="/signup"> Sign up</Link>
        </p>

      </div>

    </div>
  );
}

export default Login;