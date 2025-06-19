import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import ChatMonitoring from './ChatMonitoring';
import Analytics from './Analytics';
import AddUser from './AddUser'; // Import the new component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/users/add" element={<AddUser />} /> {/* New route */}
        <Route path="/admin/chats/:userId" element={<ChatMonitoring />} />
        <Route path="/admin/analytics/:userId" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App;