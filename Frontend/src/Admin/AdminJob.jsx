import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminJob.css";

const AdminJob = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('listings'); // listings, applications
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    jobType: "Full-time",
    skills: "",
    description: "",
    applyLink: "",
    experience: "Any Experience"
  });

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setAppsLoading(true);
      const res = await axios.get("http://localhost:5000/api/applications");
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setAppsLoading(false);
    }
  };

  const updateApplicationStatus = async (id, status) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/applications/${id}/status`, { status });
      if (res.data.success) {
        fetchApplications();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

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
      applyLink: j.applyLink,
      experience: j.experience || "Any Experience"
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
    <div className="admin-content-container">
      <div className="admin-page-header">
        <div className="header-meta">
          <h1>Job Opportunity Radar</h1>
          <p>Publish and track high-value career openings for students.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => { setEditingId(null); setShowModal(true); }}>
          <i className="fas fa-paper-plane"></i> Live Post
        </button>
      </div>

      <div className="admin-stats-bar">
        <div className="stat-item-mini">
          <div className="stat-icon-mini"><i className="fas fa-briefcase"></i></div>
          <div className="stat-info-mini">
            <h3>Active Listings</h3>
            <p>{jobs.length}</p>
          </div>
        </div>
        <div className="stat-item-mini">
          <div className="stat-icon-mini" style={{ background: '#fef3c7', color: '#d97706' }}><i className="fas fa-users"></i></div>
          <div className="stat-info-mini">
            <h3>Total Applications</h3>
            <p>{applications.length}</p>
          </div>
        </div>
        <div className="stat-item-mini">
          <div className="stat-icon-mini" style={{ background: '#ecfdf5', color: '#10b981' }}><i className="fas fa-check-circle"></i></div>
          <div className="stat-info-mini">
            <h3>Pending Review</h3>
            <p>{applications.filter(a => a.status === 'Pending').length}</p>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          Job Listings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Student Applications
        </button>
      </div>

      {activeTab === 'listings' ? (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Job Detail</th>
                <th>Salary</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Scanning for listings...</td></tr>
              ) : jobs.length > 0 ? (
                jobs.map((j) => (
                  <tr key={j._id}>
                    <td>
                      <div style={{ fontWeight: '700', fontSize: '1rem' }}>{j.title}</div>
                      <div style={{ color: 'var(--admin-primary)', fontWeight: '600', fontSize: '0.8rem' }}>{j.company}</div>
                      <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}><i className="fas fa-map-marker-alt"></i> {j.location}</div>
                    </td>
                    <td style={{ fontWeight: '700' }}>{j.salary}</td>
                    <td><span className="admin-badge blue-light">{j.jobType}</span></td>
                    <td><span className="admin-badge blue">Active</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="admin-btn-icon" onClick={() => handleEdit(j)} title="Edit">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="admin-btn-icon delete" onClick={() => handleDelete(j._id)} title="Delete Listing">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>The radar is clear. Post a job to attract talent!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Job Applied</th>
                <th>Response / Message</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {appsLoading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Fetching applications...</td></tr>
              ) : applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: '700' }}>{app.name || app.userId?.name || "Guest Student"}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>{app.email || app.userId?.email || "guest@careeriq.com"}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{app.jobId?.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-primary)' }}>{app.jobId?.company}</div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div className="app-message" title={app.message}>{app.message}</div>
                    </td>
                    <td>
                      <span className={`admin-badge ${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <select 
                          className="status-select"
                          value={app.status}
                          onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No applications received yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>{editingId ? "Modify Listing" : "Create Career Entry"}</h2>
              <button className="admin-btn-icon" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                  <div className="admin-form-group">
                    <label><i className="fas fa-briefcase" style={{ fontSize: '0.55rem', marginRight: '0.25rem' }}></i>Position Title</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="e.g. Senior Frontend Engineer" 
                    />
                  </div>
                  <div className="admin-form-group">
                    <label><i className="fas fa-building" style={{ fontSize: '0.55rem', marginRight: '0.25rem' }}></i>Hiring Company</label>
                    <input 
                      type="text" 
                      name="company" 
                      value={formData.company} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="e.g. Google India" 
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                  <div className="admin-form-group">
                    <label><i className="fas fa-map-marker-alt" style={{ fontSize: '0.55rem', marginRight: '0.25rem' }}></i>Location</label>
                    <input 
                      type="text" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="e.g. Remote / Hybrid" 
                    />
                  </div>
                  <div className="admin-form-group">
                    <label><i className="fas fa-dollar-sign" style={{ fontSize: '0.55rem', marginRight: '0.25rem' }}></i>Compensation (Annual)</label>
                    <input 
                      type="text" 
                      name="salary" 
                      value={formData.salary} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="e.g. 12 - 18 LPA" 
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                  <div className="admin-form-group">
                    <label><i className="fas fa-clock" style={{ fontSize: '0.55rem', marginRight: '0.25rem' }}></i>Employment Nature</label>
                    <select name="jobType" value={formData.jobType} onChange={handleInputChange}>
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label><i className="fas fa-signal" style={{ fontSize: '0.55rem', marginRight: '0.25rem' }}></i>Experience Level</label>
                    <select name="experience" value={formData.experience} onChange={handleInputChange}>
                      <option value="Any Experience">Any Experience</option>
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid-Senior">Mid-Senior</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label><i className="fas fa-code" style={{ fontSize: '0.55rem', marginRight: '0.25rem' }}></i>Primary Tech Stack (Comma Separated)</label>
                  <input 
                    type="text" 
                    name="skills" 
                    value={formData.skills} 
                    onChange={handleInputChange} 
                    placeholder="React, Swift, AWS..." 
                  />
                </div>
                <div className="admin-form-group" style={{ position: 'relative' }}>
                  <label><i className="fas fa-link" style={{ fontSize: '0.55rem', marginRight: '0.25rem' }}></i>Application Portal URL</label>
                  <i className="fas fa-external-link-alt url-icon" style={{ position: 'absolute', left: '0.45rem', top: '1.5rem', color: '#52525b', fontSize: '0.55rem' }}></i>
                  <input 
                    type="url" 
                    name="applyLink" 
                    value={formData.applyLink} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="https://careers.example.com/apply" 
                    style={{ paddingLeft: '1.6rem' }}
                  />
                </div>
                <div className="admin-form-group">
                  <label><i className="fas fa-file-alt" style={{ fontSize: '0.55rem', marginRight: '0.25rem' }}></i>Role Overview (Brief)</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows="2" 
                    placeholder="Describe the mission and requirements..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)}>
                  <i className="fas fa-arrow-left" style={{ marginRight: '0.5rem' }}></i>
                  Back
                </button>
                <button type="submit" className="admin-btn-primary">
                  <i className="fas fa-paper-plane" style={{ marginRight: '0.75rem' }}></i>
                  {editingId ? "Save Changes" : "Push to Portal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJob;
