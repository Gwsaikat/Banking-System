import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Loans from './pages/Loans';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminTransactions from './pages/AdminTransactions';
import AdminLoans from './pages/AdminLoans';
import AiChat from './pages/AiChat';
import Documents from './pages/Documents';

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ 
          style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(148,163,184,0.1)' }
        }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute><AppLayout><Accounts /></AppLayout></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><AppLayout><Transactions /></AppLayout></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><AppLayout><Loans /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
          <Route path="/ai-chat" element={<ProtectedRoute><AppLayout><AiChat /></AppLayout></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><AppLayout><Documents /></AppLayout></ProtectedRoute>} />

          {/* Protected Admin Routes */}
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><AppLayout><AdminUsers /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/transactions" element={<ProtectedRoute adminOnly><AppLayout><AdminTransactions /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/loans" element={<ProtectedRoute adminOnly><AppLayout><AdminLoans /></AppLayout></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
