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
    console.log(`Changing ${name} to: ${value}`); // Debug input change
    setNewUser((prevState) => {
      const updatedState = { ...prevState, [name]: value };
      console.log('Updated newUser state:', updatedState); // Debug updated state
      return updatedState;
    });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUser.full_name.trim()) return 'Full name is required.';
    if (!emailRegex.test(newUser.email)) return 'Please enter a valid email address.';
    if (newUser.password.length < 6) return 'Password must be at least 6 characters long.';
    return '';
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('http://localhost:5000/admin/users', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status === 'success') {
        navigate('/admin/users');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user.');
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  };

  console.log('Rendering AddUser with newUser:', newUser); // Debug render

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
            placeholder="" // Ensure no placeholder is set
            style={{ color: '#000', backgroundColor: '#fff' }} // Ensure visibility
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
            placeholder="" // Ensure no placeholder is set
            style={{ color: '#000', backgroundColor: '#fff' }} // Ensure visibility
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
            placeholder="" // Ensure no placeholder is set
            style={{ color: '#000', backgroundColor: '#fff' }} // Ensure visibility
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