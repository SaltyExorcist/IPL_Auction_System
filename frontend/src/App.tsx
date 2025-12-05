import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/DashBoard';
import { AuctionRoom } from './features/auction/AuctionRoom';
import { AdminPanel } from './features/admin/AdminPanel'; // Ensure this file exists from previous step

// 1. Protection Wrapper
const ProtectedRoute = ({ children }: { children: any }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 2. Admin Wrapper
const AdminRoute = ({ children }: { children: any }) => {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes inside AppShell */}
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auction" element={<AuctionRoom />} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;