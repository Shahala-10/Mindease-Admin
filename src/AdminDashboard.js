import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchUsers = async () => {
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
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.data.status !== 'success') {
          throw new Error('Failed to fetch users.');
        }

        setUsers(response.data.data.users);
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
    };

    fetchUsers();
  }, [navigate, API_URL]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Admin Dashboard - MindEase</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
        <Link 
          to="/admin/users" 
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        >
          User Management
        </Link>
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
      <h3 style={{ marginTop: '30px', color: '#333' }}>Users Overview</h3>
      {!loading && users.length === 0 && !error && (
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
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ border: '1px solid #ddd' }}>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.full_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;