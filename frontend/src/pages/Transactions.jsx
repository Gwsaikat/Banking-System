import { useState, useEffect } from 'react';
import { getAccountsAPI, getTransactionsAPI, depositAPI, withdrawAPI, transferAPI } from '../api';
import { ArrowDownLeft, ArrowUpRight, ArrowRight, DollarSign, X, Send, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [filterAccount, setFilterAccount] = useState('');

  // Modal state
  const [modal, setModal] = useState(null); // 'deposit' | 'withdraw' | 'transfer'
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    description: '',
    toAccountNumber: '',
    fromAccountId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, filterType, filterAccount]);

  const fetchAccounts = async () => {
    try {
      const { data } = await getAccountsAPI();
      setAccounts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filterType) params.type = filterType;
      if (filterAccount) params.accountId = filterAccount;
      const { data } = await getTransactionsAPI(params);
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      if (modal === 'deposit') {
        await depositAPI({
          accountId: formData.accountId,
          amount: parseFloat(formData.amount),
          description: formData.description,
        });
        toast.success('Deposit successful!');
      } else if (modal === 'withdraw') {
        await withdrawAPI({
          accountId: formData.accountId,
          amount: parseFloat(formData.amount),
          description: formData.description,
        });
        toast.success('Withdrawal successful!');
      } else if (modal === 'transfer') {
        if (!formData.toAccountNumber) {
          toast.error('Please enter destination account number');
          setSubmitting(false);
          return;
        }
        await transferAPI({
          fromAccountId: formData.fromAccountId,
          toAccountNumber: formData.toAccountNumber,
          amount: parseFloat(formData.amount),
          description: formData.description,
        });
        toast.success('Transfer successful!');
      }
      setModal(null);
      resetForm();
      fetchTransactions();
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (type) => {
    setModal(type);
    setFormData({
      accountId: accounts[0]?._id || '',
      amount: '',
      description: '',
      toAccountNumber: '',
      fromAccountId: accounts[0]?._id || '',
    });
  };

  const resetForm = () => {
    setFormData({ accountId: '', amount: '', description: '', toAccountNumber: '', fromAccountId: '' });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getTxnIcon = (type) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft size={18} />;
      case 'withdrawal': return <ArrowUpRight size={18} />;
      case 'transfer': return <ArrowRight size={18} />;
      default: return <DollarSign size={18} />;
    }
  };

  return (
    <div className="page-enter">
      <div className="flex-between" style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Manage your money</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-success btn-sm" onClick={() => openModal('deposit')}>
            <Download size={16} /> Deposit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => openModal('withdraw')}>
            <Upload size={16} /> Withdraw
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => openModal('transfer')}>
            <Send size={16} /> Transfer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label className="form-label">Type</label>
            <select className="form-input" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="transfer">Transfers</option>
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label">Account</label>
            <select className="form-input" value={filterAccount} onChange={(e) => { setFilterAccount(e.target.value); setPage(1); }}>
              <option value="">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.accountNumber} ({acc.accountType})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : transactions.length > 0 ? (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Account</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Reference</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn._id}>
                      <td data-label="Type">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className={`txn-icon ${txn.type}`}>{getTxnIcon(txn.type)}</div>
                          <span style={{ textTransform: 'capitalize' }}>{txn.type}</span>
                        </div>
                      </td>
                      <td data-label="Description">{txn.description || '—'}</td>
                      <td data-label="Account" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {txn.account?.accountNumber || '—'}
                      </td>
                      <td data-label="Amount" className={`txn-amount ${txn.type === 'deposit' ? 'positive' : 'negative'}`}>
                        {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                      <td data-label="Balance After">{formatCurrency(txn.balanceAfter)}</td>
                      <td data-label="Reference" style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--dark-500)' }}>
                        {txn.referenceId}
                      </td>
                      <td data-label="Date">{formatDate(txn.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--dark-400)' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <ArrowDownLeft />
            <h3>No transactions found</h3>
            <p>Start by making a deposit into one of your accounts</p>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ textTransform: 'capitalize' }}>{modal}</h3>
              <button className="btn-icon" onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {modal === 'transfer' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">From Account</label>
                    <select
                      className="form-input"
                      value={formData.fromAccountId}
                      onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
                    >
                      {accounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.accountNumber} — {formatCurrency(acc.balance)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">To Account Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter destination account number"
                      value={formData.toAccountNumber}
                      onChange={(e) => setFormData({ ...formData, toAccountNumber: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label">Account</label>
                  <select
                    className="form-input"
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  >
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.accountNumber} — {formatCurrency(acc.balance)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="What's this for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button
                className={`btn ${modal === 'deposit' ? 'btn-success' : modal === 'withdraw' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : `Confirm ${modal.charAt(0).toUpperCase() + modal.slice(1)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
