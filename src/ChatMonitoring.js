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

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        Chat History for User {userId}
      </h2>
      {loading && <p style={{ textAlign: 'center', color: '#007bff' }}>Loading chats...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
      {!loading && chats.length === 0 && !error && (
        <p style={{ textAlign: 'center', color: '#555' }}>No chats found for this user.</p>
      )}
      {chats.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Chat ID</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Session ID</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>User Message</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Bot Response</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {chats.map((chat) => (
              <tr key={chat.chat_id} style={{ border: '1px solid #ddd' }}>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{chat.chat_id}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{chat.session_id}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{chat.message}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{chat.response}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{chat.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => navigate('/admin/users')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Users
        </button>
      </div>
    </div>
  );
};

export default ChatMonitoring;