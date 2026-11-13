
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";

function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [showMembers, setShowMembers] = useState(false);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  // Fetch actual group details from the backend
  useEffect(() => {
    let isMounted = true;

    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:5001/api/groups/${groupId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to fetch group details"
          );
        }

        if (isMounted) {
          setGroup(data.group);
          setMembers(data.members || []);
        }
      } catch (err) {
        console.error("Group details error:", err);

        if (isMounted) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchGroupDetails();

    return () => {
      isMounted = false;
    };
  }, [groupId, navigate, retry]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const groupCreator = members.find(
    (member) => member.id === group?.created_by
  );

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

          <Link to="/personal-expenses">
            Personal Expenses
          </Link>

          <Link to="/groups" className="nav-active">
            Groups
          </Link>
        </div>

        <div className="home-nav-actions">
          <ThemeToggle />

          <button
            className="home-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="group-details-content">

        {/* Loading State */}
        {loading && (
          <div className="group-section">
            <h2>Loading group details...</h2>
            <p>Please wait while we fetch your group information.</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="group-section">
            <h2>Unable to load group</h2>
            <p>{error}</p>

            <button
              className="group-section-action"
              onClick={() => setRetry((current) => current + 1)}
            >
              Try Again
            </button>

            <Link to="/groups" className="group-back-link">
              ← Back to Groups
            </Link>
          </div>
        )}

        {/* Actual Group Details */}
        {!loading && !error && group && (
          <>
            {/* Group Heading */}
            <header className="group-details-header">
              <div className="group-header-left">
                <Link to="/groups" className="group-back-link">
                  ← Back to Groups
                </Link>

                <div className="group-title-section">
                  <div className="group-title-icon">
                    👥
                  </div>

                  <div>
                    <span className="group-eyebrow">
                      SHARED EXPENSE SPACE
                    </span>

                    <h1>{group.name}</h1>

                    <p>
                      Created on {formatDate(group.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                className="group-add-expense"
                onClick={() =>
                  alert("Group expense functionality is coming next!")
                }
              >
                + Add Expense
              </button>
            </header>

            {/* Summary Cards */}
            <section className="group-summary-grid">

              <div className="group-summary-card">
                <span>Total Members</span>
                <strong>{members.length}</strong>
                <small>People in this group</small>
              </div>

              <div className="group-summary-card">
                <span>Created On</span>
                <strong>{formatDate(group.created_at)}</strong>
                <small>Group creation date</small>
              </div>

              <div className="group-summary-card">
                <span>Group Creator</span>
                <strong>
                  {groupCreator?.name || `User #${group.created_by}`}
                </strong>
                <small>Created this group</small>
              </div>

            </section>

            {/* Group Expenses */}
            <section className="group-section">

              <div className="group-section-header">
                <div>
                  <h2>Group Expenses</h2>
                  <p>Track expenses shared by group members</p>
                </div>

                <button
                  className="group-section-action"
                  onClick={() =>
                    alert("Group expense functionality is coming next!")
                  }
                >
                  + Add Expense
                </button>
              </div>

              <div className="expense-list">
                <div className="expense-item">
                  <div className="expense-icon">💳</div>

                  <div className="expense-info">
                    <strong>No expenses yet</strong>
                    <span>
                      Start adding expenses to track shared spending.
                    </span>
                  </div>
                </div>
              </div>

            </section>

            {/* Actual Group Members */}
            <section className="group-section">

              <div className="group-section-header">
                <div>
                  <h2>Members</h2>
                  <p>
                    {members.length}{" "}
                    {members.length === 1 ? "person" : "people"} in this group
                  </p>
                </div>

                <button
                  className="group-section-action"
                  onClick={() =>
                    setShowMembers((current) => !current)
                  }
                >
                  {showMembers ? "Hide Details" : "View Details"}
                </button>
              </div>

              <div className="members-list">
                {members.map((member) => (
                  <div className="member-item" key={member.id}>

                    <div className="member-avatar">
                      {member.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="member-info">
                      <strong>{member.name}</strong>

                      {showMembers && (
                        <span>
                          Joined on {formatDate(member.joined_at)}
                        </span>
                      )}
                    </div>

                    {member.id === group.created_by && (
                      <span className="you-badge">
                        Creator
                      </span>
                    )}

                  </div>
                ))}
              </div>

            </section>
          </>
        )}

        <footer className="group-details-footer">
          © {new Date().getFullYear()} BillBuddy. Manage money smarter.
        </footer>

      </main>
    </div>
  );
}

export default GroupDetails;
