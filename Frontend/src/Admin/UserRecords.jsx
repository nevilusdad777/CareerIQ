import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import "./UserRecords.css";

export default function UserRecords() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedUser, setSelectedUser] = useState(null);
  const detailsRef = useRef(null);

  useEffect(() => {
    loadUserRecords();
  }, []);

  const openViewModal = (user) => {
    setSelectedUser(user);
    
    // Smooth scroll to details after a short delay to allow rendering
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const loadUserRecords = async () => {
    try {
      setLoading(true);
      const [usersResponse, profilesResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users"),
        axios.get("http://localhost:5000/api/profile/admin/all")
      ]);
      
      if (usersResponse.data.success && profilesResponse.data.success) {
        const mergedUsers = usersResponse.data.users.map(user => {
          const profile = profilesResponse.data.profiles.find(p => p.userId === user._id);
          return { ...user, profile: profile || null };
        });
        setUsers(mergedUsers);
      }
    } catch (error) {
      console.error("Error loading user records:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    let aValue, bValue;
    switch(sortBy) {
      case 'name': aValue = a.name || ''; bValue = b.name || ''; break;
      case 'email': aValue = a.email || ''; bValue = b.email || ''; break;
      case 'placementProbability': aValue = a.analytics?.placementProbability || 0; bValue = b.analytics?.placementProbability || 0; break;
      case 'totalSkills': aValue = a.analytics?.totalSkills || 0; bValue = b.analytics?.totalSkills || 0; break;
      case 'profileStrengthLabel': aValue = a.analytics?.profileStrengthLabel || ''; bValue = b.analytics?.profileStrengthLabel || ''; break;
      default: aValue = a.name || ''; bValue = b.name || '';
    }
    if (sortOrder === "asc") return aValue > bValue ? 1 : -1;
    return aValue < bValue ? 1 : -1;
  });

  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return '#ef4444';
      case 'moderator': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getProfileStrengthColor = (label) => {
    switch(label) {
      case 'Very Good': return '#10b981';
      case 'Good': return '#3b82f6';
      case 'Bad': return '#f59e0b';
      case 'Very Bad': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPlacementColor = (probability) => {
    if (probability >= 80) return '#10b981';
    if (probability >= 60) return '#3b82f6';
    if (probability >= 40) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading User Records...</p>
      </div>
    );
  }

  return (
    <div className="admin-content-container">
      <div className="page-header">
        <div>
          <h1>User Records</h1>
          <p>Complete analytics and records for all users</p>
        </div>
      <div className="card">
        <div className="filters-container">
          <div className="search-container">
            <i className="fas fa-search"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="placementProbability">Sort by Placement %</option>
            <option value="totalSkills">Sort by Skills</option>
            <option value="profileStrengthLabel">Sort by Profile Strength</option>
          </select>
          <button className="btn-icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            <i className={`fas fa-sort-${sortOrder === "asc" ? "up" : "down"}`}></i>
          </button>
        </div>
      </div>
      </div>

      <div className="admin-card">
        <div className="table-card-header">
          <h3>Registered Users ({filteredUsers.length})</h3>
        </div>
        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Information</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user._id || index}>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <button className="btn-primary-sm" onClick={() => openViewModal(user)}>
                        <i className="fas fa-eye"></i> View Records
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="empty-state-cell">
                    <i className="fas fa-users empty-icon"></i>
                    <p className="empty-text">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Inline Detail Panel - Appears at the bottom when a user is selected */}
      <div ref={detailsRef} className="detail-anchor"></div>
      
      {selectedUser && (
        <div className="detail-panel-inline">
          <div className="detail-panel-header">
            <div className="panel-title-group">
              <i className="fas fa-id-card-alt"></i>
              <h2>User Academic & Analytics Record</h2>
            </div>
            <button className="panel-close-btn" onClick={() => setSelectedUser(null)}>
              <i className="fas fa-times"></i> Close Details
            </button>
          </div>
          
          <div className="user-detail-body">
            <div className="detail-header-section">
              <div className="user-avatar large">{selectedUser.name?.charAt(0).toUpperCase()}</div>
              <div className="detail-title-info">
                <h3>{selectedUser.name}</h3>
                <p>{selectedUser.email}</p>
                <div className="detail-badges">
                  <span className="role-badge" style={{ backgroundColor: getRoleBadgeColor(selectedUser.role), color: 'white' }}>{selectedUser.role || 'user'}</span>
                  <span className="status-badge-table active">Active</span>
                </div>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-section">
                <h4><i className="fas fa-graduation-cap"></i> Academic Information</h4>
                <div className="detail-item">
                  <label>College:</label>
                  <span className="detail-value-text">{selectedUser.profile?.personalInfo?.college || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Degree:</label>
                  <span className="detail-value-text">{selectedUser.profile?.personalInfo?.degree || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Department:</label>
                  <span className="detail-value-text">{selectedUser.department || "General"}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4><i className="fas fa-briefcase"></i> Skills & Experience</h4>
                <div className="detail-item">
                  <label>Skills:</label>
                  <div className="badge-group">
                    <span className="badge-pill bg-info">{selectedUser.profile?.skills?.length || 0} Skills</span>
                  </div>
                </div>
                <div className="detail-item">
                  <label>Projects:</label>
                  <div className="badge-group">
                    <span className="badge-pill bg-success">{selectedUser.profile?.projects?.length || 0} Projects</span>
                  </div>
                </div>
              </div>

              <div className="detail-section full-width">
                <h4><i className="fas fa-trophy"></i> Completed Mastery Paths</h4>
                {selectedUser.completedRoadmaps && selectedUser.completedRoadmaps.length > 0 ? (
                  <div className="completed-roadmaps-list">
                    {selectedUser.completedRoadmaps.map((rd, idx) => (
                      <div key={idx} className="completed-roadmap-item">
                        <div className="roadmap-info">
                          <span className="roadmap-name">{rd.competencyName}</span>
                          <span className="roadmap-date">
                            <i className="fas fa-calendar-check"></i> {new Date(rd.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="completion-badge">Mastered</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-roadmaps-text">No mastery paths completed yet.</p>
                )}
              </div>

              <div className="detail-section full-width">
                <h4><i className="fas fa-chart-line"></i> Placement Analytics</h4>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <label>Matched Role</label>
                    <span className="role-match-badge">{selectedUser.analytics?.bestRoleMatch || 'Not Assigned'}</span>
                  </div>
                  <div className="analytics-card">
                    <label>Profile Strength</label>
                    <span className="strength-badge" style={{ backgroundColor: getProfileStrengthColor(selectedUser.analytics?.profile_strength_label || selectedUser.analytics?.profileStrengthLabel) }}>
                      {selectedUser.analytics?.profile_strength_label || selectedUser.analytics?.profileStrengthLabel || 'Very Bad'}
                    </span>
                  </div>
                </div>
                
                <div className="detail-progress-section">
                  <div className="progress-item">
                    <div className="progress-label">
                      <span>Profile Completion</span>
                      <span>{selectedUser.profile?.profileCompletion || 0}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill progress-fill-success" style={{ width: `${selectedUser.profile?.profileCompletion || 0}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="progress-item">
                    <div className="progress-label">
                      <span>Placement Probability</span>
                      <span>{selectedUser.analytics?.placementProbability || 0}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${selectedUser.analytics?.placementProbability || 0}%`, background: getPlacementColor(selectedUser.analytics?.placementProbability || 0) }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-footer">
              <div className="join-date-info">
                <i className="fas fa-calendar-alt"></i> Joined: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
