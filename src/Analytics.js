// Analytics.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import './Analytics.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Analytics = () => {
  const { userId } = useParams();
  const [activities, setActivities] = useState([]);
  const [moodTrends, setMoodTrends] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);
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
        setActivities(activityResponse.data.data.activities || []);
        setMoodTrends(moodResponse.data.data.mood_trends || []);
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

  const handleChartConfirmation = () => {
    setShowChart(true);
  };

  return (
    <div className="analytics-page">
      <h2>Analytics for User {userId}</h2>

      {loading && (
        <div className="loading-container">
          <span className="loading-spinner"></span>
          <p>Loading analytics...</p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      <section className="analytics-section">
        <h3>Recent Activity</h3>
        {!loading && activities.length === 0 && !error && (
          <p className="no-data">No recent activities found.</p>
        )}
        {activities.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Activity Type</th>
                <th>Description</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="table-row">
                  <td>{activity.id}</td>
                  <td>{activity.activity_type}</td>
                  <td>{activity.description}</td>
                  <td>{activity.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="analytics-section">
        <h3>Mood Trends (Last 7 Days)</h3>
        {!loading && moodTrends.length === 0 && !error && (
          <p className="no-data">No mood trends found.</p>
        )}
        {moodTrends.length > 0 && (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Mood Label</th>
                  <th>Date</th>
                  <th>Occurrence Count</th>
                </tr>
              </thead>
              <tbody>
                {moodTrends.map((trend, index) => (
                  <tr key={index} className="table-row">
                    <td>{trend.mood_label}</td>
                    <td>{trend.date}</td>
                    <td>{trend.occurrence_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!showChart && (
              <p className="chart-prompt">
                Would you like to visualize mood trends in a chart?
                <button onClick={handleChartConfirmation} className="chart-btn">
                  Yes
                </button>
              </p>
            )}

            {showChart && (
              <div className="chart-container">
                <h4>Mood Trends Chart</h4>
                <Bar
                  data={{
                    labels: moodTrends.map((trend) => trend.mood_label),
                    datasets: [
                      {
                        label: 'Occurrence Count',
                        data: moodTrends.map((trend) => trend.occurrence_count),
                        backgroundColor: ['#28a745', '#dc3545', '#17a2b8', '#ffc107', '#6f42c1'],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                  height={300}
                  width={500}
                />
              </div>
            )}
          </div>
        )}
      </section>

      <div className="back-button-container">
        <button onClick={() => navigate('/admin/users')} className="back-btn">
          Back to Users
        </button>
      </div>
    </div>
  );
};

export default Analytics;
