import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddUser.css';

const AddUser = () => {
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('http://localhost:5000/admin/users', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/admin/users'); // Navigate back to user management page
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user.');
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  };

  return (
    <div className="add-user-page">
      <h2>Add New User - MindEase</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleAddUser} className="add-user-form">
        <div className="form-group">
          <label htmlFor="full_name">Full Name:</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={newUser.full_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={newUser.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={newUser.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit" className="add-user-btn">
            Add User
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/admin/users')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;