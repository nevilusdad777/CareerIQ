import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    jobType: "Full-time",
    skills: "",
    description: "",
    applyLink: ""
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs");
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      skills: typeof formData.skills === 'string' ? formData.skills.split(',').map(s => s.trim()) : formData.skills
    };
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/jobs/${editingId}`, dataToSend);
      } else {
        await axios.post("http://localhost:5000/api/jobs", dataToSend);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ title: "", company: "", location: "", salary: "", jobType: "Full-time", skills: "", description: "", applyLink: "" });
      fetchJobs();
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const handleEdit = (j) => {
    setEditingId(j._id);
    setFormData({
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary,
      jobType: j.jobType,
      skills: j.skills.join(", "),
      description: j.description || "",
      applyLink: j.applyLink
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job listing?")) {
      try {
        await axios.delete(`http://localhost:5000/api/jobs/${id}`);
        fetchJobs();
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar currentPage="jobs" />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="page-header">
            <div>
              <h1>Manage Job Listings</h1>
              <p>Post and manage job opportunities for CareerIQ students.</p>
            </div>
            <button className="btn-primary" onClick={() => { setEditingId(null); setShowModal(true); }}>
              <i className="fas fa-plus"></i> Post New Job
            </button>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Salary</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j._id}>
                      <td>{j.title}</td>
                      <td>{j.company}</td>
                      <td>{j.location}</td>
                      <td>{j.salary}</td>
                      <td><span className="badge">{j.jobType}</span></td>
                      <td className="actions">
                        <button className="btn-icon" onClick={() => handleEdit(j)}><i className="fas fa-edit"></i></button>
                        <button className="btn-icon delete" onClick={() => handleDelete(j._id)}><i className="fas fa-trash"></i></button>
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
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{editingId ? "Edit Job" : "Post New Job"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input type="text" name="company" value={formData.company} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Salary (LPA)</label>
                  <input type="text" name="salary" value={formData.salary} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Type</label>
                  <select name="jobType" value={formData.jobType} onChange={handleInputChange}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Required Skills (comma separated)</label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} placeholder="React, Node.js, CSS" />
                </div>
              </div>
              <div className="form-group">
                <label>Apply Link</label>
                <input type="url" name="applyLink" value={formData.applyLink} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Job Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4"></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Post Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
