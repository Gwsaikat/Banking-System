import { useState, useEffect } from 'react';
import { getAllUsersAPI, toggleUserStatusAPI, deleteUserAPI, resetDatabaseAPI } from '../api';
import { Users, Search, Shield, Ban, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsersAPI();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleUserStatusAPI(id);
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user and all associated accounts/transactions/loans? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteUserAPI(id);
      toast.success('User and all associated records deleted');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleResetSystem = async () => {
    if (confirmText !== 'delete') {
      toast.error("Please type 'delete' to confirm");
      return;
    }

    setResetting(true);
    try {
      await resetDatabaseAPI();
      toast.success('Database has been reset successfully!');
      setShowResetModal(false);
      setConfirmText('');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset database');
    } finally {
      setResetting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="page-enter">
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">View and manage all registered users</p>
        </div>
        <button 
          className="btn btn-danger" 
          onClick={() => setShowResetModal(true)}
          style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
        >
          <Trash2 size={16} /> Reset System
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dark-400)' }} />
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '40px' }} 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td data-label="User">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="sidebar-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--dark-50)' }}>{user.firstName} {user.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Contact">
                    <div style={{ fontSize: '0.85rem' }}>{user.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--dark-500)' }}>{user.phone || 'No phone'}</div>
                  </td>
                  <td data-label="Role">
                    <span className={`badge ${user.role === 'admin' ? 'info' : 'neutral'}`}>
                      {user.role === 'admin' && <Shield size={12} style={{ marginRight: '4px' }} />}
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`badge ${user.isActive ? 'success' : 'danger'}`}>
                      {user.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td data-label="Joined">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td data-label="Actions">
                    {user.role !== 'admin' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleStatus(user._id)}
                        >
                          {user.isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <Users />
              <h3>No users found</h3>
              <p>Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => {
          setShowResetModal(false);
          setConfirmText('');
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              <Trash2 size={20} /> Reset Everything?
            </h2>
            <p className="modal-description">
              Are you sure? This will delete all users (except you), accounts, loans, and transactions permanently. This action cannot be undone.
            </p>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>
                Type "delete" to confirm:
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '10px', marginTop: '6px' }}
                placeholder="delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowResetModal(false);
                  setConfirmText('');
                }}
                disabled={resetting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                style={{ 
                  background: confirmText === 'delete' ? 'var(--danger)' : 'rgba(239, 68, 68, 0.2)', 
                  borderColor: 'transparent',
                  color: confirmText === 'delete' ? 'white' : 'var(--dark-400)'
                }}
                onClick={handleResetSystem}
                disabled={confirmText !== 'delete' || resetting}
              >
                {resetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
