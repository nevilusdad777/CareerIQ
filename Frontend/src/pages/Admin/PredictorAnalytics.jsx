import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./PredictorAnalytics.css";

export default function PredictorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPredictorStats();
  }, []);

  const fetchPredictorStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/admin/predictor-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError('Failed to fetch predictor analytics data');
      }
    } catch (err) {
      console.error('Error fetching predictor stats:', err);
      if (err.response?.status === 403) {
        setError('Admin access required');
      } else if (err.response?.status === 401) {
        setError('Please login to access this page');
      } else {
        setError('Failed to fetch predictor analytics data');
      }
    } finally {
      setLoading(false);
    }
  };

  const prepareRoleDistributionData = () => {
    if (!data?.roleDistribution) return [];
    
    return Object.entries(data.roleDistribution).map(([role, count]) => ({
      name: role,
      value: count,
      percentage: ((count / data.totalUsers) * 100).toFixed(1)
    }));
  };

  const prepareConfidenceData = () => {
    if (!data?.confidenceStats) return [];
    
    return [
      { name: 'High Confidence (70-100%)', value: data.confidenceStats.highConfidenceUsers, color: '#10b981' },
      { name: 'Medium Confidence (40-69%)', value: data.confidenceStats.mediumConfidenceUsers, color: '#3b82f6' },
      { name: 'Low Confidence (0-39%)', value: data.confidenceStats.lowConfidenceUsers, color: '#ef4444' }
    ];
  };

  const prepareSkillsData = () => {
    if (!data?.skillStats) return [];
    
    const topStrengths = data.skillStats.strengths.slice(0, 5);
    const topWeaknesses = data.skillStats.weaknesses.slice(0, 5);
    
    return [
      ...topStrengths.map(item => ({ name: `Skill ${item.skill + 1}`, type: 'Strength', count: item.count })),
      ...topWeaknesses.map(item => ({ name: `Skill ${item.skill + 1}`, type: 'Weakness', count: item.count }))
    ];
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  if (loading) {
    return (
      <div className="predictor-analytics-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading predictor analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="predictor-analytics-container">
        <div className="error-section">
          <div className="error-message">{error}</div>
          <button className="retry-btn" onClick={fetchPredictorStats}>
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="predictor-analytics-container">
        <div className="no-data">
          <i className="fas fa-chart-line"></i>
          <h3>No analytics data available</h3>
          <p>Start collecting user data to see predictor analytics here.</p>
        </div>
      </div>
    );
  }

  const roleData = prepareRoleDistributionData();
  const confidenceData = prepareConfidenceData();
  const skillsData = prepareSkillsData();

  return (
    <div className="predictor-analytics-container">
      <div className="analytics-header">
        <h1><i className="fas fa-chart-bar"></i> Predictor Analytics</h1>
        <p className="analytics-subtitle">Comprehensive insights from user placement predictions</p>
        <div className="last-updated">
          <i className="fas fa-clock"></i>
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-grid">
        <div className="overview-card primary">
          <div className="card-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="card-content">
            <div className="card-value">{data.totalUsers}</div>
            <div className="card-label">Total Users</div>
          </div>
        </div>

        <div className="overview-card success">
          <div className="card-icon">
            <i className="fas fa-percentage"></i>
          </div>
          <div className="card-content">
            <div className="card-value">{data.averagePlacementProbability}%</div>
            <div className="card-label">Avg Placement Probability</div>
          </div>
        </div>

        <div className="overview-card info">
          <div className="card-icon">
            <i className="fas fa-cogs"></i>
          </div>
          <div className="card-content">
            <div className="card-value">{data.skillStats.averageSkillsPerUser}</div>
            <div className="card-label">Avg Skills per User</div>
          </div>
        </div>

        <div className="overview-card warning">
          <div className="card-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <div className="card-content">
            <div className="card-value">{data.achievementsStats.unlockedAchievements}</div>
            <div className="card-label">Unlocked Achievements</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Role Distribution Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><i className="fas fa-briefcase"></i> Role Distribution</h3>
            <p>Most common predicted career roles</p>
          </div>
          <div className="chart-content">
            {roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-chart-data">
                <i className="fas fa-chart-pie"></i>
                <p>No role data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Confidence Distribution Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><i className="fas fa-chart-line"></i> Confidence Distribution</h3>
            <p>User confidence levels breakdown</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6">
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Analysis Chart */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3><i className="fas fa-cogs"></i> Skills Analysis</h3>
            <p>Top strengths and weaknesses across all users</p>
          </div>
          <div className="chart-content">
            {skillsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6">
                    {skillsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.type === 'Strength' ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-chart-data">
                <i className="fas fa-chart-bar"></i>
                <p>No skills data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="stats-grid">
        <div className="stats-card">
          <h3><i className="fas fa-info-circle"></i> General Statistics</h3>
          <div className="stats-list">
            <div className="stat-item">
              <span className="stat-label">Total Skills Assessed</span>
              <span className="stat-value">{data.skillStats.totalSkills}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Confidence</span>
              <span className="stat-value">{data.confidenceStats.averageConfidence.toFixed(1)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Achievements</span>
              <span className="stat-value">{data.achievementsStats.totalAchievements}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Achievements per User</span>
              <span className="stat-value">{data.achievementsStats.averageAchievementsPerUser}</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <h3><i className="fas fa-trophy"></i> Top Predicted Roles</h3>
          <div className="role-list">
            {roleData.slice(0, 5).map((role, index) => (
              <div key={index} className="role-item">
                <span className="role-name">{role.name}</span>
                <span className="role-count">{role.value} users ({role.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
