import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const Analytics = () => {
  const { userId } = useParams();
  const [activities, setActivities] = useState([]);
  const [moodTrends, setMoodTrends] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        const [activityResponse, moodResponse] = await Promise.all([
          axios.get(`http://localhost:5000/admin/analytics/activity/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/admin/analytics/mood-trends/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setActivities(activityResponse.data.data.activities);
        setMoodTrends(moodResponse.data.data.mood_trends);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analytics.');
        if (err.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [userId, navigate]);

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        Analytics for User {userId}
      </h2>
      {loading && <p style={{ textAlign: 'center', color: '#007bff' }}>Loading analytics...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
      <h3 style={{ marginTop: '30px', color: '#333' }}>Recent Activity</h3>
      {!loading && activities.length === 0 && !error && (
        <p style={{ textAlign: 'center', color: '#555' }}>No recent activities found.</p>
      )}
      {activities.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Activity Type</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Description</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} style={{ border: '1px solid #ddd' }}>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{activity.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{activity.activity_type}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{activity.description}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{activity.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3 style={{ marginTop: '30px', color: '#333' }}>Mood Trends (Last 7 Days)</h3>
      {!loading && moodTrends.length === 0 && !error && (
        <p style={{ textAlign: 'center', color: '#555' }}>No mood trends found.</p>
      )}
      {moodTrends.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Mood Label</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Date</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Occurrence Count</th>
            </tr>
          </thead>
          <tbody>
            {moodTrends.map((trend, index) => (
              <tr key={index} style={{ border: '1px solid #ddd' }}>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{trend.mood_label}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{trend.date}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{trend.occurrence_count}</td>
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

export default Analytics;