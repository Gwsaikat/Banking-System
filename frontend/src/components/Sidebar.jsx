import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Landmark,
  Users,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Bot,
  FileText,
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const userLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/accounts', icon: Wallet, label: 'Accounts' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { to: '/loans', icon: Landmark, label: 'Loans' },
    { to: '/ai-chat', icon: Bot, label: 'Ask Your Money' },
    { to: '/documents', icon: FileText, label: 'Documents' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/transactions', icon: BarChart3, label: 'All Transactions' },
    { to: '/admin/loans', icon: Landmark, label: 'Loan Requests' },
  ];

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return user.firstName[0] + user.lastName[0];
    }
    return 'U';
  };

  const handleLogout = () => {
    logout();
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-icon" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>NexusBank</span>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={closeMobile}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Shield size={22} />
          </div>
          <h1>NexusBank</h1>
          <button
            className="btn-icon"
            onClick={closeMobile}
            style={{ marginLeft: 'auto', display: mobileOpen ? 'block' : 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Main</div>
          {userLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMobile}
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="sidebar-section-title" style={{ marginTop: '16px' }}>
                Admin
              </div>
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeMobile}
                >
                  <link.icon size={20} />
                  {link.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
            <button className="sidebar-logout" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
