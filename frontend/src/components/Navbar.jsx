import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">

      {/* Logo */}
      <Link to="/" className="navbar-logo">
        <span className="logo-mark">B</span>
        <span>BillBuddy</span>
      </Link>


      {/* Navigation */}
      <div className="navbar-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#about">About</a>
      </div>


      {/* Actions */}
      <div className="navbar-actions">

        <Link to="/login" className="navbar-login">

          {/* Login icon */}
          <svg
  width="17"
  height="17"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <circle
    cx="12"
    cy="8"
    r="4"
    stroke="currentColor"
    strokeWidth="2"
  />

  <path
    d="M4.5 21C5.5 17.5 8 16 12 16C16 16 18.5 17.5 19.5 21"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  />
</svg>

          <span>Login</span>

        </Link>

      </div>

    </nav>
  );
}

export default Navbar;