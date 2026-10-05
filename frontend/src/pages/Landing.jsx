import Navbar from '../components/Navbar';

function Landing() {
  return (
    <div className="landing-page">
      <Navbar />

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              ✦ Smart expense management
            </div>

            <h1>
              Split expenses.
              <br />
              <span>Without the headache.</span>
            </h1>

            <p className="hero-description">
              BillBuddy makes shared expenses simple.
              Create groups, split bills, track balances,
              and settle up without complicated calculations.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary btn-large">
                Get Started →
              </button>

              <button className="btn btn-outline btn-large">
                See How It Works
              </button>
            </div>

            <div className="hero-trust">
              <span>✓ Easy bill splitting</span>
              <span>✓ Real-time balances</span>
              <span>✓ Simple settlements</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <span>Good evening 👋</span>
                <span className="preview-avatar">V</span>
              </div>

              <div className="balance-card">
                <span>Total balance</span>
                <strong>₹2,450</strong>
                <small>↑ 12.5% this month</small>
              </div>

              <div className="preview-grid">
                <div className="preview-card">
                  <span>You owe</span>
                  <strong>₹640</strong>
                </div>

                <div className="preview-card">
                  <span>You're owed</span>
                  <strong>₹3,090</strong>
                </div>
              </div>

              <div className="activity-card">
                <span>Recent activity</span>

                <div className="activity-row">
                  <div className="activity-icon">🍕</div>
                  <div>
                    <strong>Dinner</strong>
                    <small>Flatmates</small>
                  </div>
                  <b>₹1,200</b>
                </div>

                <div className="activity-row">
                  <div className="activity-icon">🚕</div>
                  <div>
                    <strong>Uber</strong>
                    <small>Friends</small>
                  </div>
                  <b>₹430</b>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Landing;