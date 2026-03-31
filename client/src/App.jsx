import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/admin/Login';
import AdminLayout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="votes" replace />} />
      </Route>
      <Route path="/" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;