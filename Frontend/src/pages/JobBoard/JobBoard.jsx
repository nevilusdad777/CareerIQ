import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JobBoard.css';

const JobBoard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  
  // Filter states
  const [selectedTypes, setSelectedTypes] = useState(['Full-time', 'Part-time', 'Remote', 'Internship']);
  const [salaryFilter, setSalaryFilter] = useState('All Ranges');
  const [experienceFilter, setExperienceFilter] = useState('Any Experience');
  const [savedJobIds, setSavedJobIds] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (user && (user._id || user.id)) {
      try {
        const userId = user._id || user.id;
        const res = await axios.get(`http://localhost:5000/api/users/saved-jobs/${userId}`);
        if (res.data.success) {
          setSavedJobIds(res.data.savedJobs.map(job => job._id || job.id));
        }
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      }
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

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleBookmarkToggle = async (jobId) => {
    const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (!user) {
      alert("Please log in to bookmark jobs.");
      return;
    }

    try {
      const userId = user._id || user.id;
      const res = await axios.post("http://localhost:5000/api/users/bookmark", {
        userId,
        jobId
      });

      if (res.data.success) {
        setSavedJobIds(res.data.savedJobs);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("Failed to update bookmark.");
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Get userId from sessionStorage to match login system
    let user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    
    if (!user || (!user._id && !user.id)) {
      console.log("No user found, using Guest Student for application.");
      user = {
        _id: "69ba3bd3b50f4bda9d5cbd74", // Dedicated Guest Student ID
        name: "Guest Student",
        email: "guest@careeriq.com"
      };
    }

    const userId = user._id || user.id;

    try {
      const res = await axios.post("http://localhost:5000/api/applications", {
        jobId: selectedJob._id,
        userId: userId,
        message: applicationMessage,
        name: guestName || user.name,
        email: guestEmail || user.email
      });

      if (res.data.success) {
        alert("Application submitted successfully!");
        setShowApplyModal(false);
        setApplicationMessage('');
        setGuestName('');
        setGuestEmail('');
        setSelectedJob(null);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="job-board-container">
      <header className="job-header">
        <div className="header-info">
          <h1><i className="fas fa-briefcase"></i> Job Opportunity Board</h1>
          <p>Explore exclusive roles from top tech companies across the globe.</p>
        </div>
        <div className="search-bar-v2">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search by role, company, or keyword..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn-v2">Find Jobs</button>
        </div>
      </header>

      <div className="board-layout">
        <aside className="board-filters">
          <div className="filter-group">
            <h3>Job Type</h3>
            {['Full-time', 'Part-time', 'Remote', 'Internship'].map(type => (
              <label key={type}>
                <input 
                  type="checkbox" 
                  checked={selectedTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTypes([...selectedTypes, type]);
                    } else {
                      setSelectedTypes(selectedTypes.filter(t => t !== type));
                    }
                  }}
                /> {type}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h3>Salary Range</h3>
            <select value={salaryFilter} onChange={(e) => setSalaryFilter(e.target.value)}>
              <option value="All Ranges">All Ranges</option>
              <option value="5-10 LPA">5-10 LPA</option>
              <option value="10-20 LPA">10-20 LPA</option>
              <option value="20-40 LPA">20-40 LPA</option>
              <option value="40+ LPA">40+ LPA</option>
            </select>
          </div>

          <div className="filter-group">
            <h3>Experience</h3>
            {['Any Experience', 'Entry Level', 'Mid-Senior', 'Expert'].map(exp => (
              <label key={exp}>
                <input 
                  type="radio" 
                  name="exp" 
                  checked={experienceFilter === exp}
                  onChange={() => setExperienceFilter(exp)}
                /> {exp}
              </label>
            ))}
          </div>
        </aside>

        <main className="job-listings">
          <div className="listings-header">
            <span>Showing {jobs.length} active jobs</span>
            <div className="sort-by">
              Sort by: <strong>Newest First</strong> <i className="fas fa-chevron-down"></i>
            </div>
          </div>

          <div className="jobs-grid-v2">
            {loading ? (
              <div className="loading-spinner">Searching for opportunities...</div>
            ) : jobs.length > 0 ? (
              jobs.filter(job => {
                const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                     job.company.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = selectedTypes.includes(job.jobType);
                const matchesSalary = salaryFilter === 'All Ranges' || job.salary.includes(salaryFilter);
                const matchesExp = experienceFilter === 'Any Experience' || job.experience === experienceFilter;
                
                return matchesSearch && matchesType && matchesSalary && matchesExp;
              }).map(job => (
                <div key={job._id} className="job-card-v2">
                  <div className="job-card-header">
                    <div className="company-logo-placeholder">
                      {job.company.charAt(0)}
                    </div>
                    <div className="title-area">
                      <h3>{job.title}</h3>
                      <span className="company-name">{job.company}</span>
                    </div>
                    <button 
                      className={`bookmark-job ${savedJobIds.includes(job._id) ? 'active' : ''}`}
                      onClick={() => handleBookmarkToggle(job._id)}
                    >
                      <i className={savedJobIds.includes(job._id) ? "fas fa-heart" : "far fa-heart"}></i>
                    </button>
                  </div>
                  
                  <div className="job-meta">
                    <span><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                    <span><i className="fas fa-money-bill-wave"></i> {job.salary}</span>
                    <span><i className="fas fa-clock"></i> {job.jobType}</span>
                    <span><i className="fas fa-signal"></i> {job.experience || "Any Experience"}</span>
                  </div>

                  <div className="job-tags">
                    {job.skills.map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>

                  <div className="job-card-footer">
                    <span className="posted-at">{new Date(job.postedDate).toLocaleDateString()}</span>
                    <button 
                      onClick={() => handleApplyClick(job)}
                      className="apply-now-btn"
                    >
                      Apply Now <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No jobs posted yet. Check back soon!</div>
            )}
          </div>
        </main>
      </div>

      {showApplyModal && (
        <div className="apply-modal-overlay">
          <div className="apply-modal">
            <div className="apply-modal-header">
              <h2 id="elite-modal-title" style={{ color: '#000000', margin: 0 }}><i className="fas fa-paper-plane" style={{ marginRight: '0.75rem', color: '#000000' }}></i>Apply for {selectedJob?.title}</h2>
              <button 
                className="close-modal" 
                onClick={() => setShowApplyModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleApplySubmit}>
              <div className="apply-modal-body">
                <div className="job-summary">
                  <div className="company"><i className="fas fa-building" style={{ marginRight: '0.5rem', color: 'var(--job-primary)' }}></i>{selectedJob?.company}</div>
                  <div className="location"><i className="fas fa-map-marker-alt" style={{ marginRight: '0.5rem', color: 'var(--job-primary)' }}></i>{selectedJob?.location}</div>
                </div>

                {(!sessionStorage.getItem('currentUser')) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div className="apply-form-group">
                      <label style={{ color: '#000000', fontWeight: 'bold' }}>Your Full Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. Meet Kaswala"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                      />
                    </div>
                    <div className="apply-form-group">
                      <label style={{ color: '#000000', fontWeight: 'bold' }}>Email Address</label>
                      <input 
                        type="email"
                        placeholder="e.g. meet@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                      />
                    </div>
                  </div>
                )}
                <div className="apply-form-group">
                  <label style={{ color: '#000000', fontWeight: 'bold' }}>Why are you interested in this role?</label>
                  <textarea 
                    placeholder="Tell the recruiter about your interest and relevant experience..."
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="apply-modal-footer">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-application-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoard;
