import { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

export default function UserSkills() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedUsers, setExpandedUsers] = useState(new Set());

  useEffect(() => {
    fetchUserSkills();
  }, [search, sortBy, currentPage]);

  const fetchUserSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/admin/userskills', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          search,
          sortBy,
          page: currentPage,
          limit: 10
        }
      });

      if (response.data.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError('Failed to fetch user skills data');
      }
    } catch (err) {
      console.error('Error fetching user skills:', err);
      if (err.response?.status === 403) {
        setError('Admin access required');
      } else if (err.response?.status === 401) {
        setError('Please login to access this page');
      } else {
        setError('Failed to fetch user skills data');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const exportData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/userskills/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user-skills-data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading user skills data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-section">
          <div className="error-message">{error}</div>
          <button className="submit-btn" onClick={fetchUserSkills}>
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1><i className="fas fa-users"></i> User Skills Analysis</h1>
        <p className="admin-subtitle">Detailed performance metrics and answer analysis for all users</p>
      </div>

      {/* Controls */}
      <div className="admin-controls">
        <div className="control-group">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i>
        </div>

        <div className="control-group">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="sort-select"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="score">Sort by Score</option>
            <option value="intelligence">Sort by Intelligence</option>
            <option value="advanced">Sort by Advanced Capability</option>
          </select>
        </div>

        <button className="export-btn" onClick={exportData}>
          <i className="fas fa-download"></i> Export CSV
        </button>
      </div>

      {/* User Cards */}
      <div className="users-grid">
        {users.map((user, index) => (
          <div key={index} className="user-card">
            <div className="user-header">
              <div className="user-info">
                <h3>{user.userName}</h3>
                <p><i className="fas fa-envelope"></i> {user.email}</p>
              </div>
              <div className="user-date">
                <i className="fas fa-calendar"></i>
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">{user.overallScore}%</div>
                <div className="metric-label">Overall Score</div>
                <div className="metric-sublabel">General Performance</div>
              </div>

              <div className="metric-card">
                <div className="metric-value">{user.intelligenceIndex}</div>
                <div className="metric-label">Intelligence Index</div>
                <div className="metric-sublabel">Advanced Capability</div>
              </div>

              <div className="metric-card">
                <div className="metric-value">{user.advancedCapabilityScore}</div>
                <div className="metric-label">Advanced Capability</div>
                <div className="metric-sublabel">Complex Problem Solving</div>
              </div>

              <div className="metric-card">
                <div className="metric-value" style={{fontSize: '16px'}}>{user.predictedRole}</div>
                <div className="metric-label">Predicted Role</div>
                <div className="metric-sublabel">Best Career Match</div>
              </div>

              <div className="metric-card" style={{ gridColumn: '1 / -1' }}>
                <div className="metric-value" style={{fontSize: '14px'}}>{user.bestCareerMatch}</div>
                <div className="metric-label">Best Career Match</div>
                <div className="metric-sublabel">Optimized Career Path</div>
              </div>
            </div>

            {/* Answer Summary */}
            <div className="answer-summary">
              <div className="answer-stat correct">
                <i className="fas fa-check-circle"></i>
                <span>Correct: {user.correctAnswers}</span>
              </div>
              <div className="answer-stat incorrect">
                <i className="fas fa-times-circle"></i>
                <span>Incorrect: {user.incorrectAnswers}</span>
              </div>
              <div className="answer-stat total">
                <i className="fas fa-list"></i>
                <span>Total: {user.totalQuestions}</span>
              </div>
            </div>

            {/* Expandable Details */}
            <div className="expandable-section">
              <button 
                className="expand-btn"
                onClick={() => toggleUserExpansion(index)}
              >
                <i className={`fas fa-chevron-${expandedUsers.has(index) ? 'up' : 'down'}`}></i>
                {expandedUsers.has(index) ? 'Hide' : 'Show'} Detailed Answers
              </button>

              {expandedUsers.has(index) && (
                <div className="detailed-answers">
                  <h4><i className="fas fa-list-alt"></i> Question Analysis</h4>
                  <div className="answers-table-container">
                    <table className="answers-table">
                      <thead>
                        <tr>
                          <th>Question</th>
                          <th>Selected Answer</th>
                          <th>Correct Answer</th>
                          <th>Result</th>
                          <th>Category</th>
                          <th>Difficulty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.answers.map((answer, ansIndex) => (
                          <tr key={ansIndex} className={answer.isCorrect ? 'correct-row' : 'incorrect-row'}>
                            <td className="question-cell">
                              <div className="question-text">{answer.questionText}</div>
                            </td>
                            <td className="selected-answer">
                              {answer.selectedAnswerText}
                            </td>
                            <td className="correct-answer">
                              {answer.correctAnswerText}
                            </td>
                            <td className="result-cell">
                              <span className={`result-badge ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                                {answer.isCorrect ? (
                                  <><i className="fas fa-check"></i> Correct</>
                                ) : (
                                  <><i className="fas fa-times"></i> Incorrect</>
                                )}
                              </span>
                            </td>
                            <td className="category-cell">
                              <span className="category-tag">{answer.category}</span>
                            </td>
                            <td className="difficulty-cell">
                              <span className={`difficulty-tag difficulty-${answer.difficulty}`}>
                                {answer.difficulty}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i> Previous
          </button>

          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {users.length === 0 && !loading && (
        <div className="no-data">
          <i className="fas fa-users"></i>
          <h3>No user data found</h3>
          <p>Try adjusting your search criteria or check back later for new submissions.</p>
        </div>
      )}
    </div>
  );
}
