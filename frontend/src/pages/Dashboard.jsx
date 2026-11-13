
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Dashboard() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);

  const [error, setError] = useState("");
  const [groupError, setGroupError] = useState("");

  const [groupName, setGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Fetch personal transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await api.request("/expenses");
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message || "Unable to load financial data");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Fetch user's groups
  const fetchGroups = async () => {
    try {
      setGroupsLoading(true);
      setGroupError("");

      const data = await api.request("/groups");
      setGroups(data.groups || []);
    } catch (err) {
      setGroupError(err.message || "Unable to load groups");
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Create a new group
  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) return;

    try {
      setCreatingGroup(true);
      setGroupError("");

      const data = await api.request("/groups", {
        method: "POST",
        body: JSON.stringify({
          name: groupName.trim(),
        }),
      });

      setGroups((prev) => [data.group, ...prev]);
      setGroupName("");
    } catch (err) {
      setGroupError(err.message || "Unable to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  // Calculate personal financial totals
  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="home-page">

      {/* Top Navigation */}
      <nav className="home-navbar">
        <Link to="/dashboard" className="home-logo">
          <span className="home-logo-mark">B</span>
          BillBuddy
        </Link>

        <div className="home-nav-links">
          <Link to="/dashboard" className="nav-active">
            Home
          </Link>
          <Link to="/personal-expenses">Personal Expenses</Link>
          <Link to="/groups">Groups</Link>
        </div>

        <button className="home-logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <main className="home-content">

        {/* Welcome Section */}
        <section className="home-welcome">
          <div>
            <span className="home-greeting">YOUR FINANCIAL SPACE</span>
            <h1>Welcome back! 👋</h1>
            <p>
              Here's an overview of your personal finances.
              Let's keep your money organized.
            </p>
          </div>

          <Link to="/personal-expenses" className="home-primary-btn">
            + Add Transaction
          </Link>
        </section>

        {/* Financial Overview */}
        <section className="home-overview">
          <div className="home-section-heading">
            <div>
              <h2>Financial Overview</h2>
              <p>Your personal transaction summary</p>
            </div>
          </div>

          {error && <div className="home-error">{error}</div>}

          <div className="home-stats-grid">
            <div className="home-stat-card">
              <div className="home-stat-top">
                <span>Total Income</span>
                <span className="home-stat-icon income-icon">↗</span>
              </div>
              <h3>
                {loading ? "Loading..." : formatCurrency(totals.income)}
              </h3>
              <p>Money received</p>
            </div>

            <div className="home-stat-card">
              <div className="home-stat-top">
                <span>Total Expenses</span>
                <span className="home-stat-icon expense-icon">↘</span>
              </div>
              <h3>
                {loading ? "Loading..." : formatCurrency(totals.expenses)}
              </h3>
              <p>Money spent</p>
            </div>

            <div className="home-stat-card home-balance-card">
              <div className="home-stat-top">
                <span>Available Balance</span>
                <span className="home-stat-icon balance-icon">₹</span>
              </div>
              <h3>
                {loading ? "Loading..." : formatCurrency(totals.balance)}
              </h3>
              <p>Income minus expenses</p>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="home-features-section">
          <div className="home-section-heading">
            <div>
              <h2>Manage Your Finances</h2>
              <p>Choose what you'd like to manage today.</p>
            </div>
          </div>

          <div className="home-feature-grid">

            <Link to="/personal-expenses" className="home-feature-card">
              <div className="home-feature-icon personal-icon">
                <span>₹</span>
              </div>
              <h3>Personal Expenses</h3>
              <p>
                Track your income, daily expenses and spending habits.
              </p>
              <span className="home-feature-link">
                Manage Personal Expenses →
              </span>
            </Link>

            <Link to="/groups" className="home-feature-card">
              <div className="home-feature-icon groups-icon">
                <span>♧</span>
              </div>
              <h3>Group Expenses</h3>
              <p>
                Create groups, split bills and manage shared expenses
                with friends.
              </p>
              <span className="home-feature-link">
                Manage Groups →
              </span>
            </Link>

            <div className="home-feature-card home-coming-card">
              <div className="home-feature-icon analytics-icon">
                <span>▥</span>
              </div>
              <h3>Analytics</h3>
              <p>
                Understand your spending patterns with visual reports
                and financial insights.
              </p>
              <span className="home-coming-label">
                Coming Soon
              </span>
            </div>

          </div>
        </section>

        {/* Group Overview */}
        <section className="home-groups-section">
          <div className="home-section-heading">
            <div>
              <h2>Your Groups 👥</h2>
              <p>
                You are part of {groups.length} group
                {groups.length !== 1 ? "s" : ""}.
              </p>
            </div>

            <Link to="/groups" className="home-view-all">
              View All Groups →
            </Link>
          </div>

          {/* Create Group */}
          <form
            className="home-create-group"
            onSubmit={handleCreateGroup}
          >
            <input
              type="text"
              placeholder="Enter a new group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={100}
            />

            <button type="submit" disabled={creatingGroup || !groupName.trim()}>
              {creatingGroup ? "Creating..." : "+ Create Group"}
            </button>
          </form>

          {groupError && (
            <div className="home-error">{groupError}</div>
          )}

          {groupsLoading ? (
            <p className="home-empty-message">Loading your groups...</p>
          ) : groups.length === 0 ? (
            <div className="home-empty-message">
              <h3>No groups yet!</h3>
              <p>
                Create your first group to start managing shared expenses
                with friends.
              </p>
            </div>
          ) : (
            <div className="home-groups-grid">
              {groups.slice(0, 6).map((group) => (
                <Link
                  to={`/groups/${group.id}`}
                  className="home-group-card"
                  key={group.id}
                >
                  <div className="home-group-icon">👥</div>

                  <div className="home-group-info">
                    <h3>{group.name}</h3>
                    <p>
                      Created{" "}
                      {group.created_at
                        ? new Date(group.created_at).toLocaleDateString("en-IN")
                        : "Recently"}
                    </p>
                  </div>

                  <span className="home-group-arrow">→</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent Transactions */}
        <section className="home-recent-section">
          <div className="home-section-heading">
            <div>
              <h2>Recent Transactions</h2>
              <p>Your latest personal financial activity.</p>
            </div>

            <Link to="/personal-expenses" className="home-view-all">
              View All →
            </Link>
          </div>

          {loading ? (
            <p className="home-empty-message">Loading transactions...</p>
          ) : recentTransactions.length === 0 ? (
            <div className="home-empty-message">
              <h3>No transactions yet</h3>
              <p>
                Start tracking your money by adding your first transaction.
              </p>
              <Link to="/personal-expenses" className="home-primary-btn">
                Add Your First Transaction
              </Link>
            </div>
          ) : (
            <div className="home-recent-list">
              {recentTransactions.map((item) => (
                <div className="home-recent-item" key={item.id}>
                  <div className="home-recent-icon">
                    {item.type === "income" ? "↗" : "↘"}
                  </div>

                  <div className="home-recent-info">
                    <strong>{item.category}</strong>
                    <span>
                      {item.description || item.payment_method || "Personal transaction"}
                    </span>
                  </div>

                  <div className="home-recent-right">
                    <strong className={`home-${item.type}-amount`}>
                      {item.type === "income" ? "+" : "-"}
                      {formatCurrency(Number(item.amount))}
                    </strong>
                    <span>
                      {String(item.transaction_date).slice(0, 10)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="home-footer">
          <p>© {new Date().getFullYear()} BillBuddy. Manage money smarter.</p>
        </footer>

      </main>
    </div>
  );
}

export default Dashboard;
