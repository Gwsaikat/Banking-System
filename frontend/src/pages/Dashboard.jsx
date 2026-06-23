import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAccountsAPI, getTransactionsAPI } from '../api';
import { Wallet, ArrowLeftRight, TrendingUp, DollarSign, ArrowDownLeft, ArrowUpRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accRes, txnRes] = await Promise.all([
        getAccountsAPI(),
        getTransactionsAPI({ limit: 10 }),
      ]);
      setAccounts(accRes.data);
      setTransactions(txnRes.data.transactions);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Build chart data from transactions
  const chartData = [...transactions]
    .reverse()
    .map((txn) => ({
      date: new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: txn.balanceAfter,
    }));

  const getTxnIcon = (type) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft size={18} />;
      case 'withdrawal': return <ArrowUpRight size={18} />;
      case 'transfer': return <ArrowRight size={18} />;
      default: return <DollarSign size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName}
        </h1>
        <p className="page-subtitle">Here's your financial overview</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Balance</div>
            <div className="stat-value">{formatCurrency(totalBalance)}</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon green">
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Accounts</div>
            <div className="stat-value">{accounts.length}</div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon purple">
            <ArrowLeftRight size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Transactions</div>
            <div className="stat-value">{transactions.length}</div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon orange">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Last Activity</div>
            <div className="stat-value" style={{ fontSize: '1rem' }}>
              {transactions.length > 0 ? formatDate(transactions[0].createdAt) : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="balance-cards">
        {accounts.map((account, index) => (
          <Link to={`/accounts`} key={account._id}>
            <div className={`balance-card ${index % 2 !== 0 ? 'secondary' : ''}`}>
              <div className="balance-card-type">{account.accountType} Account</div>
              <div className="balance-card-number">{account.accountNumber}</div>
              <div className="balance-card-amount">{formatCurrency(account.balance)}</div>
              <div className="balance-card-label">Available Balance</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid-2">
        {/* Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Balance Trend</h3>
          </div>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066e6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0066e6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid rgba(148,163,184,0.1)',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value) => [formatCurrency(value), 'Balance']}
                />
                <Area type="monotone" dataKey="amount" stroke="#0066e6" fill="url(#balanceGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <TrendingUp />
              <h3>No chart data yet</h3>
              <p>Make some transactions to see your balance trend</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Transactions</h3>
            <Link to="/transactions" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {transactions.length > 0 ? (
            <div>
              {transactions.slice(0, 5).map((txn) => (
                <div
                  key={txn._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(148,163,184,0.06)',
                  }}
                >
                  <div className={`txn-icon ${txn.type}`}>
                    {getTxnIcon(txn.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--dark-100)' }}>
                      {txn.description || txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--dark-500)' }}>
                      {formatDate(txn.createdAt)}
                    </div>
                  </div>
                  <div className={`txn-amount ${txn.type === 'deposit' ? 'positive' : 'negative'}`}>
                    {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ArrowLeftRight />
              <h3>No transactions yet</h3>
              <p>Start by making a deposit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
