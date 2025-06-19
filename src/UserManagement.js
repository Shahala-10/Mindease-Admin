import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users.');
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [navigate, fetchUsers]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsers(); // Refresh user list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  };

  return (
    <div className="user-management-page">
      <h2>MindEase User Management</h2>
      <div className="add-user-button-container">
        <button
          onClick={() => navigate('/admin/users/add')}
          className="add-user-btn"
        >
          Add User
        </button>
      </div>
      {loading && (
        <div className="loading-container">
          <span className="loading-spinner"></span>
          <p>Loading users...</p>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
      {!loading && users.length === 0 && !error && (
        <p className="no-users">No users found.</p>
      )}
      {users.length > 0 && (
        <div className="table-container">
          <table>
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
              {users.map((user) => (
                <tr key={user.id} className="user-row">
                  <td>{user.id}</td>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>{user.created_at}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/admin/chats/${user.id}`)}
                      className="action-btn view-chats"
                      aria-label={`View chats for ${user.full_name}`}
                    >
                      View Chats
                    </button>
                    <button
                      onClick={() => navigate(`/admin/analytics/${user.id}`)}
                      className="action-btn view-analytics"
                      aria-label={`View analytics for ${user.full_name}`}
                    >
                      View Analytics
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="action-btn delete-user"
                      aria-label={`Delete ${user.full_name}`}
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
      <div className="logout-container">
        <button
          onClick={() => {
            localStorage.removeItem('adminToken');
            navigate('/admin/login');
          }}
          className="logout-btn"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserManagement;