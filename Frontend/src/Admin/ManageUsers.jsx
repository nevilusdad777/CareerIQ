import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css";

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    role: "student",
    status: "active",
    phone: "",
    joinDate: new Date().toISOString().split('T')[0],
    avatar: ""
  });

  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    instructors: 0,
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
      const storedUsers = JSON.parse(sessionStorage.getItem("users") || "[]");
      
      if (storedUsers.length === 0) {
        const sampleUsers = [
          {
            id: "1",
            name: "John Doe",
            email: "john.doe@example.com",
            role: "student",
            status: "active",
            phone: "+1 234 567 8900",
            joinDate: "2024-01-15",
            avatar: "JD",
            coursesEnrolled: 5,
            lastActive: "2024-01-05"
          },
          {
            id: "2",
            name: "Sarah Johnson",
            email: "sarah.j@example.com",
            role: "instructor",
            status: "active",
            phone: "+1 234 567 8901",
            joinDate: "2023-11-20",
            avatar: "SJ",
            coursesEnrolled: 0,
            coursesTeaching: 3,
            lastActive: "2024-01-06"
          },
          {
            id: "3",
            name: "Mike Wilson",
            email: "mike.w@example.com",
            role: "student",
            status: "active",
            phone: "+1 234 567 8902",
            joinDate: "2024-01-10",
            avatar: "MW",
            coursesEnrolled: 3,
            lastActive: "2024-01-04"
          },
          {
            id: "4",
            name: "Emily Davis",
            email: "emily.d@example.com",
            role: "instructor",
            status: "active",
            phone: "+1 234 567 8903",
            joinDate: "2023-10-05",
            avatar: "ED",
            coursesEnrolled: 0,
            coursesTeaching: 4,
            lastActive: "2024-01-06"
          },
          {
            id: "5",
            name: "Robert Brown",
            email: "robert.b@example.com",
            role: "admin",
            status: "active",
            phone: "+1 234 567 8904",
            joinDate: "2023-09-01",
            avatar: "RB",
            coursesEnrolled: 0,
            lastActive: "2024-01-06"
          },
          {
            id: "6",
            name: "Lisa Chen",
            email: "lisa.c@example.com",
            role: "student",
            status: "inactive",
            phone: "+1 234 567 8905",
            joinDate: "2023-12-01",
            avatar: "LC",
            coursesEnrolled: 2,
            lastActive: "2023-12-20"
          },
          {
            id: "7",
            name: "David Martinez",
            email: "david.m@example.com",
            role: "student",
            status: "active",
            phone: "+1 234 567 8906",
            joinDate: "2024-01-08",
            avatar: "DM",
            coursesEnrolled: 4,
            lastActive: "2024-01-05"
          },
          {
            id: "8",
            name: "Anna Taylor",
            email: "anna.t@example.com",
            role: "instructor",
            status: "active",
            phone: "+1 234 567 8907",
            joinDate: "2023-11-15",
            avatar: "AT",
            coursesEnrolled: 0,
            coursesTeaching: 2,
            lastActive: "2024-01-06"
          }
        ];
        sessionStorage.setItem("users", JSON.stringify(sampleUsers));
        setUsers(sampleUsers);
        calculateStats(sampleUsers);
      } else {
        setUsers(storedUsers);
        calculateStats(storedUsers);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading users:", error);
      setLoading(false);
    }
  };

  const calculateStats = (userList) => {
    setStats({
      total: userList.length,
      students: userList.filter(u => u.role === "student").length,
      instructors: userList.filter(u => u.role === "instructor").length,
      admins: userList.filter(u => u.role === "admin").length
    });
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
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
      const newUser = {
        id: Date.now().toString(),
        ...formData,
        avatar: formData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        coursesEnrolled: formData.role === "student" ? 0 : undefined,
        coursesTeaching: formData.role === "instructor" ? 0 : undefined,
        lastActive: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...users, newUser];
      sessionStorage.setItem("users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      calculateStats(updatedUsers);

      setFormData({ name: "", email: "", role: "student", status: "active", phone: "", joinDate: new Date().toISOString().split('T')[0], avatar: "" });
      setShowAddModal(false);
      alert("User added successfully!");
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user");
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    
    try {
      const updatedUser = {
        ...selectedUser,
        ...formData,
        avatar: formData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        updatedAt: new Date().toISOString()
      };

      const updatedUsers = users.map(user =>
        user.id === selectedUser.id ? updatedUser : user
      );
      sessionStorage.setItem("users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      calculateStats(updatedUsers);

      setFormData({ name: "", email: "", role: "student", status: "active", phone: "", joinDate: new Date().toISOString().split('T')[0], avatar: "" });
      setSelectedUser(null);
      setShowEditModal(false);
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const updatedUsers = users.filter(user => user.id !== userId);
      sessionStorage.setItem("users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      calculateStats(updatedUsers);
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      "student": "role-badge-student",
      "instructor": "role-badge-instructor",
      "admin": "role-badge-admin"
    };
    return classes[role] || "role-badge-student";
  };

  const getAvatarColor = (name) => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f43f5e'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone || "",
      joinDate: user.joinDate || new Date().toISOString().split('T')[0],
      avatar: user.avatar
    });
    setShowEditModal(true);
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openAddModal = () => {
    setFormData({ name: "", email: "", role: "student", status: "active", phone: "", joinDate: new Date().toISOString().split('T')[0], avatar: "" });
    setShowAddModal(true);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="dashboard-layout">
        <div className={`overlay ${sidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>

        <div className={`sidebar-wrapper ${sidebarOpen ? 'mobile-open' : ''}`}>
          <AdminSidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onLogout={handleLogout}
            currentPage="users"
            setCurrentPage={(page) => {
              const routes = {
                'dashboard': '/admindashboard',
                'users': '/adminusers',
                'feedback': '/managefeedback',
                'skills': '/skillmanager',
                'market': '/marketdata',
                'settings': '/settings'
              };
              if (routes[page]) navigate(routes[page]);
            }}
          />
        </div>

        <div className={`main-content ${collapsed ? 'expanded' : ''}`}>
          <div className="mobile-header">
            <button className="menu-btn" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1>Users Management</h1>
          </div>

          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>Users Management</h1>
                <p>Manage all platform users and their roles</p>
              </div>
              <button className="btn-primary" onClick={openAddModal}>
                <i className="fas fa-user-plus"></i>
                <span>Add New User</span>
              </button>
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
                <div className="stat-icon"><i className="fas fa-user-graduate"></i></div>
                <div className="stat-content">
                  <p className="stat-label">Students</p>
                  <h2 className="stat-value">{stats.students}</h2>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-chalkboard-teacher"></i></div>
                <div className="stat-content">
                  <p className="stat-label">Instructors</p>
                  <h2 className="stat-value">{stats.instructors}</h2>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-user-shield"></i></div>
                <div className="stat-content">
                  <p className="stat-label">Admins</p>
                  <h2 className="stat-value">{stats.admins}</h2>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="filters-container">
                <div className="search-container" style={{ flex: 1 }}>
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
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
                <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="role">Sort by Role</option>
                  <option value="joinDate">Sort by Join Date</option>
                </select>
                <button className="btn-icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  <i className={`fas fa-sort-${sortOrder === "asc" ? "up" : "down"}`}></i>
                </button>
              </div>
            </div>

            <div className="card">
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Phone</th>
                      <th>Join Date</th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar" style={{ backgroundColor: getAvatarColor(user.name) }}>
                                {user.avatar}
                              </div>
                              <span className="user-name">{user.name}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge status-${user.status}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>{user.phone || "N/A"}</td>
                          <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                          <td>{new Date(user.lastActive).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon-small" onClick={() => openViewModal(user)} title="View Details">
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="btn-icon-small" onClick={() => openEditModal(user)} title="Edit">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn-icon-small btn-delete-small" onClick={() => handleDeleteUser(user.id)} title="Delete">
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="empty-state">
                          <i className="fas fa-users" style={{ fontSize: "48px", color: "#64748b" }}></i>
                          <p>No users found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="card">
                <div className="pagination">
                  <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                  <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showViewModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="user-detail-view">
              <div className="user-detail-header">
                <div className="user-avatar-large" style={{ backgroundColor: getAvatarColor(selectedUser.name) }}>
                  {selectedUser.avatar}
                </div>
                <div>
                  <h2>{selectedUser.name}</h2>
                  <p className="user-email">
                    <i className="fas fa-envelope"></i>
                    {selectedUser.email}
                  </p>
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <span className={`role-badge ${getRoleBadgeClass(selectedUser.role)}`}>{selectedUser.role}</span>
                    <span className={`status-badge status-${selectedUser.status}`}>{selectedUser.status}</span>
                  </div>
                </div>
              </div>
              <div className="user-detail-grid">
                <div className="user-detail-item">
                  <label><i className="fas fa-phone"></i> Phone</label>
                  <p>{selectedUser.phone || "Not provided"}</p>
                </div>
                <div className="user-detail-item">
                  <label><i className="fas fa-calendar"></i> Join Date</label>
                  <p>{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                </div>
                <div className="user-detail-item">
                  <label><i className="fas fa-clock"></i> Last Active</label>
                  <p>{new Date(selectedUser.lastActive).toLocaleDateString()}</p>
                </div>
                {selectedUser.coursesEnrolled !== undefined && (
                  <div className="user-detail-item">
                    <label><i className="fas fa-book"></i> Courses Enrolled</label>
                    <p>{selectedUser.coursesEnrolled}</p>
                  </div>
                )}
                {selectedUser.coursesTeaching !== undefined && (
                  <div className="user-detail-item">
                    <label><i className="fas fa-chalkboard-teacher"></i> Courses Teaching</label>
                    <p>{selectedUser.coursesTeaching}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Full Name <span className="required">*</span></label>
                  <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" className="form-input" placeholder="+1 234 567 8900" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Role <span className="required">*</span></label>
                  <select className="form-input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
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
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Join Date</label>
                  <input type="date" className="form-input" value={formData.joinDate} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="action-btn cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="action-btn primary"><i className="fas fa-user-plus"></i> Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleEditUser}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Full Name <span className="required">*</span></label>
                  <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" className="form-input" placeholder="+1 234 567 8900" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Role <span className="required">*</span></label>
                  <select className="form-input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
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
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Join Date</label>
                  <input type="date" className="form-input" value={formData.joinDate} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="action-btn cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="action-btn primary"><i className="fas fa-save"></i> Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}