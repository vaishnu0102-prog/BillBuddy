import Navbar from '../components/Navbar';

function Landing() {
  return (
    <div>
      <Navbar />

      <main>
        <section>
          <p>SMART EXPENSE MANAGEMENT</p>

          <h1>
            Split expenses.
            <br />
            Without the headache.
          </h1>

          <p>
            BillBuddy makes shared expenses simple.
            Create groups, split bills, track balances,
            and settle up without complicated calculations.
          </p>

          <button>Get Started</button>
          <button>See How It Works</button>
        </section>
      </main>
    </div>
  );
}

export default Landing;