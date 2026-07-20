import { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    status: "active",
    department: "",
    joinDate: ""
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [searchTerm, filterRole, filterStatus, users, sortBy, sortOrder]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await axios.get("http://localhost:5000/api/admin/users");

      if (response.data.success) {
        const transformedUsers = response.data.users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "N/A",
          role: user.role || "user",
          status: "active",
          department: user.department || "General",
          joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          createdAt: user.createdAt,
          placementProbability: user.analytics?.placementProbability || 0,
          bestRoleMatch: user.analytics?.bestRoleMatch || "Not Available",
          totalSkills: user.analytics?.totalSkills || 0,
          profileStrength: user.analytics?.profileStrengthLabel || "Very Bad",
          confidenceLevel: user.analytics?.confidenceLevel || 0,
          learningStreak: user.roadmapStats?.streak || 0,
          watchTimeHours: user.roadmapStats?.watchTimeHours || 0,
          completedVideosCount: user.roadmapStats?.completedVideosCount || 0
        }));

        setUsers(transformedUsers);
        calculateStats(transformedUsers);
      } else {
        setUsers([]);
        calculateStats([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading users from backend:", error);
      setUsers([]);
      calculateStats([]);
      setLoading(false);
    }
  };

  const calculateStats = (userList) => {
    setStats({
      total: userList.length,
      active: userList.filter(u => u.status === "active").length,
      inactive: userList.filter(u => u.status === "inactive").length,
      admins: userList.filter(u => u.role === "admin").length
    });
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== "all") {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    filtered.sort((a, b) => {
      let aVal = a[sortBy] || "";
      let bVal = b[sortBy] || "";

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: "defaultPassword123",
        phone: formData.phone,
        department: formData.department
      });

      if (response.data.success) {
        await loadUsers();
        setFormData({ name: "", email: "", phone: "", role: "user", status: "active", department: "", joinDate: "" });
        setShowAddModal(false);
        alert("User added successfully!");
      } else {
        alert("Failed to add user: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user: " + (error.response?.data?.message || "Network error"));
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    alert("Edit functionality requires backend update endpoint. User data updated locally only.");

    const updatedUsers = users.map(user =>
      user.id === selectedUser.id ? { ...user, ...formData } : user
    );
    setUsers(updatedUsers);
    calculateStats(updatedUsers);

    setFormData({ name: "", email: "", phone: "", role: "user", status: "active", department: "", joinDate: "" });
    setSelectedUser(null);
    setShowEditModal(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    alert("Delete functionality requires backend delete endpoint. User removed locally only.");

    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    calculateStats(updatedUsers);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm("Are you sure you want to delete all selected users? This action cannot be undone.")) return;

    try {
      setLoading(true);
      const userIds = users.map(user => user.id);

      const response = await axios.delete("http://localhost:5000/api/admin/users/bulk-delete", {
        data: { userIds }
      });

      if (response.data.success) {
        alert(`Successfully deleted ${response.data.deletedCount} users.`);
        await loadUsers();
      } else {
        alert("Failed to delete users.");
      }
    } catch (error) {
      console.error("Error bulk deleting users:", error);
      alert("Error deleting users.");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Role", "Status", "Department", "Join Date"];
    const rows = filteredUsers.map(u => [
      u.id, u.name, u.email, u.phone, u.role, u.status, u.department, u.joinDate
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    alert("Users exported to CSV!");
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      status: user.status,
      department: user.department || "",
      joinDate: user.joinDate || ""
    });
    setShowEditModal(true);
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openAddModal = () => {
    setFormData({ name: "", email: "", phone: "", role: "user", status: "active", department: "", joinDate: "" });
    setShowAddModal(true);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Users...</p>
      </div>
    );
  }

  return (
    <div className="admin-content-container">
      <div className="page-header">
        <div>
          <h1>Users Management</h1>
          <p>Manage all registered users and their permissions</p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="btn-secondary" onClick={exportToCSV}>
            <i className="fas fa-download"></i>
            <span>Export CSV</span>
          </button>
          <button className="btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus"></i>
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-users"></i></div>
          <div className="stat-content">
            <p className="stat-label">Total Users</p>
            <h2 className="stat-value">{stats.total}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-user-check"></i></div>
          <div className="stat-content">
            <p className="stat-label">Active Users</p>
            <h2 className="stat-value">{stats.active}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-user-times"></i></div>
          <div className="stat-content">
            <p className="stat-label">Inactive Users</p>
            <h2 className="stat-value">{stats.inactive}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-user-shield"></i></div>
          <div className="stat-content">
            <p className="stat-label">Administrators</p>
            <h2 className="stat-value">{stats.admins}</h2>
          </div>
        </div>
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
          <select className="filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="joinDate">Sort by Join Date</option>
          </select>
          <button className="btn-icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            <i className={`fas fa-sort-${sortOrder === "asc" ? "up" : "down"}`}></i>
          </button>
          <button className="btn-danger" onClick={handleBulkDelete}>
            <i className="fas fa-trash"></i>
            <span>Bulk Delete</span>
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="modal-header" style={{ background: 'transparent', borderBottom: '1px solid var(--admin-border)' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Registered Candidates ({filteredUsers.length})</h2>
        </div>
        <div className="table-container" style={{ padding: '0 1rem 1rem 1rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Access</th>
                <th>Status</th>
                <th>Department</th>
                <th>Progress</th>
                <th>Analytics</th>
                <th>Streak</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={user.id || index}>
                    <td>
                      <div className="user-info-cell" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="user-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>{user.name?.charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`role-badge ${user.role}`} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: user.role === 'admin' ? '#ef4444' : '#3b82f6' }}>{user.role}</span></td>
                    <td><span className={`status-badge-table ${user.status}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: user.status === 'active' ? '#10b981' : '#94a3b8' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.status === 'active' ? '#10b981' : '#94a3b8' }}></span>{user.status}</span></td>
                    <td><div style={{ fontSize: '0.85rem' }}>{user.department}</div></td>
                    <td>
                      <div className="progress-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
                          <span>Placement</span>
                          <span>{user.placementProbability}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${user.placementProbability}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="analytics-mini-cell" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--admin-primary)' }}>{user.bestRoleMatch}</span>
                        <span style={{ fontSize: '10px', color: 'var(--admin-text-muted)' }}>{user.totalSkills} Skills</span>
                      </div>
                    </td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>🔥 {user.learningStreak}</div></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
                    <i className="fas fa-users" style={{ fontSize: '2rem', color: 'var(--admin-border)', marginBottom: '1rem', display: 'block' }}></i>
                    <p style={{ color: 'var(--admin-text-muted)' }}>No candidates found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="pagination-info">Page {currentPage} of {totalPages}</span>
            <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-content-wrapper">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Full Name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="email@example.com" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input type="text" className="form-input" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. Engineering" />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select className="form-input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="action-btn cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="action-btn primary">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}