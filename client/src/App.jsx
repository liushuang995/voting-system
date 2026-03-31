import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import VoteList from './pages/admin/VoteList';
import VoteCreate from './pages/admin/VoteCreate';
import VoteResults from './pages/admin/VoteResults';
import VoteEdit from './pages/admin/VoteEdit';
import VotePage from './pages/vote/VotePage';
import VoterLogin from './pages/vote/VoterLogin';
import Whitelist from './pages/admin/Whitelist';
import SuperAdmins from './pages/admin/SuperAdmins';
import AdminLayout from './components/Layout';

// 管理员路由保护组件
function RequireAdmin({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  try {
    JSON.parse(atob(token.split('.')[1]));
    return children;
  } catch (e) {
    localStorage.removeItem('token');
    return <Navigate to="/admin/login" replace />;
  }
}

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={
        <RequireAdmin>
          <AdminLayout />
        </RequireAdmin>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="votes" element={<VoteList />} />
        <Route path="votes/create" element={<VoteCreate />} />
        <Route path="votes/:id/results" element={<VoteResults />} />
        <Route path="votes/:id/edit" element={<VoteEdit />} />
        <Route path="whitelist" element={<Whitelist />} />
        <Route path="super-admins" element={<SuperAdmins />} />
      </Route>
      <Route path="/vote/:shareUrl" element={<VotePage />} />
      <Route path="/vote/login" element={<VoterLogin />} />
      <Route path="/" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;