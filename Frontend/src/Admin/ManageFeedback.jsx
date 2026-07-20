import { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css";

export default function ManageFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbacksPerPage] = useState(10);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    avgRating: 0
  });

  useEffect(() => {
    loadFeedbacks();
  }, []);

  useEffect(() => {
    filterAndSortFeedbacks();
  }, [searchTerm, filterRating, filterStatus, feedbacks, sortBy, sortOrder]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/feedback/admin');
      if (response.data.success) {
        setFeedbacks(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error("Error loading feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (feedbackList) => {
    const totalRating = feedbackList.reduce((sum, fb) => sum + (fb.rating || 0), 0);
    const avgRating = feedbackList.length > 0 ? (totalRating / feedbackList.length).toFixed(1) : 0;

    setStats({
      total: feedbackList.length,
      pending: feedbackList.filter(fb => fb.status === "pending").length,
      reviewed: feedbackList.filter(fb => fb.status === "reviewed").length,
      avgRating: avgRating
    });
  };

  const filterAndSortFeedbacks = () => {
    let filtered = [...feedbacks];

    if (searchTerm) {
      filtered = filtered.filter(fb =>
        fb.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRating !== "all") {
      filtered = filtered.filter(fb => fb.rating === parseInt(filterRating));
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(fb => fb.status === filterStatus);
    }

    filtered.sort((a, b) => {
      let aVal = a[sortBy] || "";
      let bVal = b[sortBy] || "";
      if (sortBy === "date") {
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
      }
      if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    setFilteredFeedbacks(filtered);
  };

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/feedback/admin/${feedbackId}`, { status: newStatus });
      if (response.data.success) {
        const updatedFeedbacks = feedbacks.map(fb =>
          fb.id === feedbackId ? { ...fb, status: newStatus } : fb
        );
        setFeedbacks(updatedFeedbacks);
        calculateStats(updatedFeedbacks);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const response = await axios.delete(`http://localhost:5000/api/feedback/admin/${feedbackId}`);
      if (response.data.success) {
        const updatedFeedbacks = feedbacks.filter(fb => fb.id !== feedbackId);
        setFeedbacks(updatedFeedbacks);
        calculateStats(updatedFeedbacks);
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm("Delete all reviewed feedbacks?")) return;
    try {
      const reviewedFeedbacks = feedbacks.filter(fb => fb.status === "reviewed");
      for (const fb of reviewedFeedbacks) {
        await axios.delete(`http://localhost:5000/api/feedback/admin/${fb.id}`);
      }
      const updatedFeedbacks = feedbacks.filter(fb => fb.status !== "reviewed");
      setFeedbacks(updatedFeedbacks);
      calculateStats(updatedFeedbacks);
      alert("Reviewed feedbacks deleted!");
    } catch(err) {
      console.error("Bulk delete error", err);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "User", "Email", "Rating", "Subject", "Message", "Status", "Date"];
    const rows = filteredFeedbacks.map(fb => [
      fb.id, fb.userName, fb.userEmail, fb.rating, fb.subject, fb.message, fb.status, new Date(fb.createdAt).toLocaleString()
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedbacks.csv";
    a.click();
  };

  const openViewModal = (feedback) => {
    setSelectedFeedback(feedback);
    setShowViewModal(true);
  };

  const renderStars = (rating) => (
    <div className="stars-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <i key={star} className={`fas fa-star ${star <= rating ? 'star-filled' : 'star-empty'}`}></i>
      ))}
    </div>
  );

  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const indexOfLastFeedback = currentPage * feedbacksPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
  const currentFeedbacks = filteredFeedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);
  const totalPages = Math.ceil(filteredFeedbacks.length / feedbacksPerPage);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Feedbacks...</p>
      </div>
    );
  }

  return (
    <div className="admin-content-container">
      <div className="page-header">
        <div>
          <h1>Feedback Management</h1>
          <p>Manage and respond to user feedback</p>
        </div>
        <button className="btn-secondary" onClick={exportToCSV}>
          <i className="fas fa-download"></i>
          <span>Export CSV</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-comments"></i></div>
          <div className="stat-content">
            <p className="stat-label">Total Feedback</p>
            <h2 className="stat-value">{stats.total}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-clock"></i></div>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <h2 className="stat-value">{stats.pending}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
          <div className="stat-content">
            <p className="stat-label">Reviewed</p>
            <h2 className="stat-value">{stats.reviewed}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-star"></i></div>
          <div className="stat-content">
            <p className="stat-label">Avg Rating</p>
            <h2 className="stat-value">{stats.avgRating}</h2>
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
              placeholder="Search feedbacks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="filter-select" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
          </select>
          <button className="btn-icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            <i className={`fas fa-sort-${sortOrder === "asc" ? "up" : "down"}`}></i>
          </button>
          <button className="btn-danger" onClick={handleBulkDelete}>
            <i className="fas fa-trash"></i>
            <span>Delete Reviewed</span>
          </button>
        </div>
      </div>

      <div className="feedback-grid">
        {currentFeedbacks.length > 0 ? (
          currentFeedbacks.map((feedback) => (
            <div key={feedback.id} className="feedback-card-new">
              <div className="feedback-header-new">
                <div className="feedback-user-info">
                  <div className="feedback-avatar">{feedback.userName?.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4>{feedback.userName}</h4>
                      {!feedback.user && <span className="guest-badge">Guest</span>}
                    </div>
                    <p className="feedback-email">{feedback.userEmail}</p>
                  </div>
                </div>
                <span className={`status-badge-table ${feedback.status}`}>{feedback.status}</span>
              </div>
              <div className="feedback-rating-section">
                {renderStars(feedback.rating)}
                <span className="rating-number">{feedback.rating}/5</span>
              </div>
              <h3 className="feedback-subject">{feedback.subject}</h3>
              <p className="feedback-message-preview">{feedback.message?.substring(0, 100)}...</p>
              <div className="feedback-footer-new">
                <span className="feedback-time"><i className="fas fa-clock"></i> {getTimeAgo(feedback.createdAt)}</span>
                <div className="feedback-actions">
                  <button className="btn-icon-small" onClick={() => openViewModal(feedback)}><i className="fas fa-eye"></i></button>
                  <button className="btn-icon-small btn-delete-small" onClick={() => handleDeleteFeedback(feedback.id)}><i className="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
            <i className="fas fa-comments"></i>
            <p>No feedback found</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><i className="fas fa-chevron-left"></i></button>
          <span className="pagination-info">Page {currentPage} of {totalPages}</span>
          <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><i className="fas fa-chevron-right"></i></button>
        </div>
      )}

      {showViewModal && selectedFeedback && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Feedback Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="feedback-detail-view">
              <div style={{ marginBottom: '20px' }}>
                <label>User</label>
                <p><strong>{selectedFeedback.userName}</strong> ({selectedFeedback.userEmail})</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Rating</label>
                {renderStars(selectedFeedback.rating)}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Subject</label>
                <p>{selectedFeedback.subject}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Message</label>
                <p>{selectedFeedback.message}</p>
              </div>
              <div className="form-actions">
                {selectedFeedback.status === "pending" && (
                  <button className="action-btn primary" onClick={() => handleStatusChange(selectedFeedback.id, "reviewed")}>Mark Reviewed</button>
                )}
                <button className="action-btn cancel" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}