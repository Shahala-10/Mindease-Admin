import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EmergencyAlertManagement.css';

const EmergencyAlertManagement = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000';
  const token = localStorage.getItem('adminToken');

  const fetchUsers = useCallback(async () => {
    try {
      if (!token) {
        toast.error('No token found. Please log in.');
        navigate('/admin/login');
        return;
      }
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status === 'success') {
        setUsers(response.data.data.users || []);
      } else {
        throw new Error('Failed to fetch users.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch users.';
      toast.error(message);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  }, [navigate, API_URL, token]);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!token) {
        toast.error('No token found. Please log in.');
        navigate('/admin/login');
        return;
      }
      const url = selectedUserId === 'all'
        ? `${API_URL}/admin/emergency_alerts`
        : `${API_URL}/admin/users/${selectedUserId}/emergency_alerts`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status === 'success') {
        setAlerts(response.data.data.alerts || []);
      } else {
        throw new Error('Failed to fetch alerts.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred while fetching alerts.';
      setError(message);
      toast.error(message);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, API_URL, token, selectedUserId]);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!token || selectedUserId === 'all') {
        setContacts([]);
        return;
      }
      const response = await axios.get(`${API_URL}/admin/users/${selectedUserId}/emergency_contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status === 'success') {
        setContacts(response.data.data.contacts || []);
      } else {
        throw new Error('Failed to fetch contacts.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred while fetching contacts.';
      setError(message);
      toast.error(message);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, API_URL, token, selectedUserId]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    const formData = {
      contact_name: e.target.contact_name.value,
      phone_number: e.target.phone_number.value,
      email: e.target.email.value,
      relationship: e.target.relationship.value,
    };
    try {
      const response = await axios.post(`${API_URL}/admin/users/${selectedUserId}/emergency_contacts`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.data.status === 'success') {
        toast.success('Contact added successfully');
        setShowAddForm(false);
        fetchContacts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add contact');
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    const formData = {
      contact_name: e.target.contact_name.value,
      phone_number: e.target.phone_number.value,
      email: e.target.email.value,
      relationship: e.target.relationship.value,
    };
    try {
      const response = await axios.put(`${API_URL}/admin/users/${selectedUserId}/emergency_contacts/${editContact.id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.data.status === 'success') {
        toast.success('Contact updated successfully');
        setEditContact(null);
        fetchContacts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update contact');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await axios.delete(`${API_URL}/admin/users/${selectedUserId}/emergency_contacts/${contactId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Contact deleted successfully');
        fetchContacts();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete contact');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (activeTab === 'alerts') fetchAlerts();
    else fetchContacts();
  }, [fetchAlerts, fetchContacts, activeTab, selectedUserId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedUserId('all');
    setShowAddForm(false);
    setEditContact(null);
  };

  const handleUserChange = (e) => {
    setSelectedUserId(e.target.value);
  };

  return (
    <div className="alert-management-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Emergency Alerts & Contacts Management</h2>
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => handleTabChange('alerts')}
        >
          Emergency Alerts
        </button>
        <button
          className={`tab-button ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => handleTabChange('contacts')}
        >
          Manage Emergency Contacts
        </button>
      </div>
      <div className="controls-container">
        <div className="filter-container">
          <label htmlFor="user-select" className="filter-label">
            Filter by User:
          </label>
          <select
            id="user-select"
            value={selectedUserId}
            onChange={handleUserChange}
            className="user-select"
            disabled={activeTab === 'alerts' && selectedUserId === 'all'}
          >
            <option value="all">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} (ID: {user.id})
              </option>
            ))}
          </select>
        </div>
        {activeTab === 'contacts' && selectedUserId !== 'all' && (
          <button
            className="add-contact-button"
            onClick={() => { setShowAddForm(true); setEditContact(null); }}
          >
            Add Contact
          </button>
        )}
        <button
          onClick={() => navigate('/admin/users')}
          className="back-button"
        >
          Back to User Management
        </button>
      </div>
      {loading && (
        <div className="loading-container">
          <span className="loading-spinner"></span>
          <p>Loading {activeTab === 'alerts' ? 'alerts' : 'contacts'}...</p>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
      {!loading && activeTab === 'alerts' && alerts.length === 0 && !error && (
        <p className="no-alerts">No alerts found.</p>
      )}
      {!loading && activeTab === 'contacts' && contacts.length === 0 && !error && (
        <p className="no-contacts">
          {selectedUserId === 'all'
            ? 'No contacts available for all users. Please select a specific user to view their contacts.'
            : 'No contacts found.'}
        </p>
      )}
      {activeTab === 'alerts' && alerts.length > 0 && (
        <div className="table-container">
          <table className="alert-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Session ID</th>
                <th>Message</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="alert-row">
                  <td>{alert.id}</td>
                  <td>{alert.user_name} (ID: {alert.user_id})</td>
                  <td>{alert.session_id}</td>
                  <td>{alert.message}</td>
                  <td>{alert.timestamp}</td>
                  <td>{alert.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'contacts' && (
        <>
          {showAddForm && (
            <form className="contact-form" onSubmit={handleAddContact}>
              <input
                type="text"
                name="contact_name"
                placeholder="Contact Name"
                required
                maxLength={100}
              />
              <input
                type="text"
                name="phone_number"
                placeholder="Phone Number (10-15 digits)"
                required
                pattern="[0-9]{10,15}"
              />
              <input
                type="email"
                name="email"
                placeholder="Email (optional)"
              />
              <select name="relationship" required>
                <option value="">Select Relationship</option>
                <option value="Family">Family</option>
                <option value="Friend">Friend</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
              <button type="submit">Save Contact</button>
              <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
            </form>
          )}
          {editContact && (
            <form className="contact-form" onSubmit={handleUpdateContact}>
              <input
                type="text"
                name="contact_name"
                defaultValue={editContact.contact_name}
                required
                maxLength={100}
              />
              <input
                type="text"
                name="phone_number"
                defaultValue={editContact.phone_number}
                required
                pattern="[0-9]{10,15}"
              />
              <input
                type="email"
                name="email"
                defaultValue={editContact.email || ''}
              />
              <select name="relationship" defaultValue={editContact.relationship} required>
                <option value="">Select Relationship</option>
                <option value="Family">Family</option>
                <option value="Friend">Friend</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
              <button type="submit">Update Contact</button>
              <button type="button" onClick={() => setEditContact(null)}>Cancel</button>
            </form>
          )}
          {contacts.length > 0 && (
            <div className="table-container">
              <table className="contact-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Contact Name</th>
                    <th>Phone Number</th>
                    <th>Email</th>
                    <th>Relationship</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="contact-row">
                      <td>{contact.id}</td>
                      <td>{contact.contact_name}</td>
                      <td>{contact.phone_number}</td>
                      <td>{contact.email || 'N/A'}</td>
                      <td>{contact.relationship}</td>
                      <td>{contact.created_at}</td>
                      <td className="edit-delete-buttons">
                        <button
                          className="edit-button"
                          onClick={() => setEditContact(contact)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmergencyAlertManagement;