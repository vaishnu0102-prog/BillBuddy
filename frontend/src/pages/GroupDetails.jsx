import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';

function GroupDetails() {
  const { groupId } = useParams();
  const [showMembers, setShowMembers] = useState(false);

  // Temporary mock data
  // Later this will come from the backend using groupId.
  const group = {
    id: groupId,
    name: 'Goa Trip',
    description: 'Trip expenses with friends',
    members: 4,
    totalSpent: 6850,
    balance: -350,
  };

  const expenses = [
    {
      id: 1,
      title: 'Dinner at Cafe',
      amount: 1200,
      paidBy: 'Rahul',
      date: 'Today',
      icon: '🍕',
    },
    {
      id: 2,
      title: 'Hotel',
      amount: 4800,
      paidBy: 'Vaishnavi',
      date: 'Yesterday',
      icon: '🏨',
    },
    {
      id: 3,
      title: 'Cab',
      amount: 850,
      paidBy: 'Ananya',
      date: 'Yesterday',
      icon: '🚕',
    },
  ];

  const members = [
    {
      id: 1,
      name: 'Vaishnavi',
      balance: 0,
      isYou: true,
    },
    {
      id: 2,
      name: 'Rahul',
      balance: -350,
    },
    {
      id: 3,
      name: 'Ananya',
      balance: -120,
    },
    {
      id: 4,
      name: 'Sneha',
      balance: -480,
    },
  ];

  return (
    <div className="group-details-page">

      {/* ================================
          HEADER
      ================================= */}

      <header className="group-details-header">

        <div className="group-header-left">

          <Link
            to="/groups"
            className="back-link"
          >
            ← Back to Groups
          </Link>

          <div className="group-title-section">

            <div className="group-title-icon">
              🏝️
            </div>

            <div>
              <h1>{group.name}</h1>

              <p>
                {group.description}
              </p>
            </div>

          </div>

        </div>


        <button
          className="btn btn-primary group-add-expense"
          onClick={() => alert('Add Expense coming next!')}
        >
          + Add Expense
        </button>

      </header>


      {/* ================================
          MAIN CONTENT
      ================================= */}

      <main className="group-details-content">


        {/* ================================
            SUMMARY CARDS
        ================================= */}

        <section className="group-summary-grid">

          <div className="group-summary-card">

            <span>
              Your Balance
            </span>

            <strong className="balance-negative">
              You owe ₹{Math.abs(group.balance)}
            </strong>

            <small>
              Your current balance in this group
            </small>

          </div>


          <div className="group-summary-card">

            <span>
              Total Group Spending
            </span>

            <strong>
              ₹{group.totalSpent.toLocaleString('en-IN')}
            </strong>

            <small>
              Across {group.members} members
            </small>

          </div>


          <div className="group-summary-card">

            <span>
              Members
            </span>

            <strong>
              {group.members}
            </strong>

            <small>
              People in this group
            </small>

          </div>

        </section>


        {/* ================================
            EXPENSES
        ================================= */}

        <section className="group-section">

          <div className="group-section-header">

            <div>
              <h2>Expenses</h2>

              <p>
                Recent expenses in this group
              </p>
            </div>

            <button
              className="section-action"
              onClick={() => alert('Add Expense coming next!')}
            >
              + Add Expense
            </button>

          </div>


          <div className="expense-list">

            {expenses.map((expense) => (

              <div
                className="expense-item"
                key={expense.id}
              >

                <div className="expense-icon">
                  {expense.icon}
                </div>


                <div className="expense-info">

                  <strong>
                    {expense.title}
                  </strong>

                  <span>
                    Paid by {expense.paidBy} · {expense.date}
                  </span>

                </div>


                <div className="expense-amount">
                  ₹{expense.amount.toLocaleString('en-IN')}
                </div>

              </div>

            ))}

          </div>

        </section>


        {/* ================================
            MEMBERS
        ================================= */}

        <section className="group-section">

          <div className="group-section-header">

            <div>
              <h2>Members</h2>

              <p>
                {group.members} people in this group
              </p>
            </div>

            <button
              className="section-action"
              onClick={() => setShowMembers(!showMembers)}
            >
              {showMembers ? 'Hide Details' : 'View Details'}
            </button>

          </div>


          <div className="members-list">

            {members.map((member) => (

              <div
                className="member-item"
                key={member.id}
              >

                <div className="member-avatar">
                  {member.name.charAt(0).toUpperCase()}
                </div>


                <div className="member-info">

                  <strong>
                    {member.name}

                    {member.isYou && (
                      <span className="you-badge">
                        You
                      </span>
                    )}

                  </strong>

                  {showMembers && (
                    <span>
                      Group member
                    </span>
                  )}

                </div>


                <div
                  className={
                    member.balance < 0
                      ? 'member-balance negative'
                      : member.balance > 0
                      ? 'member-balance positive'
                      : 'member-balance settled'
                  }
                >

                  {member.balance < 0
                    ? `Owes ₹${Math.abs(member.balance)}`
                    : member.balance > 0
                    ? `Gets ₹${member.balance}`
                    : 'Settled'}

                </div>

              </div>

            ))}

          </div>

        </section>


      </main>

    </div>
  );
}

export default GroupDetails;