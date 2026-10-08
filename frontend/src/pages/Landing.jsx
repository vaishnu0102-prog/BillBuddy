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
              ✦ Your smarter expense companion
            </p>

            <h1>
              Take control of
              <br />
              <span>every expense.</span>
            </h1>

            <p className="hero-description">
              From everyday spending to group trips and shared bills,
              BillBuddy helps you track, organize, split, and understand
              your expenses — all in one place.
            </p>

            <div className="hero-actions">

              <Link
                to="/signup"
                className="btn btn-primary btn-large"
              >
                Get Started →
              </Link>

              <a
                href="#how-it-works"
                className="btn btn-outline btn-large"
              >
                See How It Works
              </a>

            </div>

            <div className="hero-trust">

              <span>✓ Personal expenses</span>

              <span>✓ Shared expenses</span>

              <span>✓ Smart insights</span>

            </div>

          </div>


          {/* ================================
              DASHBOARD PREVIEW
          ================================= */}

          <div className="hero-visual">

            <div className="dashboard-preview">

              <div className="preview-header">

                <span>
                  Good evening 👋
                </span>

                <span className="preview-avatar">
                  V
                </span>

              </div>


              {/* Overall Spending */}

              <div className="balance-card">

                <span>
                  Total expenses
                </span>

                <strong>
                  ₹18,450
                </strong>

                <small>
                  This month · 24 expenses
                </small>

              </div>


              {/* Personal + Shared */}

              <div className="preview-grid">

                <div className="preview-card">

                  <span>
                    Personal
                  </span>

                  <strong>
                    ₹11,200
                  </strong>

                  <small>
                    18 expenses
                  </small>

                </div>


                <div className="preview-card">

                  <span>
                    Shared
                  </span>

                  <strong>
                    ₹7,250
                  </strong>

                  <small>
                    6 expenses
                  </small>

                </div>

              </div>


              {/* Recent Activity */}

              <div className="activity-card">

                <span>
                  Recent activity
                </span>


                <div className="activity-row">

                  <div className="activity-icon">
                    🍔
                  </div>

                  <div>
                    <strong>
                      Lunch
                    </strong>

                    <small>
                      Food · Personal
                    </small>
                  </div>

                  <b>
                    ₹450
                  </b>

                </div>


                <div className="activity-row">

                  <div className="activity-icon">
                    🏠
                  </div>

                  <div>
                    <strong>
                      Apartment Rent
                    </strong>

                    <small>
                      Home · Personal
                    </small>
                  </div>

                  <b>
                    ₹8,000
                  </b>

                </div>


                <div className="activity-row">

                  <div className="activity-icon">
                    🍕
                  </div>

                  <div>
                    <strong>
                      Dinner
                    </strong>

                    <small>
                      Friends · Shared
                    </small>
                  </div>

                  <b>
                    ₹1,200
                  </b>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================================
            WHY BILLBUDDY
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
              Everything about your expenses,
              <span> in one place.</span>
            </h2>

            <p>
              Whether you're managing your own spending or sharing expenses
              with others, BillBuddy keeps everything organized and easy to
              understand.
            </p>

          </div>


          <div className="features-grid">


            {/* ================================
                PERSONAL EXPENSES
            ================================= */}

            <div className="feature-card feature-card-large">

              <div className="feature-icon">
                👤
              </div>

              <h3>
                Track Everyday Expenses
              </h3>

              <p>
                Keep track of your daily spending — food, shopping,
                transportation, bills, subscriptions, and everything
                in between.
              </p>


              <div className="feature-mini-ui">

                <div>

                  <span>
                    This month
                  </span>

                  <strong>
                    ₹18,450
                  </strong>

                </div>


                <div className="mini-split">

                  <span>
                    Food · Bills · Shopping
                  </span>

                  <strong>
                    View spending →
                  </strong>

                </div>

              </div>

            </div>


            {/* ================================
                SHARED EXPENSES
            ================================= */}

            <div className="feature-card">

              <div className="feature-icon">
                👥
              </div>

              <h3>
                Manage Shared Expenses
              </h3>

              <p>
                Create groups for friends, roommates, trips, college,
                family, or any situation where expenses are shared.
              </p>

            </div>


            {/* ================================
                SMART SPLITTING
            ================================= */}

            <div className="feature-card">

              <div className="feature-icon">
                ⚡
              </div>

              <h3>
                Split Bills Your Way
              </h3>

              <p>
                Split expenses equally, by exact amounts, or by percentage.
                BillBuddy handles the calculations for you.
              </p>

            </div>


            {/* ================================
                CATEGORIES
            ================================= */}

            <div className="feature-card">

              <div className="feature-icon">
                🏷️
              </div>

              <h3>
                Organize Your Spending
              </h3>

              <p>
                Categorize expenses and keep your financial activity
                organized so you can quickly understand where your money
                is going.
              </p>

            </div>


            {/* ================================
                ANALYTICS
            ================================= */}

            <div className="feature-card">

              <div className="feature-icon">
                📊
              </div>

              <h3>
                Understand Your Money
              </h3>

              <p>
                See spending patterns, categories, trends, balances,
                and expense history through a clear dashboard.
              </p>

            </div>


            {/* ================================
                BALANCES
            ================================= */}

            <div className="feature-card">

              <div className="feature-icon">
                🤝
              </div>

              <h3>
                Know Who Owes Whom
              </h3>

              <p>
                When expenses are shared, instantly see what you owe,
                what others owe you, and what still needs to be settled.
              </p>

            </div>


            {/* ================================
                NOTIFICATIONS
            ================================= */}

            <div className="feature-card">

              <div className="feature-icon">
                🔔
              </div>

              <h3>
                Stay Updated
              </h3>

              <p>
                Get useful updates about expenses, balances, settlements,
                and activity so nothing important gets missed.
              </p>

            </div>


            {/* ================================
                FUTURE SMART FEATURES
            ================================= */}

            <div className="feature-card">

              <div className="feature-icon">
                ✨
              </div>

              <h3>
                Smarter Expense Management
              </h3>

              <p>
                BillBuddy is built to become smarter over time with
                intelligent insights, easier expense entry, and other
                helpful financial tools.
              </p>

            </div>

          </div>

        </section>


        {/* ================================
            HOW IT WORKS
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
              One place for
              <span> every kind of expense.</span>
            </h2>

            <p>
              BillBuddy keeps the entire expense journey simple,
              whether you're spending alone or sharing the cost with others.
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
                  Add an expense
                </h3>

                <p>
                  Record an expense you're paying for yourself or one
                  you're sharing with other people.
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
                  Organize it
                </h3>

                <p>
                  Add categories, participants, groups, and the appropriate
                  split method when an expense is shared.
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
                  Understand your spending
                </h3>

                <p>
                  View your expenses, categories, trends, balances,
                  and spending activity from your dashboard.
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
                  Stay in control
                </h3>

                <p>
                  Track settlements, monitor your expenses, and use
                  BillBuddy's insights to make smarter spending decisions.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ================================
            BILLBUDDY FOR EVERY SITUATION
        ================================= */}

        <section className="features-section">

          <div className="section-heading">

            <p className="section-label">
              MADE FOR REAL LIFE
            </p>

            <h2>
              One app.
              <span> Many ways to use it.</span>
            </h2>

            <p>
              Your expenses don't always look the same — BillBuddy is
              designed to handle all of them.
            </p>

          </div>


          <div className="features-grid">

            <div className="feature-card">

              <div className="feature-icon">
                ☕
              </div>

              <h3>
                Everyday Spending
              </h3>

              <p>
                Track coffee, food, shopping, transport, subscriptions,
                and other everyday expenses.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                🏠
              </div>

              <h3>
                Roommates & Home
              </h3>

              <p>
                Manage rent, groceries, utilities, and other shared
                household expenses.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                ✈️
              </div>

              <h3>
                Trips & Travel
              </h3>

              <p>
                Keep track of travel expenses and split costs with
                everyone involved in the trip.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                🎓
              </div>

              <h3>
                Friends & College
              </h3>

              <p>
                Manage shared expenses for college groups, outings,
                events, and everyday plans.
              </p>

            </div>

          </div>

        </section>


        {/* ================================
            FUTURE VISION
        ================================= */}

        <section className="how-section">

          <div className="section-heading">

            <p className="section-label">
              BUILT TO GROW
            </p>

            <h2>
              More than expense tracking.
              <span> A smarter way to manage money.</span>
            </h2>

            <p>
              BillBuddy's foundation is expense management, but the goal
              is to make managing your money simpler, smarter, and more
              effortless over time.
            </p>

          </div>


          <div className="steps">

            <div className="step">

              <div className="step-number">
                ✦
              </div>

              <div>

                <h3>
                  Smarter insights
                </h3>

                <p>
                  Understand your spending patterns and discover useful
                  insights from your expense history.
                </p>

              </div>

            </div>


            <div className="step">

              <div className="step-number">
                ✦
              </div>

              <div>

                <h3>
                  Easier expense entry
                </h3>

                <p>
                  Make recording expenses faster and more convenient with
                  smarter ways to capture expense information.
                </p>

              </div>

            </div>


            <div className="step">

              <div className="step-number">
                ✦
              </div>

              <div>

                <h3>
                  Connected experience
                </h3>

                <p>
                  Bring tracking, shared expenses, analytics, notifications,
                  and settlements together in one experience.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ================================
            FINAL CTA
        ================================= */}

        <section className="cta-section">

          <div className="cta-card">

            <div className="cta-content">

              <p className="section-label">
                READY TO TAKE CONTROL?
              </p>

              <h2>
                Every expense.
                <br />
                <span>Handled smarter.</span>
              </h2>

              <p>
                Track your spending, manage shared expenses, understand
                your money, and stay in control — all with BillBuddy.
              </p>

              <Link
                to="/signup"
                className="btn cta-button"
              >
                Create Your Free Account →
              </Link>

            </div>

          </div>

        </section>


        {/* ================================
            FOOTER
        ================================= */}

        <footer
          className="footer"
          id="about"
        >

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
                Your expenses, your people, your money —
                all in one place.
              </p>

            </div>


            <div className="footer-links">

              <div>

                <h4>
                  Product
                </h4>

                <a href="#features">
                  Features
                </a>

                <a href="#how-it-works">
                  How It Works
                </a>

              </div>


              <div>

                <h4>
                  Company
                </h4>

                <a href="#about">
                  About
                </a>

                <a href="#">
                  Contact
                </a>

              </div>


              <div>

                <h4>
                  Account
                </h4>

                <Link to="/login">
                  Login
                </Link>

                <Link to="/signup">
                  Get Started
                </Link>

              </div>

            </div>

          </div>


          <div className="footer-bottom">

            <span>
              © 2026 BillBuddy. All rights reserved.
            </span>

            <span>
              Built with ❤️ for smarter expense management.
            </span>

          </div>

        </footer>

      </main>

    </div>
  );
}

export default Landing;