import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ChatMonitoring = () => {
  const { userId } = useParams();
  const [chats, setChats] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`http://localhost:5000/admin/chats/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(response.data.data.chats);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch chats.');
        if (err.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [userId, navigate]);

  // Shared styles
  const containerStyle = {
    padding: '40px 20px',
    maxWidth: '1100px',
    margin: '0 auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#fff',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    borderRadius: '12px',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#222',
    fontWeight: '700',
    fontSize: '2rem',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  };

  const messageStyle = {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px',
  };

  const loadingStyle = {
    ...messageStyle,
    color: '#007bff',
  };

  const errorStyle = {
    ...messageStyle,
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '12px 20px',
    borderRadius: '8px',
    border: '1px solid #f5c6cb',
    boxShadow: '0 2px 10px rgba(220, 53, 69, 0.1)',
  };

  const noChatsStyle = {
    ...messageStyle,
    color: '#666',
    fontStyle: 'italic',
  };

  const tableContainerStyle = {
    overflowX: 'auto',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    marginBottom: '30px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: '16px',
    color: '#444',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 0 1px #ddd',
  };

  const theadStyle = {
    background: 'linear-gradient(90deg, #007bff, #0056b3)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '17px',
  };

  const thTdStyle = {
    padding: '14px 20px',
    textAlign: 'left',
    verticalAlign: 'middle',
    borderBottom: '1px solid #eee',
  };

  const trHoverStyle = {
    backgroundColor: '#f1f9ff',
    cursor: 'default',
  };

  const backButtonContainerStyle = {
    textAlign: 'center',
    marginTop: '20px',
  };

  const backButtonStyle = {
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #007bff, #0056b3)',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(0, 123, 255, 0.5)',
    transition: 'background 0.3s ease, box-shadow 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Chat History for User {userId}</h2>

      {loading && <p style={loadingStyle}>Loading chats...</p>}

      {error && <p style={errorStyle}>{error}</p>}

      {!loading && chats.length === 0 && !error && (
        <p style={noChatsStyle}>No chats found for this user.</p>
      )}

      {chats.length > 0 && (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadStyle}>
                <th style={thTdStyle}>Chat ID</th>
                <th style={thTdStyle}>Session ID</th>
                <th style={thTdStyle}>User Message</th>
                <th style={thTdStyle}>Bot Response</th>
                <th style={thTdStyle}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {chats.map((chat) => (
                <tr key={chat.chat_id} style={{ ...trHoverStyle }}>
                  <td style={thTdStyle}>{chat.chat_id}</td>
                  <td style={thTdStyle}>{chat.session_id}</td>
                  <td style={thTdStyle}>{chat.message}</td>
                  <td style={thTdStyle}>{chat.response}</td>
                  <td style={thTdStyle}>{new Date(chat.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={backButtonContainerStyle}>
        <button
          onClick={() => navigate('/admin/users')}
          style={backButtonStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              'linear-gradient(135deg, #0056b3, #003d7a)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              'linear-gradient(135deg, #007bff, #0056b3)')
          }
        >
          Back to Users
        </button>
      </div>
    </div>
  );
};

export default ChatMonitoring;
