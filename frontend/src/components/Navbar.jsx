function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-mark">B</span>
        <span>BillBuddy</span>
      </div>

      <div className="navbar-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#about">About</a>
      </div>

      <div className="navbar-actions">
        <button className="btn btn-ghost">Login</button>
        <button className="btn btn-primary">Get Started</button>
      </div>
    </nav>
  );
}

export default Navbar;