import { useEffect, useState } from "react";

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

      setGroups(data.groups);
    } catch (error) {
      console.error("Fetch groups error:", error);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

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
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create group");
        return;
      }

      setGroups((prev) => [data.group, ...prev]);
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
    <div>
      <h1>My Groups 👥</h1>

      <form onSubmit={handleCreateGroup}>
        <input
          type="text"
          placeholder="Enter group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create Group"}
        </button>
      </form>

      {error && <p>{error}</p>}

      {loading ? (
        <p>Loading groups...</p>
      ) : groups.length === 0 ? (
        <p>No groups yet.</p>
      ) : (
        <div>
          {groups.map((group) => (
            <div key={group.id}>
              <h3>{group.name}</h3>
              <p>Group ID: {group.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Groups;