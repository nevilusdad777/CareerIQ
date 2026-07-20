import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css"; // Reuse existing admin styles

const ManageInterviewPrep = () => {
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
    <div className="dashboard-layout">
      <AdminSidebar currentPage="interview-prep" />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="page-header">
            <div>
              <h1>Manage Interview Prep</h1>
              <p>Add and manage interview questions for students.</p>
            </div>
            <button className="btn-primary" onClick={() => { setEditingId(null); setShowModal(true); }}>
              <i className="fas fa-plus"></i> Add New Question
            </button>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q._id}>
                      <td className="truncate">{q.question}</td>
                      <td><span className={`badge ${q.category.toLowerCase()}`}>{q.category}</span></td>
                      <td>{q.difficulty}</td>
                      <td className="actions">
                        <button className="btn-icon" onClick={() => handleEdit(q)}><i className="fas fa-edit"></i></button>
                        <button className="btn-icon delete" onClick={() => handleDelete(q._id)}><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? "Edit Question" : "Add New Question"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question</label>
                <input type="text" name="question" value={formData.question} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Expert Answer</label>
                <textarea name="answer" value={formData.answer} onChange={handleInputChange} required rows="4"></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="Behavioral">Behavioral</option>
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="System Design">System Design</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select name="difficulty" value={formData.difficulty} onChange={handleInputChange}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Expert Tips</label>
                <textarea name="tips" value={formData.tips} onChange={handleInputChange} rows="2"></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInterviewPrep;
