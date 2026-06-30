import { useState, useEffect } from 'react';
import { getAllLoansAPI, approveLoanAPI, rejectLoanAPI } from '../api';
import { Landmark, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchLoans();
  }, [filter]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const { data } = await getAllLoansAPI({ status: filter !== 'all' ? filter : undefined });
      setLoans(data);
    } catch (error) {
      toast.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this loan? Funds will be disbursed immediately.')) return;
    try {
      await approveLoanAPI(id);
      toast.success('Loan approved and funds disbursed');
      fetchLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve loan');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter reason for rejection (optional):');
    if (reason === null) return; // User cancelled
    try {
      await rejectLoanAPI(id, { reason });
      toast.success('Loan rejected');
      fetchLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject loan');
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="page-enter">
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Loan Requests</h1>
          <p className="page-subtitle">Review and process user loan applications</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <select className="form-input" style={{ maxWidth: '200px' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="pending">Pending Only</option>
            <option value="all">All Loans</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
           <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Term & Rate</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan._id}>
                    <td data-label="User">
                      <div style={{ fontWeight: 500 }}>{loan.user?.firstName} {loan.user?.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--dark-500)' }}>{loan.user?.email}</div>
                    </td>
                    <td data-label="Amount" style={{ fontWeight: 600 }}>{formatCurrency(loan.amount)}</td>
                    <td data-label="Term & Rate">
                      <div>{loan.termMonths} mos</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--dark-500)' }}>{loan.interestRate}% APR</div>
                    </td>
                    <td data-label="Purpose" style={{ maxWidth: '200px' }} className="text-truncate">{loan.purpose}</td>
                    <td data-label="Status">
                      <span className={`badge ${loan.status === 'pending' ? 'warning' : loan.status === 'approved' ? 'success' : loan.status === 'rejected' ? 'danger' : 'neutral'}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      {loan.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-sm btn-success" onClick={() => handleApprove(loan._id)} title="Approve">
                            <Check size={16} />
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleReject(loan._id)} title="Reject">
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loans.length === 0 && (
              <div className="empty-state">
                <Landmark />
                <h3>No loans found</h3>
                <p>There are no loans matching the current filter</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLoans;
