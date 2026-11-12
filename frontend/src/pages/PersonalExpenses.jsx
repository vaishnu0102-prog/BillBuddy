
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function PersonalExpenses() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    type: "expense",
    amount: "",
    category: "",
    description: "",
    payment_method: "UPI",
    transaction_date: new Date().toLocaleDateString("en-CA"),
  };

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.request("/expenses");
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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

  const filteredTransactions = transactions.filter((item) => {
    const matchesFilter =
      filter === "all" || item.type === filter;

    const matchesSearch =
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      if (editingId) {
        await api.request(`/expenses/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api.request("/expenses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setForm(initialForm);
      setEditingId(null);
      await fetchTransactions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      type: item.type,
      amount: item.amount,
      category: item.category,
      description: item.description || "",
      payment_method: item.payment_method || "UPI",
      transaction_date: String(item.transaction_date).slice(0, 10),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      setError("");

      await api.request(`/expenses/${id}`, {
        method: "DELETE",
      });

      await fetchTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="personal-expenses-page">
      <header className="expenses-header">
        <div>
          <Link to="/dashboard" className="back-link">
            ← Dashboard
          </Link>
          <h1>Personal Expenses</h1>
          <p>Track your income and expenses in one place.</p>
        </div>
      </header>

      {error && <div className="expenses-error">{error}</div>}

      <section className="summary-grid">
        <div className="summary-card income-card">
          <span>Total Income</span>
          <h2>{formatCurrency(totals.income)}</h2>
        </div>

        <div className="summary-card expense-card">
          <span>Total Expenses</span>
          <h2>{formatCurrency(totals.expenses)}</h2>
        </div>

        <div className="summary-card balance-card">
          <span>Available Balance</span>
          <h2>{formatCurrency(totals.balance)}</h2>
        </div>
      </section>

      <section className="transaction-form-section">
        <h2>{editingId ? "Edit Transaction" : "Add Transaction"}</h2>

        <form onSubmit={handleSubmit} className="transaction-form">
          <label>
            Transaction Type
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label>
            Amount (₹)
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              required
            />
          </label>

          <label>
            Category
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Food, Salary, Travel"
              required
            />
          </label>

          <label>
            Payment Method
            <select
              name="payment_method"
              value={form.payment_method}
              onChange={handleChange}
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Date
            <input
              type="date"
              name="transaction_date"
              value={form.transaction_date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Description
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add a note (optional)"
            />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                ? "Update Transaction"
                : "Add Transaction"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="transactions-section">
        <div className="transactions-heading">
          <div>
            <h2>Transaction History</h2>
            <p>Your personal financial activity</p>
          </div>

          <input
            type="search"
            placeholder="Search category or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          {["all", "income", "expense"].map((value) => (
            <button
              key={value}
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading transactions...</p>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-transactions">
            <h3>No transactions found</h3>
            <p>Add your first income or expense to get started.</p>
          </div>
        ) : (
          <div className="transaction-table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Payment</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((item) => (
                  <tr key={item.id}>
                    <td>{String(item.transaction_date).slice(0, 10)}</td>
                    <td>{item.category}</td>
                    <td>{item.description || "—"}</td>
                    <td>{item.payment_method || "—"}</td>
                    <td>
                      <span className={`type-label ${item.type}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className={`amount-${item.type}`}>
                      {formatCurrency(Number(item.amount))}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default PersonalExpenses;
