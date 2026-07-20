import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminInterview.css";

const AdminInterview = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "Technical",
    tips: "",
    difficulty: "Intermediate"
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/interview");
      if (res.data.success) {
        setQuestions(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/interview/${editingId}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/interview", formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ question: "", answer: "", category: "Technical", tips: "", difficulty: "Intermediate" });
      fetchQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleEdit = (q) => {
    setEditingId(q._id);
    setFormData({
      question: q.question,
      answer: q.answer,
      category: q.category,
      tips: q.tips,
      difficulty: q.difficulty
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await axios.delete(`http://localhost:5000/api/interview/${id}`);
        fetchQuestions();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  return (
    <div className="admin-interview-container">
      <div className="admin-interview-header">
        <div>
          <h1>Interview Prep Manager</h1>
          <p>Curate technical and behavioral questions for the student portal.</p>
        </div>
        <button className="admin-add-question-btn" onClick={() => { setEditingId(null); setShowModal(true); }}>
          <i className="fas fa-plus"></i> Add Question
        </button>
      </div>

      <div className="admin-interview-stats">
        <div className="admin-interview-stat">
          <div className="admin-interview-stat-icon">
            <i className="fas fa-question-circle"></i>
          </div>
          <div className="admin-interview-stat-content">
            <h3>Total Questions</h3>
            <p>{questions.length}</p>
          </div>
        </div>
        <div className="admin-interview-stat">
          <div className="admin-interview-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <i className="fas fa-code"></i>
          </div>
          <div className="admin-interview-stat-content">
            <h3>Technical</h3>
            <p>{questions.filter(q => q.category === 'Technical').length}</p>
          </div>
        </div>
        <div className="admin-interview-stat">
          <div className="admin-interview-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <i className="fas fa-brain"></i>
          </div>
          <div className="admin-interview-stat-content">
            <h3>Behavioral</h3>
            <p>{questions.filter(q => q.category === 'Behavioral').length}</p>
          </div>
        </div>
      </div>

      <div className="admin-interview-table-container">
        <table className="admin-interview-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Question</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="admin-interview-loading">Fetching questions...</td></tr>
            ) : questions.length > 0 ? (
              questions.map((q) => (
                <tr key={q._id}>
                  <td className="admin-interview-question" title={q.question}>{q.question}</td>
                  <td>
                    <span className={`admin-interview-badge ${q.category.toLowerCase()}`}>
                      {q.category}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-interview-badge ${q.difficulty.toLowerCase()}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td>
                    <div className="admin-interview-actions">
                      <button className="admin-interview-action-btn" onClick={() => handleEdit(q)} title="Edit">
                        <i className="fas fa-pen-nib"></i>
                      </button>
                      <button className="admin-interview-action-btn delete" onClick={() => handleDelete(q._id)} title="Delete">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="admin-interview-empty">
                <i className="fas fa-inbox"></i>
                <p>No questions found. Add some to get started!</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-interview-modal-overlay">
          <div className="admin-interview-modal">
            <div className="admin-interview-modal-header">
              <h2>{editingId ? "Update Question" : "New Interview Question"}</h2>
              <button className="admin-interview-modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-interview-modal-body">
                <div className="admin-interview-form-group">
                  <label className="admin-interview-form-label">Question Prompt</label>
                  <input 
                    type="text" 
                    name="question" 
                    value={formData.question} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. Tell me about a time you failed." 
                    className="admin-interview-form-input"
                  />
                </div>
                <div className="admin-interview-form-group">
                  <label className="admin-interview-form-label">Model Answer (Secret)</label>
                  <textarea 
                    name="answer" 
                    value={formData.answer} 
                    onChange={handleInputChange} 
                    required 
                    rows="3" 
                    placeholder="Provide a high-quality reference answer..."
                    className="admin-interview-form-textarea"
                  ></textarea>
                </div>
                <div className="admin-interview-form-grid">
                  <div className="admin-interview-form-group">
                    <label className="admin-interview-form-label">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="admin-interview-form-select">
                      <option value="Technical">Technical</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="HR">HR</option>
                      <option value="Logic">Logic</option>
                    </select>
                  </div>
                  <div className="admin-interview-form-group">
                    <label className="admin-interview-form-label">Difficulty</label>
                    <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="admin-interview-form-select">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="admin-interview-form-group">
                  <label className="admin-interview-form-label">Expert Insider Tips</label>
                  <textarea 
                    name="tips" 
                    value={formData.tips} 
                    onChange={handleInputChange} 
                    rows="2" 
                    placeholder="Mention specific keywords or STAR method tips..."
                    className="admin-interview-form-textarea"
                  ></textarea>
                </div>
              </div>
              <div className="admin-interview-modal-footer">
                <button type="button" className="admin-interview-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-interview-btn-submit">
                  {editingId ? "Update Question" : "Create Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInterview;
