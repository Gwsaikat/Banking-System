import { useState, useEffect } from 'react';
import { getAccountsAPI, createAccountAPI, getAccountDetailsAPI } from '../api';
import { Wallet, Plus, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState('savings');
  const [creating, setCreating] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data } = await getAccountsAPI();
      setAccounts(data);
    } catch (error) {
      toast.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createAccountAPI({ accountType: createType });
      toast.success('Account created successfully!');
      setShowCreate(false);
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const viewDetails = async (account) => {
    setSelectedAccount(account);
    setDetailsLoading(true);
    try {
      const { data } = await getAccountDetailsAPI(account._id);
      setAccountDetails(data);
    } catch (error) {
      toast.error('Failed to fetch account details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div className="page-enter">
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">Manage your bank accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} /> New Account
        </button>
      </div>

      {/* Account Cards */}
      <div className="balance-cards">
        {accounts.map((account, index) => (
          <div
            key={account._id}
            className={`balance-card ${index % 2 !== 0 ? 'secondary' : ''}`}
            onClick={() => viewDetails(account)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div className="balance-card-type">{account.accountType} Account</div>
              <span className={`badge ${account.isActive ? 'success' : 'danger'}`}>
                {account.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="balance-card-number">{account.accountNumber}</div>
            <div className="balance-card-amount">{formatCurrency(account.balance)}</div>
            <div className="balance-card-label">Available Balance • Created {formatDate(account.createdAt)}</div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <Wallet />
            <h3>No accounts yet</h3>
            <p>Create your first bank account to get started</p>
            <button className="btn btn-primary mt-16" onClick={() => setShowCreate(true)}>
              <Plus size={18} /> Create Account
            </button>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Account</h3>
              <button className="btn-icon" onClick={() => setShowCreate(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select
                  className="form-input"
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value)}
                >
                  <option value="savings">Savings Account</option>
                  <option value="checking">Checking Account</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      {selectedAccount && (
        <div className="modal-overlay" onClick={() => { setSelectedAccount(null); setAccountDetails(null); }}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Account Details</h3>
              <button className="btn-icon" onClick={() => { setSelectedAccount(null); setAccountDetails(null); }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {detailsLoading ? (
                <div className="loading-container"><div className="spinner" /></div>
              ) : accountDetails ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                      <div className="form-label">Account Number</div>
                      <div style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{accountDetails.account.accountNumber}</div>
                    </div>
                    <div>
                      <div className="form-label">Type</div>
                      <div style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{accountDetails.account.accountType}</div>
                    </div>
                    <div>
                      <div className="form-label">Balance</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(accountDetails.account.balance)}</div>
                    </div>
                    <div>
                      <div className="form-label">Created</div>
                      <div style={{ fontSize: '0.9rem' }}>{formatDate(accountDetails.account.createdAt)}</div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: 'var(--dark-300)' }}>Recent Transactions</h4>
                  {accountDetails.transactions.length > 0 ? (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Balance After</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accountDetails.transactions.map((txn) => (
                            <tr key={txn._id}>
                              <td><span className={`badge ${txn.type === 'deposit' ? 'success' : txn.type === 'withdrawal' ? 'danger' : 'info'}`}>{txn.type}</span></td>
                              <td className={`txn-amount ${txn.type === 'deposit' ? 'positive' : 'negative'}`}>
                                {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                              </td>
                              <td>{formatCurrency(txn.balanceAfter)}</td>
                              <td>{formatDate(txn.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--dark-500)', fontSize: '0.85rem' }}>No transactions yet</p>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
