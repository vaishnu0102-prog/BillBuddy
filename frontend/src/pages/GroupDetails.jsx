
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";

function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [showMembers, setShowMembers] = useState(false);

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [expensesLoading, setExpensesLoading] = useState(true);

  const [error, setError] = useState("");
  const [expensesError, setExpensesError] = useState("");

  const [retry, setRetry] = useState(0);

  // Add Expense modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    description: "",
    paid_by: "",
    split_type: "equal",
  });

  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [exactShares, setExactShares] = useState({});
  const [percentages, setPercentages] = useState({});

  // Fetch actual group details
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

  // Fetch actual group expenses
  useEffect(() => {
    let isMounted = true;

    const fetchGroupExpenses = async () => {
      try {
        setExpensesLoading(true);
        setExpensesError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:5001/api/group-expenses/${groupId}`,
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
            data.message || "Unable to fetch group expenses"
          );
        }

        if (isMounted) {
          setExpenses(data.expenses || []);
        }
      } catch (err) {
        console.error("Group expenses error:", err);

        if (isMounted) {
          setExpensesError(
            err.message || "Something went wrong"
          );
        }
      } finally {
        if (isMounted) {
          setExpensesLoading(false);
        }
      }
    };

    fetchGroupExpenses();

    return () => {
      isMounted = false;
    };
  }, [groupId, navigate, retry]);

  // Initialize form when members are loaded
  useEffect(() => {
    if (members.length > 0) {
      setExpenseForm((current) => ({
        ...current,
        paid_by: current.paid_by || String(members[0].id),
      }));

      setSelectedParticipants(
        members.map((member) => Number(member.id))
      );
    }
  }, [members]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  // Group creator
  const groupCreator = members.find(
    (member) => Number(member.id) === Number(group?.created_by)
  );

  // Total group expenses
  const totalGroupExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  // Open expense modal
  const openExpenseModal = () => {
    setExpenseForm({
      title: "",
      amount: "",
      category: "Food",
      description: "",
      paid_by: members.length > 0 ? String(members[0].id) : "",
      split_type: "equal",
    });

    setSelectedParticipants(
      members.map((member) => Number(member.id))
    );

    setExactShares({});
    setPercentages({});
    setFormError("");
    setFormSuccess("");
    setShowExpenseModal(true);
  };

  // Close expense modal
  const closeExpenseModal = () => {
    if (submitting) return;

    setShowExpenseModal(false);
    setFormError("");
  };

  // Handle form fields
  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setExpenseForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  };

  // Toggle participant selection
  const toggleParticipant = (userId) => {
    setSelectedParticipants((current) => {
      if (current.includes(Number(userId))) {
        return current.filter((id) => id !== Number(userId));
      }

      return [...current, Number(userId)];
    });

    setFormError("");
  };

  // Calculate equal shares in paise
  const getEqualShares = () => {
    const totalCents = Math.round(
      Number(expenseForm.amount) * 100
    );

    const count = selectedParticipants.length;

    if (!count || !Number.isFinite(totalCents)) return [];

    const base = Math.floor(totalCents / count);
    const remainder = totalCents % count;

    return selectedParticipants.map((userId, index) => ({
      user_id: userId,
      amount: (base + (index < remainder ? 1 : 0)) / 100,
    }));
  };

  // Validate and submit expense
  const handleAddExpense = async (event) => {
    event.preventDefault();

    setFormError("");
    setFormSuccess("");

    const amount = Number(expenseForm.amount);

    if (!expenseForm.title.trim()) {
      setFormError("Please enter an expense title.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Please enter a valid amount greater than zero.");
      return;
    }

    if (!expenseForm.paid_by) {
      setFormError("Please select who paid for this expense.");
      return;
    }

    if (selectedParticipants.length === 0) {
      setFormError("Please select at least one participant.");
      return;
    }

    const participants = selectedParticipants.map((userId) => {
      if (expenseForm.split_type === "exact") {
        return {
          user_id: userId,
          amount: Number(exactShares[userId] || 0),
        };
      }

      if (expenseForm.split_type === "percentage") {
        return {
          user_id: userId,
          percentage: Number(percentages[userId] || 0),
        };
      }

      return { user_id: userId };
    });

    // Exact split validation using integer paise
    if (expenseForm.split_type === "exact") {
      const totalShares = participants.reduce(
        (total, participant) =>
          total + Math.round(participant.amount * 100),
        0
      );

      const totalAmount = Math.round(amount * 100);

      if (
        participants.some(
          (participant) =>
            !Number.isFinite(participant.amount) ||
            participant.amount <= 0
        )
      ) {
        setFormError("Every participant must have a valid share greater than zero.");
        return;
      }

      if (totalShares !== totalAmount) {
        setFormError(
          "Exact shares must add up to the total expense amount."
        );
        return;
      }
    }

    // Percentage validation
    if (expenseForm.split_type === "percentage") {
      const totalPercentage = participants.reduce(
        (total, participant) => total + participant.percentage,
        0
      );

      if (
        participants.some(
          (participant) =>
            !Number.isFinite(participant.percentage) ||
            participant.percentage <= 0
        )
      ) {
        setFormError("Every participant must have a percentage greater than zero.");
        return;
      }

      if (Math.abs(totalPercentage - 100) > 0.000001) {
        setFormError(
          `Participant percentages must total exactly 100%. Current total: ${totalPercentage}%`
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const payload = {
        title: expenseForm.title.trim(),
        amount,
        category: expenseForm.category,
        description: expenseForm.description.trim(),
        paid_by: Number(expenseForm.paid_by),
        split_type: expenseForm.split_type,
        participants,
      };

      const response = await fetch(
        `http://localhost:5001/api/group-expenses/${groupId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to add group expense."
        );
      }

      setFormSuccess("Expense added successfully!");

      // Refresh actual expense list
      const refreshResponse = await fetch(
        `http://localhost:5001/api/group-expenses/${groupId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const refreshData = await refreshResponse.json();

      if (!refreshResponse.ok) {
        throw new Error(
          refreshData.message || "Expense was saved, but refreshing the list failed."
        );
      }

      setExpenses(refreshData.expenses || []);
      setExpensesError("");

      setShowExpenseModal(false);
      setFormSuccess("");

    } catch (err) {
      console.error("Add expense error:", err);
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // Modal styles
  const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(3, 7, 18, 0.78)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  };

  const modalStyle = {
    width: "100%",
    maxWidth: "650px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "var(--card-bg, #151E30)",
    color: "var(--text-primary, #F1F5F9)",
    border: "1px solid var(--border-color, #29364C)",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid var(--border-color, #29364C)",
    background: "var(--input-bg, #1C2940)",
    color: "var(--text-primary, #F1F5F9)",
    fontSize: "14px",
    outline: "none",
  };

  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "18px",
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-primary, #F1F5F9)",
  };

  const mutedStyle = {
    color: "var(--text-secondary, #A3AEC2)",
    fontSize: "13px",
  };

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
                onClick={openExpenseModal}
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
                <span>Total Group Expenses</span>

                <strong>
                  {expensesLoading
                    ? "Loading..."
                    : formatCurrency(totalGroupExpenses)}
                </strong>

                <small>
                  {expenses.length} recorded{" "}
                  {expenses.length === 1 ? "expense" : "expenses"}
                </small>
              </div>

              <div className="group-summary-card">
                <span>Group Creator</span>

                <strong>
                  {groupCreator?.name ||
                    `User #${group.created_by}`}
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
                  onClick={openExpenseModal}
                >
                  + Add Expense
                </button>

              </div>

              <div className="expense-list">

                {expensesLoading && (
                  <div className="expense-item">
                    <div className="expense-info">
                      <strong>Loading expenses...</strong>
                      <span>Fetching your group expense history.</span>
                    </div>
                  </div>
                )}

                {!expensesLoading && expensesError && (
                  <div className="expense-item">
                    <div className="expense-info">
                      <strong>Unable to load expenses</strong>
                      <span>{expensesError}</span>
                    </div>

                    <button
                      className="group-section-action"
                      onClick={() =>
                        setRetry((current) => current + 1)
                      }
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!expensesLoading &&
                  !expensesError &&
                  expenses.length === 0 && (
                    <div className="expense-item">
                      <div className="expense-icon">💳</div>

                      <div className="expense-info">
                        <strong>No expenses yet</strong>
                        <span>
                          Start adding expenses to track shared spending.
                        </span>
                      </div>
                    </div>
                  )}

                {!expensesLoading &&
                  !expensesError &&
                  expenses.map((expense) => (
                    <div
                      className="expense-item"
                      key={expense.id}
                    >

                      <div className="expense-icon">💳</div>

                      <div className="expense-info">
                        <strong>{expense.title}</strong>

                        <span>
                          Paid by {expense.paid_by_name}
                        </span>

                        <span>
                          {expense.category} ·{" "}
                          {expense.split_type
                            ?.charAt(0)
                            .toUpperCase() +
                            expense.split_type?.slice(1)}{" "}
                          split
                        </span>

                        <span>
                          {formatDate(expense.expense_date)} ·{" "}
                          {expense.splits?.length || 0} participants
                        </span>
                      </div>

                      <div className="expense-amount">
                        {formatCurrency(expense.amount)}
                      </div>

                    </div>
                  ))}

              </div>

            </section>

            {/* Actual Group Members */}
            <section className="group-section">

              <div className="group-section-header">
                <div>
                  <h2>Members</h2>

                  <p>
                    {members.length}{" "}
                    {members.length === 1 ? "person" : "people"}{" "}
                    in this group
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
                  <div
                    className="member-item"
                    key={member.id}
                  >

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

                    {Number(member.id) === Number(group.created_by) && (
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

      {/* ADD EXPENSE MODAL */}
      {showExpenseModal && (
        <div
          style={modalOverlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeExpenseModal();
            }
          }}
        >

          <div
            style={modalStyle}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-expense-title"
          >

            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "15px",
                marginBottom: "25px",
              }}
            >
              <div>
                <h2
                  id="add-expense-title"
                  style={{
                    fontSize: "23px",
                    margin: "0 0 7px",
                  }}
                >
                  Add Group Expense
                </h2>

                <p style={{ ...mutedStyle, margin: 0 }}>
                  Record an expense shared with your group members.
                </p>
              </div>

              <button
                type="button"
                onClick={closeExpenseModal}
                disabled={submitting}
                aria-label="Close modal"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--text-secondary, #A3AEC2)",
                  fontSize: "25px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddExpense}>

              {/* Expense Title */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Expense Title *
                </label>

                <input
                  style={inputStyle}
                  type="text"
                  name="title"
                  placeholder="e.g. Dinner, Movie Night"
                  value={expenseForm.title}
                  onChange={handleFormChange}
                  maxLength={150}
                  required
                />
              </div>

              {/* Amount and Category */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >

                <div style={fieldStyle}>
                  <label style={labelStyle}>
                    Amount (₹) *
                  </label>

                  <input
                    style={inputStyle}
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>
                    Category *
                  </label>

                  <select
                    style={inputStyle}
                    name="category"
                    value={expenseForm.category}
                    onChange={handleFormChange}
                  >
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Bills">Bills</option>
                    <option value="Transport">Transport</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

              </div>

              {/* Description */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Description
                </label>

                <textarea
                  style={{
                    ...inputStyle,
                    minHeight: "75px",
                    resize: "vertical",
                  }}
                  name="description"
                  placeholder="Add some details about this expense..."
                  value={expenseForm.description}
                  onChange={handleFormChange}
                />
              </div>

              {/* Paid By */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Paid By *
                </label>

                <select
                  style={inputStyle}
                  name="paid_by"
                  value={expenseForm.paid_by}
                  onChange={handleFormChange}
                  required
                >
                  {members.map((member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Split Type */}
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Split Method *
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "9px",
                  }}
                >
                  {[
                    {
                      value: "equal",
                      title: "Equal",
                      subtitle: "Divide equally",
                    },
                    {
                      value: "exact",
                      title: "Exact",
                      subtitle: "Custom amounts",
                    },
                    {
                      value: "percentage",
                      title: "Percentage",
                      subtitle: "Custom shares",
                    },
                  ].map((option) => {
                    const active =
                      expenseForm.split_type === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setExpenseForm((current) => ({
                            ...current,
                            split_type: option.value,
                          }));
                          setFormError("");
                        }}
                        style={{
                          padding: "12px 5px",
                          borderRadius: "10px",
                          border: active
                            ? "1px solid #8B7CFF"
                            : "1px solid var(--border-color, #29364C)",
                          background: active
                            ? "rgba(139,124,255,0.15)"
                            : "var(--input-bg, #1C2940)",
                          color: "var(--text-primary, #F1F5F9)",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            fontSize: "13px",
                          }}
                        >
                          {option.title}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            fontSize: "10px",
                            marginTop: "5px",
                            color: "var(--text-secondary, #A3AEC2)",
                          }}
                        >
                          {option.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Participants */}
              <div style={fieldStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label style={labelStyle}>
                    Split Between *
                  </label>

                  <span style={mutedStyle}>
                    {selectedParticipants.length} selected
                  </span>
                </div>

                <div
                  style={{
                    border: "1px solid var(--border-color, #29364C)",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >

                  {members.map((member, index) => {
                    const userId = Number(member.id);
                    const selected =
                      selectedParticipants.includes(userId);

                    return (
                      <div
                        key={member.id}
                        style={{
                          padding: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                          borderBottom:
                            index !== members.length - 1
                              ? "1px solid var(--border-color, #29364C)"
                              : "none",
                          background: selected
                            ? "rgba(139,124,255,0.05)"
                            : "transparent",
                        }}
                      >

                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            toggleParticipant(userId)
                          }
                        />

                        <span
                          style={{
                            flex: 1,
                            fontSize: "14px",
                            fontWeight: 500,
                          }}
                        >
                          {member.name}
                        </span>

                        {selected &&
                          expenseForm.split_type === "exact" && (
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              placeholder="Share ₹"
                              value={exactShares[userId] ?? ""}
                              onChange={(event) =>
                                setExactShares((current) => ({
                                  ...current,
                                  [userId]: event.target.value,
                                }))
                              }
                              style={{
                                ...inputStyle,
                                width: "120px",
                                padding: "8px",
                              }}
                            />
                          )}

                        {selected &&
                          expenseForm.split_type === "percentage" && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="%"
                                value={percentages[userId] ?? ""}
                                onChange={(event) =>
                                  setPercentages((current) => ({
                                    ...current,
                                    [userId]: event.target.value,
                                  }))
                                }
                                style={{
                                  ...inputStyle,
                                  width: "85px",
                                  padding: "8px",
                                }}
                              />
                              <span style={mutedStyle}>%</span>
                            </div>
                          )}

                      </div>
                    );
                  })}

                </div>
              </div>

              {/* Split Summary */}
              {selectedParticipants.length > 0 &&
                Number(expenseForm.amount) > 0 && (
                  <div
                    style={{
                      background: "rgba(139,124,255,0.08)",
                      border: "1px solid rgba(139,124,255,0.25)",
                      borderRadius: "12px",
                      padding: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "12px",
                        fontSize: "14px",
                      }}
                    >
                      Split Summary
                    </strong>

                    {expenseForm.split_type === "equal" &&
                      getEqualShares().map((share) => {
                        const member = members.find(
                          (item) =>
                            Number(item.id) === share.user_id
                        );

                        return (
                          <div
                            key={share.user_id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "5px 0",
                              fontSize: "13px",
                            }}
                          >
                            <span>{member?.name}</span>
                            <strong>
                              {formatCurrency(share.amount)}
                            </strong>
                          </div>
                        );
                      })}

                    {expenseForm.split_type === "exact" &&
                      selectedParticipants.map((userId) => {
                        const member = members.find(
                          (item) =>
                            Number(item.id) === userId
                        );

                        return (
                          <div
                            key={userId}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "5px 0",
                              fontSize: "13px",
                            }}
                          >
                            <span>{member?.name}</span>
                            <strong>
                              {formatCurrency(exactShares[userId] || 0)}
                            </strong>
                          </div>
                        );
                      })}

                    {expenseForm.split_type === "percentage" &&
                      selectedParticipants.map((userId) => {
                        const member = members.find(
                          (item) =>
                            Number(item.id) === userId
                        );

                        const percentage = Number(
                          percentages[userId] || 0
                        );

                        return (
                          <div
                            key={userId}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "5px 0",
                              fontSize: "13px",
                            }}
                          >
                            <span>{member?.name}</span>
                            <strong>
                              {percentage}% ·{" "}
                              {formatCurrency(
                                Number(expenseForm.amount) *
                                  percentage / 100
                              )}
                            </strong>
                          </div>
                        );
                      })}

                    {expenseForm.split_type === "percentage" && (
                      <div
                        style={{
                          borderTop: "1px solid var(--border-color, #29364C)",
                          paddingTop: "10px",
                          marginTop: "8px",
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "13px",
                        }}
                      >
                        <span>Total percentage</span>

                        <strong>
                          {selectedParticipants.reduce(
                            (total, userId) =>
                              total +
                              Number(percentages[userId] || 0),
                            0
                          ).toFixed(2)}%
                        </strong>
                      </div>
                    )}

                  </div>
                )}

              {/* Form Error */}
              {formError && (
                <div
                  role="alert"
                  style={{
                    padding: "12px",
                    borderRadius: "9px",
                    background: "rgba(244,63,94,0.12)",
                    border: "1px solid rgba(244,63,94,0.35)",
                    color: "#FB7185",
                    fontSize: "13px",
                    marginBottom: "15px",
                  }}
                >
                  {formError}
                </div>
              )}

              {/* Form Success */}
              {formSuccess && (
                <div
                  role="status"
                  style={{
                    padding: "12px",
                    borderRadius: "9px",
                    background: "rgba(16,185,129,0.12)",
                    color: "#34D399",
                    marginBottom: "15px",
                  }}
                >
                  {formSuccess}
                </div>
              )}

              {/* Modal Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  paddingTop: "5px",
                }}
              >
                <button
                  type="button"
                  onClick={closeExpenseModal}
                  disabled={submitting}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "9px",
                    border: "1px solid var(--border-color, #29364C)",
                    background: "transparent",
                    color: "var(--text-primary, #F1F5F9)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "9px",
                    border: "none",
                    background: "#7564F5",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting
                    ? "Adding Expense..."
                    : "Add Expense"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default GroupDetails;
