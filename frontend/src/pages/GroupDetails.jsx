
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import ThemeToggle from "../components/ThemeToggle";

function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [showMembers, setShowMembers] = useState(false);

  // Temporary mock data — backend integration comes later.
  const group = {
    id: groupId,
    name: "Goa Trip",
    description: "Trip expenses with friends",
    members: 4,
    totalSpent: 6850,
    balance: -350,
  };

  const expenses = [
    {
      id: 1,
      title: "Dinner at Cafe",
      amount: 1200,
      paidBy: "Rahul",
      date: "Today",
      icon: "🍕",
    },
    {
      id: 2,
      title: "Hotel",
      amount: 4800,
      paidBy: "Vaishnavi",
      date: "Yesterday",
      icon: "🏨",
    },
    {
      id: 3,
      title: "Cab",
      amount: 850,
      paidBy: "Ananya",
      date: "Yesterday",
      icon: "🚕",
    },
  ];

  const members = [
    { id: 1, name: "Vaishnavi", balance: 0, isYou: true },
    { id: 2, name: "Rahul", balance: -350 },
    { id: 3, name: "Ananya", balance: -120 },
    { id: 4, name: "Sneha", balance: -480 },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="group-details-page">

      {/* Shared BillBuddy Navigation */}
      <nav className="home-navbar">
        <Link to="/dashboard" className="home-logo">
          <span className="home-logo-mark">B</span>
          BillBuddy
        </Link>

        <div className="home-nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/personal-expenses">Personal Expenses</Link>
          <Link to="/groups" className="nav-active">
            Groups
          </Link>
        </div>

        <div className="home-nav-actions">
          <ThemeToggle />

          <button className="home-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="group-details-content">

        {/* Group Heading */}
        <header className="group-details-header">
          <div className="group-header-left">
            <Link to="/groups" className="group-back-link">
              ← Back to Groups
            </Link>

            <div className="group-title-section">
              <div className="group-title-icon">🏝️</div>

              <div>
                <span className="group-eyebrow">
                  SHARED EXPENSE SPACE
                </span>
                <h1>{group.name}</h1>
                <p>{group.description}</p>
              </div>
            </div>
          </div>

          <button
            className="group-add-expense"
            onClick={() => alert("Add Expense coming next!")}
          >
            + Add Expense
          </button>
        </header>

        {/* Summary Cards */}
        <section className="group-summary-grid">

          <div className="group-summary-card">
            <span>Your Balance</span>

            <strong className={group.balance < 0 ? "balance-negative" : "balance-positive"}>
              {group.balance < 0
                ? `You owe ${formatCurrency(Math.abs(group.balance))}`
                : `You get ${formatCurrency(group.balance)}`}
            </strong>

            <small>Your current balance in this group</small>
          </div>

          <div className="group-summary-card">
            <span>Total Group Spending</span>
            <strong>{formatCurrency(group.totalSpent)}</strong>
            <small>Across {group.members} members</small>
          </div>

          <div className="group-summary-card">
            <span>Members</span>
            <strong>{group.members}</strong>
            <small>People in this group</small>
          </div>

        </section>

        {/* Expenses */}
        <section className="group-section">

          <div className="group-section-header">
            <div>
              <h2>Group Expenses</h2>
              <p>Recent expenses in this group</p>
            </div>

            <button
              className="group-section-action"
              onClick={() => alert("Add Expense coming next!")}
            >
              + Add Expense
            </button>
          </div>

          <div className="expense-list">
            {expenses.map((expense) => (
              <div className="expense-item" key={expense.id}>
                <div className="expense-icon">
                  {expense.icon}
                </div>

                <div className="expense-info">
                  <strong>{expense.title}</strong>
                  <span>
                    Paid by {expense.paidBy} · {expense.date}
                  </span>
                </div>

                <div className="expense-amount">
                  {formatCurrency(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Members */}
        <section className="group-section">

          <div className="group-section-header">
            <div>
              <h2>Members</h2>
              <p>{group.members} people in this group</p>
            </div>

            <button
              className="group-section-action"
              onClick={() => setShowMembers((current) => !current)}
            >
              {showMembers ? "Hide Details" : "View Details"}
            </button>
          </div>

          <div className="members-list">
            {members.map((member) => (
              <div className="member-item" key={member.id}>
                <div className="member-avatar">
                  {member.name.charAt(0).toUpperCase()}
                </div>

                <div className="member-info">
                  <strong>
                    {member.name}
                    {member.isYou && (
                      <span className="you-badge">You</span>
                    )}
                  </strong>

                  {showMembers && (
                    <span>Group member</span>
                  )}
                </div>

                <div
                  className={
                    member.balance < 0
                      ? "member-balance negative"
                      : member.balance > 0
                      ? "member-balance positive"
                      : "member-balance settled"
                  }
                >
                  {member.balance < 0
                    ? `Owes ${formatCurrency(Math.abs(member.balance))}`
                    : member.balance > 0
                    ? `Gets ${formatCurrency(member.balance)}`
                    : "Settled"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="group-details-footer">
          © {new Date().getFullYear()} BillBuddy. Manage money smarter.
        </footer>

      </main>
    </div>
  );
}

export default GroupDetails;
