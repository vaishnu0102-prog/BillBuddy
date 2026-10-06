import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="landing-page">
      <Navbar />

      <main>

        {/* ================================
            HERO SECTION
        ================================= */}

        <section className="hero">

          <div className="hero-content">

            <p className="hero-badge">
             ✦ Smart expense management
            </p>

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
              <Link to="/signup" className="btn btn-primary btn-large">
                Get Started →
              </Link>

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


          {/* Dashboard Preview */}

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

                  <div className="activity-icon">
                    🍕
                  </div>

                  <div>
                    <strong>Dinner</strong>
                    <small>Flatmates</small>
                  </div>

                  <b>₹1,200</b>

                </div>


                <div className="activity-row">

                  <div className="activity-icon">
                    🚕
                  </div>

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


        {/* ================================
            FEATURES SECTION
        ================================= */}

        <section
          className="features-section"
          id="features"
        >

          <div className="section-heading">

            <p className="section-label">
              WHY BILLBUDDY
            </p>

            <h2>
              Everything you need to
              <span> split smarter.</span>
            </h2>

            <p>
              No more spreadsheets, mental calculations,
              or awkward "who owes whom?" conversations.
            </p>

          </div>


          <div className="features-grid">

            {/* Smart Splitting */}

            <div className="feature-card feature-card-large">

              <div className="feature-icon">
                ⚡
              </div>

              <h3>
                Smart Bill Splitting
              </h3>

              <p>
                Split expenses equally, by exact amounts,
                or by percentage. BillBuddy handles the math.
              </p>


              <div className="feature-mini-ui">

                <div>
                  <span>Dinner</span>
                  <strong>₹1,200</strong>
                </div>

                <div className="mini-split">
                  <span>4 people</span>
                  <strong>₹300 each</strong>
                </div>

              </div>

            </div>


            {/* Groups */}

            <div className="feature-card">

              <div className="feature-icon">
                👥
              </div>

              <h3>
                Groups Made Easy
              </h3>

              <p>
                Create groups for roommates, trips,
                friends, college or any shared expense.
              </p>

            </div>


            {/* Balances */}

            <div className="feature-card">

              <div className="feature-icon">
                📊
              </div>

              <h3>
                Clear Balances
              </h3>

              <p>
                Always know who owes you and who
                you owe — without doing the math yourself.
              </p>

            </div>


            {/* Settlements */}

            <div className="feature-card">

              <div className="feature-icon">
                🤝
              </div>

              <h3>
                Easy Settlements
              </h3>

              <p>
                Keep track of pending payments and
                settle shared expenses with confidence.
              </p>

            </div>


            {/* Notifications */}

            <div className="feature-card">

              <div className="feature-icon">
                🔔
              </div>

              <h3>
                Stay Updated
              </h3>

              <p>
                Get useful notifications when expenses
                are added, balances change, or settlements happen.
              </p>

            </div>

          </div>

        </section>


        {/* ================================
            HOW IT WORKS SECTION
        ================================= */}

        <section
          className="how-section"
          id="how-it-works"
        >

          <div className="section-heading">

            <p className="section-label">
              HOW IT WORKS
            </p>

            <h2>
              From expense to settlement
              <span> in seconds.</span>
            </h2>

            <p>
              BillBuddy keeps the entire process simple.
            </p>

          </div>


          <div className="steps">

            {/* Step 01 */}

            <div className="step">

              <div className="step-number">
                01
              </div>

              <div>

                <h3>
                  Create a group
                </h3>

                <p>
                  Create a group and invite the people
                  you're sharing expenses with.
                </p>

              </div>

            </div>


            {/* Step 02 */}

            <div className="step">

              <div className="step-number">
                02
              </div>

              <div>

                <h3>
                  Add an expense
                </h3>

                <p>
                  Enter what you spent, who paid,
                  and choose how the bill should be split.
                </p>

              </div>

            </div>


            {/* Step 03 */}

            <div className="step">

              <div className="step-number">
                03
              </div>

              <div>

                <h3>
                  Track the balance
                </h3>

                <p>
                  BillBuddy automatically calculates
                  everyone's balance.
                </p>

              </div>

            </div>


            {/* Step 04 */}

            <div className="step">

              <div className="step-number">
                04
              </div>

              <div>

                <h3>
                  Settle up
                </h3>

                <p>
                  See exactly who needs to pay whom
                  and settle your shared expenses.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================================
    FINAL CTA
================================ */}

<section className="cta-section">

  <div className="cta-card">

    <div className="cta-content">

      <p className="section-label">
        READY TO GET STARTED?
      </p>

      <h2>
        Stop calculating.
        <br />
        <span>Start splitting.</span>
      </h2>

      <p>
        Bring all your shared expenses together
        and make splitting bills ridiculously simple.
      </p>

      <button className="btn cta-button">
        Create Your Free Account →
      </button>

    </div>

  </div>

</section>


{/* ================================
    FOOTER
================================ */}

<footer className="footer" id="about">

  <div className="footer-content">

    <div className="footer-brand">

      <div className="navbar-logo">

        <span className="logo-mark">
          B
        </span>

        <span>
          BillBuddy
        </span>

      </div>

      <p>
        Shared expenses,
        simplified.
      </p>

    </div>


    <div className="footer-links">

      <div>

        <h4>Product</h4>

        <a href="#features">
          Features
        </a>

        <a href="#how-it-works">
          How It Works
        </a>

      </div>


      <div>

        <h4>Company</h4>

        <a href="#about">
          About
        </a>

        <a href="#">
          Contact
        </a>

      </div>


      <div>

        <h4>Account</h4>

        <a href="#">
          Login
        </a>

        <a href="#">
          Get Started
        </a>

      </div>

    </div>

  </div>


  <div className="footer-bottom">

    <span>
      © 2026 BillBuddy. All rights reserved.
    </span>

    <span>
      Built with ❤️ for simpler expenses.
    </span>

  </div>

</footer>

      </main>

    </div>
  );
}

export default Landing;