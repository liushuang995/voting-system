import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import VoteList from './pages/admin/VoteList';
import VoteCreate from './pages/admin/VoteCreate';
import VoteResults from './pages/admin/VoteResults';
import AdminLayout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="votes" element={<VoteList />} />
        <Route path="votes/create" element={<VoteCreate />} />
        <Route path="votes/:id/results" element={<VoteResults />} />
      </Route>
      <Route path="/" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;