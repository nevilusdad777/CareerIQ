import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";
import "./SkillManager.css";

export default function SkillManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userResults, setUserResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const detailsRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get("http://localhost:5000/api/admin/userskills", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && response.data.data) {
        setUserResults(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleViewDetails = (res) => {
    setSelectedResult(res);
    // Smooth scroll to details after a short delay to allow rendering
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const closeDetails = () => {
    setSelectedResult(null);
  };

  if (loading) return <div className="loading"><div className="spinner"></div><p>Syncing Library...</p></div>;

  return (
    <div className="admin-content-container premium">
      <div className="premium-animate" style={{ marginTop: "30px" }}>
        <div className="card elite" style={{ overflow: "hidden" }}>
           <table className="user-records-table">
             <thead>
               <tr>
                 <th>User</th>
                 <th>Overall Score</th>
                 <th>Predicted Role</th>
                 <th>Date</th>
                 <th>Details</th>
               </tr>
             </thead>
             <tbody>
               {userResults.length > 0 ? userResults.map((res, index) => (
                 <tr key={res._id || index}>
                   <td>
                     <div className="user-info-cell">
                       <div className="user-avatar">
                         {res.userName ? res.userName.charAt(0).toUpperCase() : 'U'}
                       </div>
                       <div className="user-details">
                         <span className="user-name">{res.userName || "Unknown User"}</span>
                         <span className="user-email">{res.email || "No email"}</span>
                       </div>
                     </div>
                  </td>
                   <td>
                      <span className={`badge ${res.overallScore >= 70 ? 'badge-success' : res.overallScore >= 40 ? 'badge-info' : 'badge-warning'}`}>
                        {res.overallScore}%
                      </span>
                   </td>
                   <td style={{ color: "#e2e8f0" }}>{res.predictedRole || "N/A"}</td>
                   <td style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                     {res.createdAt ? new Date(res.createdAt).toLocaleDateString() : "N/A"}
                   </td>
                   <td>
                      <button 
                        className="btn-icon-small" 
                        title="View Assessment Details"
                        onClick={() => handleViewDetails(res)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                   </td>
                 </tr>
               )) : (
                 <tr>
                   <td colSpan="5">
                     <div className="empty-state-message">
                       <i className="fas fa-database"></i>
                       <h3>No Assessment Records Found</h3>
                       <p>There are currently no MCQ assessment records available in the database.</p>
                     </div>
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </div>

      <div ref={detailsRef} className="detail-anchor"></div>

      {selectedResult && (
        <div className="detail-panel-inline">
          <div className="detail-panel-header">
            <div className="panel-title-group">
              <i className="fas fa-chart-line"></i>
              <h2>Assessment Analysis Record</h2>
            </div>
            <button className="panel-close-btn" onClick={closeDetails}>
              <i className="fas fa-times"></i> Close Analysis
            </button>
          </div>
          
          <div className="user-detail-body">
            <div className="detail-header-section">
              <div className="user-avatar large">{selectedResult.userName?.charAt(0).toUpperCase()}</div>
              <div className="detail-title-info">
                <h3>{selectedResult.userName}</h3>
                <p>{selectedResult.email}</p>
                <div className="detail-badges">
                  <span className="badge-pill bg-info">{selectedResult.totalQuestions} Questions</span>
                  <span className="badge-pill bg-success">{selectedResult.correctAnswers} Correct</span>
                </div>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-section">
                <h4><i className="fas fa-bullseye"></i> Performance Metrics</h4>
                <div className="detail-item">
                  <label>Overall Score:</label>
                  <span className="detail-value-text">{selectedResult.overallScore}%</span>
                </div>
                <div className="detail-item">
                  <label>Intelligence Index:</label>
                  <span className="detail-value-text">{selectedResult.intelligenceIndex}</span>
                </div>
                <div className="detail-item">
                  <label>Advanced capability Score:</label>
                  <span className="detail-value-text">{selectedResult.advancedCapabilityScore}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4><i className="fas fa-user-astronaut"></i> Predicted Career Path</h4>
                <div className="detail-item">
                  <label>Predicted Role:</label>
                  <span className="detail-value-text">{selectedResult.predictedRole}</span>
                </div>
                <div className="detail-item">
                  <label>Best Career Match:</label>
                  <span className="detail-value-text">{selectedResult.bestCareerMatch}</span>
                </div>
                <div className="detail-item">
                  <label>Date Attempted:</label>
                  <span className="detail-value-text">{new Date(selectedResult.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="detail-section full-width">
                <h4><i className="fas fa-list-check"></i> Detailed Answer Key</h4>
                <div className="analysis-grid-wrapper">
                  {selectedResult.answers.map((ans, idx) => (
                    <div key={idx} className={`analysis-card-elite ${ans.isCorrect ? 'correct' : 'incorrect'}`}>
                      <div className="analysis-card-header">
                        <span className="question-idx">Q{idx + 1}</span>
                        <div className="analysis-tags">
                          <span className="tag-category">{ans.category}</span>
                          <span className={`tag-difficulty ${ans.difficulty}`}>{ans.difficulty}</span>
                        </div>
                        <span className={`status-icon ${ans.isCorrect ? 'pass' : 'fail'}`}>
                          <i className={`fas fa-${ans.isCorrect ? 'check-circle' : 'times-circle'}`}></i>
                        </span>
                      </div>
                      <p className="question-text-analysis">{ans.questionText}</p>
                      <div className="answer-analysis-row">
                        <div className="answer-block">
                          <label>User's Choice</label>
                          <span className={ans.isCorrect ? 'val-correct' : 'val-incorrect'}>{ans.selectedAnswerText}</span>
                        </div>
                        {!ans.isCorrect && (
                          <div className="answer-block">
                            <label>Correct Choice</label>
                            <span className="val-correct">{ans.correctAnswerText}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="detail-footer">
              <div className="join-date-info">
                <i className="fas fa-shield-halved"></i> Verified Assessment Record • {selectedResult.userName}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}