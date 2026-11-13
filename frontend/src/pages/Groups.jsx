
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/groups", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch groups");
        return;
      }

      setGroups(Array.isArray(data.groups) ? data.groups : []);
    } catch (error) {
      console.error("Fetch groups error:", error);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter a group name.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create group");
        return;
      }

      if (data.group) {
        setGroups((prev) => [data.group, ...prev]);
      } else {
        await fetchGroups();
      }

      setName("");
    } catch (error) {
      console.error("Create group error:", error);
      setError("Unable to connect to the server");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="groups-page">
      {/* Navigation */}
      <nav className="groups-navbar">
        <Link to="/dashboard" className="groups-brand">
          <span className="groups-brand-icon">B</span>
          <span>BillBuddy</span>
        </Link>

        <div className="groups-nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/personal-expenses">Personal Expenses</Link>
          <Link to="/groups" className="active">Groups</Link>
        </div>

        <div className="groups-nav-actions">
  <ThemeToggle />

</div>
      </nav>

      <main className="groups-container">
        {/* Page heading */}
        <section className="groups-heading">
          <div>
            <span className="groups-eyebrow">SHARED FINANCES</span>
            <h1>My Groups <span>👥</span></h1>
            <p>
              Manage shared expenses, split bills and keep everyone on the
              same page.
            </p>
          </div>

          <div className="groups-count-card">
            <span className="groups-count-icon">♧</span>
            <div>
              <strong>{groups.length}</strong>
              <span>{groups.length === 1 ? "Active Group" : "Active Groups"}</span>
            </div>
          </div>
        </section>

        {/* Create group */}
        <section className="groups-create-card">
          <div className="groups-create-info">
            <span className="groups-create-icon">＋</span>
            <div>
              <h2>Create a new group</h2>
              <p>Start sharing expenses with friends, family or roommates.</p>
            </div>
          </div>

          <form onSubmit={handleCreateGroup} className="groups-create-form">
            <input
              type="text"
              placeholder="e.g. Goa Trip, Roommates, Weekend Dinner..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />

            <button type="submit" disabled={creating}>
              {creating ? "Creating..." : "+ Create Group"}
            </button>
          </form>

          {error && (
            <p className="groups-error">
              <span>!</span> {error}
            </p>
          )}
        </section>

        {/* Group list */}
        <section className="groups-list-section">
          <div className="groups-section-heading">
            <div>
              <h2>Your Spaces</h2>
              <p>All your shared expense groups in one place.</p>
            </div>
          </div>

          {loading ? (
            <div className="groups-state-card">
              <span className="groups-loader"></span>
              <p>Loading your groups...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="groups-empty-card">
              <div className="groups-empty-icon">👥</div>
              <h3>No groups yet</h3>
              <p>
                Your shared expense journey starts here. Create your first
                group and start managing expenses together.
              </p>
            </div>
          ) : (
            <div className="groups-grid">
              {groups.map((group) => (
                <Link
                  to={`/groups/${group.id}`}
                  className="group-glass-card"
                  key={group.id}
                >
                  <div className="group-card-top">
                    <span className="group-card-icon">♧</span>
                    <span className="group-card-arrow">↗</span>
                  </div>

                  <h3>{group.name}</h3>

                  <p className="group-card-description">
                    Shared expense space
                  </p>

                  <div className="group-card-divider"></div>

                  <div className="group-card-footer">
                    <span>GROUP #{group.id}</span>
                    <span>Open group →</span>
                  </div>
                </Link>
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

export default Groups;
