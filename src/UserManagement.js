import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserManagement.css'; // Ensure this CSS file is created

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('No token found. Please log in.');
        navigate('/admin/login');
        return;
      }
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response:', response.data);
      if (response.data.status === 'success') {
        setUsers(response.data.data.users || []);
      } else {
        throw new Error('Failed to fetch users.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch users.';
      setError(message);
      toast.error(message);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, API_URL]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User deleted successfully.');
      await fetchUsers();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete user.';
      setError(message);
      toast.error(message);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  return (
    <div className="app-container">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Sidebar */}
      <nav className={`sidebar ${isNavbarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button
            className="toggle-btn"
            onClick={() => setIsNavbarOpen(!isNavbarOpen)}
          >
            ☰
          </button>
          <h3 className="sidebar-title">MindEase</h3>
        </div>
        <div className="sidebar-links">
          <button
            className="nav-link"
            onClick={() => navigate('/admin/users')}
            disabled={window.location.pathname === '/admin/users'}
          >
            <span className="nav-icon">👤</span>
            <span>User Management</span>
          </button>
          <button
            className="nav-link"
            onClick={() => navigate('/admin/alerts')}
            disabled={window.location.pathname === '/admin/alerts'}
          >
            <span className="nav-icon">🔔</span>
            <span>Manage Alerts</span>
          </button>
        </div>
        <div className="sidebar-footer" />
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="management-card">
          <h1 className="management-title">MindEase User Management</h1>
          <p className="management-subtitle">Manage your users efficiently.</p>
          <div className="controls-container">
            <div className="button-group">
              <button
                onClick={() => navigate('/admin/users/add')}
                className="action-button add-user"
              >
                Add User
              </button>
            </div>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <span>Loading users...</span>
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          {!loading && filteredUsers.length === 0 && !error && (
            <p className="no-data">No users found.</p>
          )}
          {filteredUsers.length > 0 && (
            <div className="table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="table-row">
                      <td>{user.id}</td>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>{user.created_at}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/admin/chats/${user.id}`)}
                          className="action-button view-chats"
                        >
                          View Chats
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="action-button delete-user"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button
            className="logout-button"
            onClick={() => {
              localStorage.removeItem('adminToken');
              toast.info('Logged out successfully.');
              navigate('/admin/login');
            }}
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;