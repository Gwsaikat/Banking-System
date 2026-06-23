import { useState, useEffect } from 'react';
import { getAllTransactionsAPI } from '../api';
import { BarChart3, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await getAllTransactionsAPI({ page, limit: 20 });
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="page-enter">
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Global Transactions</h1>
          <p className="page-subtitle">Monitor all platform transactions</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>User</th>
                    <th>Account</th>
                    <th>Reference</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(txn => (
                    <tr key={txn._id}>
                      <td>
                        <span className={`badge ${txn.type === 'deposit' ? 'success' : txn.type === 'withdrawal' ? 'danger' : 'info'}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className={`txn-amount ${txn.type === 'deposit' ? 'positive' : 'negative'}`}>
                        {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                      <td>
                        {txn.account?.user ? (
                          <>
                            <div style={{ fontWeight: 500 }}>{txn.account.user.firstName} {txn.account.user.lastName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--dark-500)' }}>{txn.account.user.email}</div>
                          </>
                        ) : 'System'}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{txn.account?.accountNumber || '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--dark-500)' }}>{txn.referenceId}</td>
                      <td>{new Date(txn.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--dark-400)' }}>
                  Page {page} of {totalPages}
                </span>
                <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
