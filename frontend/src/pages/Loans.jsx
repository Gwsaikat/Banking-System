import { useState, useEffect } from 'react';
import { getAccountsAPI, getLoansAPI, applyLoanAPI } from '../api';
import { Landmark, Plus, X, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const Loans = () => {
  const [accounts, setAccounts] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    termMonths: '12',
    purpose: '',
    interestRate: '5.5',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accRes, loanRes] = await Promise.all([
        getAccountsAPI(),
        getLoansAPI(),
      ]);
      setAccounts(accRes.data);
      setLoans(loanRes.data);
      if (accRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, accountId: accRes.data[0]._id }));
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!formData.amount || !formData.purpose || !formData.accountId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await applyLoanAPI({
        accountId: formData.accountId,
        amount: parseFloat(formData.amount),
        termMonths: parseInt(formData.termMonths),
        purpose: formData.purpose,
        interestRate: parseFloat(formData.interestRate),
      });
      toast.success('Loan application submitted!');
      setShowApply(false);
      setFormData({ accountId: accounts[0]?._id || '', amount: '', termMonths: '12', purpose: '', interestRate: '5.5' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply for loan');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': case 'active': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'paid': return <DollarSign size={16} />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      active: 'info',
      paid: 'success',
    };
    return map[status] || 'neutral';
  };

  // Calculate preview monthly payment
  const previewMonthly = () => {
    const amount = parseFloat(formData.amount) || 0;
    const rate = parseFloat(formData.interestRate) / 100 / 12;
    const term = parseInt(formData.termMonths) || 12;
    if (rate === 0) return amount / term;
    const payment = (amount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    return payment;
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div className="page-enter">
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Loans</h1>
          <p className="page-subtitle">Apply and manage your loans</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowApply(true)}>
          <Plus size={18} /> Apply for Loan
        </button>
      </div>

      {/* Loan Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue"><Landmark size={24} /></div>
          <div className="stat-info">
            <div className="stat-label">Total Loans</div>
            <div className="stat-value">{loans.length}</div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange"><Clock size={24} /></div>
          <div className="stat-info">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{loans.filter((l) => l.status === 'pending').length}</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{loans.filter((l) => l.status === 'approved' || l.status === 'active').length}</div>
          </div>
        </div>
      </div>

      {/* Loan List */}
      {loans.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Your Loan Applications</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Interest Rate</th>
                  <th>Term</th>
                  <th>Monthly Payment</th>
                  <th>Purpose</th>
                  <th>Account</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan._id}>
                    <td>
                      <span className={`badge ${getStatusBadge(loan.status)}`}>
                        {getStatusIcon(loan.status)} <span style={{ marginLeft: '4px' }}>{loan.status}</span>
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(loan.amount)}</td>
                    <td>{loan.interestRate}%</td>
                    <td>{loan.termMonths} months</td>
                    <td>{formatCurrency(loan.monthlyPayment)}</td>
                    <td style={{ maxWidth: '200px' }} className="text-truncate">{loan.purpose}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{loan.account?.accountNumber || '—'}</td>
                    <td>{formatDate(loan.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <Landmark />
            <h3>No loans yet</h3>
            <p>Apply for your first loan to get started</p>
          </div>
        </div>
      )}

      {/* Apply Loan Modal */}
      {showApply && (
        <div className="modal-overlay" onClick={() => setShowApply(false)}>
          <div className="modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Apply for a Loan</h3>
              <button className="btn-icon" onClick={() => setShowApply(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Deposit Account</label>
                <select
                  className="form-input"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountNumber} ({acc.accountType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Loan Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="10000"
                    min="100"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Interest Rate (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="5.5"
                    min="0"
                    max="30"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Term (Months)</label>
                <select
                  className="form-input"
                  value={formData.termMonths}
                  onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
                >
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                  <option value="48">48 months</option>
                  <option value="60">60 months</option>
                  <option value="120">120 months</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Purpose</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="What will the loan be used for?"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                />
              </div>

              {formData.amount && (
                <div
                  style={{
                    background: 'rgba(0, 102, 230, 0.08)',
                    border: '1px solid rgba(0, 102, 230, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--dark-400)', marginBottom: '4px' }}>
                    Estimated Monthly Payment
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                    {formatCurrency(previewMonthly())}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowApply(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleApply} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
