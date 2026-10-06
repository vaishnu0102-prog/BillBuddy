import { Link } from 'react-router-dom';
import { useState } from 'react';

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
        <form className="auth-form">

          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              type="text"
              id="name"
              placeholder="Your name"
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


          <button
            type="submit"
            className="btn btn-primary auth-submit"
          >
            Create Account →
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