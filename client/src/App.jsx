import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/admin/Login';

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<Navigate to="/admin/votes" replace />} />
    </Routes>
  );
}

export default App;