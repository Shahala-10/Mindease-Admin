import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './AdminLogin';

import UserManagement from './UserManagement';
import ChatMonitoring from './ChatMonitoring';

import AddUser from './AddUser'; // Import the new component
import EmergencyAlertManagement from './EmergencyAlertManagement';
function App() {
  return (
    <Router>
      <Routes>

  <Route path="/" element={<AdminLogin />} /> {/* optional default route */}
  <Route path="/admin/login" element={<AdminLogin />} />

  <Route path="/admin/users" element={<UserManagement />} />
  <Route path="/admin/users/add" element={<AddUser />} />
  <Route path="/admin/chats/:userId" element={<ChatMonitoring />} />
  
  <Route path="/admin/alerts" element={<EmergencyAlertManagement />} />

      </Routes>
    </Router>
  );
}

export default App;