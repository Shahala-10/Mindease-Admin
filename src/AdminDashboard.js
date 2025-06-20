import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000';

  // Memoize fetchUsers to prevent unnecessary re-renders
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No token found. Please log in.');
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.data.status !== 'success') {
        throw new Error('Failed to fetch users.');
      }

      setUsers(response.data.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      if (err.response?.status === 401) {
        setError('Invalid token. Please log in again.');
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, API_URL]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, navigate, API_URL]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const newUser = {
        full_name: prompt('Enter full name:'),
        email: prompt('Enter email:'),
        password: prompt('Enter password:'),
      };
      if (newUser.full_name && newUser.email && newUser.password) {
        const response = await axios.post(`${API_URL}/admin/users`, newUser, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.data.status === 'success') {
          fetchUsers(); // Refresh list after adding
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user.');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API_URL}/admin/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        fetchUsers(); // Refresh list after removal
      } catch (err) {
        setError('Failed to remove user. Please try again.');
      }
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>MindEase User Management</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={handleAddUser}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Add User
        </button>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
      {loading && <p style={{ textAlign: 'center', color: '#007bff' }}>Loading users...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
      {users.length === 0 && !loading && !error && (
        <p style={{ textAlign: 'center', color: '#555' }}>No users found.</p>
      )}
      {users.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Full Name</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Created At</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ border: '1px solid #ddd' }}>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.full_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.created_at}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <Link
                      to={`/admin/chats/${user.id}`}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#17a2b8',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        textAlign: 'center',
                      }}
                    >
                      View Chats
                    </Link>
                    <Link
                      to={`/admin/analytics/${user.id}`}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#17a2b8',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        textAlign: 'center',
                      }}
                    >
                      View Analytics
                    </Link>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;