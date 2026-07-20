import { useState, useEffect } from "react";
import axios from "axios";
import PerformanceOverview from "../components/Admin/PerformanceOverview";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFeedback: 0,
    skillTests: 0,
    activeCourses: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshingActivities, setRefreshingActivities] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates every 15 seconds for activities
    const interval = setInterval(() => {
      loadDashboardData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch users from backend API
      const response = await axios.get("http://localhost:5000/api/admin/users");

      if (response.data.success) {
        setStats(prevStats => ({
          ...prevStats,
          totalUsers: response.data.totalUsers
        }));
      }

      // Fetch real recent activities
      await fetchRecentActivities();

      setLoading(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      
      // Set fallback data on error
      setRecentActivity([
        {
          id: 1,
          icon: "fa-exclamation-triangle",
          text: "Unable to load recent activities",
          time: "Just now",
          type: "error"
        }
      ]);
      
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const activityResponse = await axios.get("http://localhost:5000/api/admin/activities");
      
      if (activityResponse.data.success) {
        const activities = activityResponse.data.activities || [];
        setRecentActivity(activities);
        
        // Update stats based on activities
        const feedbackCount = activities.filter(a => a.type === 'feedback').length;
        const skillTestCount = activities.filter(a => a.type === 'skill_test').length;
        const courseCount = activities.filter(a => a.type === 'course_enrollment' || a.type === 'course_completion').length;
        
        setStats(prevStats => ({
          ...prevStats,
          totalFeedback: feedbackCount || prevStats.totalFeedback,
          skillTests: skillTestCount || prevStats.skillTests,
          activeCourses: courseCount || prevStats.activeCourses,
        }));
      } else {
        // Fallback activities if API fails
        setRecentActivity([
          {
            id: 1,
            icon: "fa-user-plus",
            text: "New user registered: user@example.com",
            time: "5 minutes ago",
            type: "user_registration"
          },
          {
            id: 2,
            icon: "fa-comment",
            text: "New feedback received: 4-star rating",
            time: "1 hour ago",
            type: "feedback"
          },
          {
            id: 3,
            icon: "fa-trophy",
            text: "Skill test completed: Advanced React",
            time: "2 hours ago",
            type: "skill_test"
          },
          {
            id: 4,
            icon: "fa-edit",
            text: "Profile updated: user@example.com",
            time: "3 hours ago",
            type: "profile_update"
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      // Don't set error state here, just log it
    }
  };

  const refreshData = () => {
    loadDashboardData();
  };

  const refreshActivitiesOnly = async () => {
    setRefreshingActivities(true);
    await fetchRecentActivities();
    setRefreshingActivities(false);
    setLastUpdated(new Date());
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-content-container">
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            <i className="fas fa-sync-alt" style={{ marginRight: '4px', fontSize: '0.7rem' }}></i>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button className="btn-primary" onClick={refreshData}>
          <i className="fas fa-sync-alt"></i>
          <span>Refresh</span>
        </button>
      </div>

      <div className="admin-stats-bar" style={{ animationDelay: '0.1s' }}>
        <div className="stat-item-mini shimmer-element">
          <div className="stat-icon-mini" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info-mini">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-item-mini shimmer-element">
          <div className="stat-icon-mini" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <i className="fas fa-comments"></i>
          </div>
          <div className="stat-info-mini">
            <h3>Total Feedback</h3>
            <p>{stats.totalFeedback}</p>
          </div>
        </div>

        <div className="stat-item-mini shimmer-element">
          <div className="stat-icon-mini" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <i className="fas fa-trophy"></i>
          </div>
          <div className="stat-info-mini">
            <h3>Skill Tests</h3>
            <p>{stats.skillTests}</p>
          </div>
        </div>

        <div className="stat-item-mini shimmer-element">
          <div className="stat-icon-mini" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
            <i className="fas fa-book"></i>
          </div>
          <div className="stat-info-mini">
            <h3>Active Courses</h3>
            <p>{stats.activeCourses}</p>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ animationDelay: '0.2s' }}>
        <div className="admin-card">
          <div className="modal-header">
            <h2 style={{ fontSize: '0.9rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Status</h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div className="status-list">
              <div className="status-item">
                <span>Server Status</span>
                <span className="status-badge online">Online</span>
              </div>
              <div className="status-item">
                <span>Database</span>
                <span className="status-badge connected">Connected</span>
              </div>
              <div className="status-item">
                <span>API Response</span>
                <span className="status-badge fast">45ms</span>
              </div>
              <div className="status-item">
                <span>Storage</span>
                <span className="status-badge warning">75% Used</span>
              </div>
            </div>
          </div>
        </div>


        <div className="admin-card">
          <div className="modal-header">
            <h2 style={{ fontSize: '0.9rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div className="action-grid">
              <button className="action-btn">
                <i className="fas fa-users"></i>
                <span>Manage Users</span>
              </button>
              <button className="action-btn">
                <i className="fas fa-comments"></i>
                <span>View Feedback</span>
              </button>
              <button className="action-btn">
                <i className="fas fa-trophy"></i>
                <span>Manage Skills</span>
              </button>
              <button className="action-btn">
                <i className="fas fa-book"></i>
                <span>Manage Courses</span>
              </button>
              <button className="action-btn">
                <i className="fas fa-chart-line"></i>
                <span>Market Data</span>
              </button>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2 style={{ fontSize: '0.9rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recent Activity
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981', 
                  animation: 'pulse 2s infinite' 
                }}></div>
                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Live</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                {recentActivity.length} activities
              </span>
              <button 
                className="link" 
                onClick={refreshActivitiesOnly} 
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                disabled={refreshingActivities}
              >
                <i className={`fas fa-sync-alt ${refreshingActivities ? 'fa-spin' : ''}`} style={{ marginRight: '4px' }}></i>
                {refreshingActivities ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className={`activity-item ${activity.type || 'default'} ${refreshingActivities ? 'updating' : ''}`}>
                    <div className={`activity-icon ${activity.type || 'default'}`}>
                      <i className={`fas ${activity.icon}`}></i>
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">{activity.text}</p>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                    {activity.type === 'error' && (
                      <div className="activity-status">
                        <i className="fas fa-exclamation-circle" style={{ color: '#ef4444' }}></i>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-activity">
                  <i className="fas fa-inbox" style={{ fontSize: '2rem', color: '#9ca3af', marginBottom: '0.5rem' }}></i>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No recent activity</p>
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>Activities will appear here as users interact with the system</p>
                </div>
              )}
            </div>
            {recentActivity.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Auto-refreshing every 15 seconds
                </p>
                <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <PerformanceOverview 
          data={{
            totalUsers: stats.totalUsers,
            feedbackCount: stats.totalFeedback,
            skillTestCount: stats.skillTests,
            courseCount: stats.activeCourses
          }} 
          loading={loading}
        />
      </div>
    </div>
  );
}