import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlay, FaCheckCircle, FaRegCircle, FaArrowLeft, FaExternalLinkAlt, FaBook, FaVideo, FaLink } from "react-icons/fa";
import { API_BASE_URL } from '../../utils/constants';
import "./RoadmapDetailed.css";

const RoadmapDetailed = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, [id]);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/roadmap/detail/${id}`);
      if (response.data.success) {
        setRoadmap(response.data.data);
      } else {
        setError("Failed to load technical roadmap.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error: Could not synchronize with expertise database.");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleId, currentStatus) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/roadmap/${id}/toggle-module`, {
        moduleId,
        completed: !currentStatus
      });
      if (response.data.success) {
        setRoadmap(response.data.data);
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const getModuleIcon = (type) => {
    switch (type) {
      case "video": return <FaVideo />;
      case "article": return <FaBook />;
      case "course": return <FaLink />;
      default: return <FaExternalLinkAlt />;
    }
  };

  if (loading) return <div className="roadmap-loading-state">
    <div className="discovery-spinner"></div>
    <p>Calibrating Mastery Path...</p>
  </div>;

  if (error || !roadmap) return <div className="roadmap-error-state">
    <h2>Transmission Interrupted</h2>
    <p>{error || "The requested roadmap does not exist."}</p>
    <button onClick={() => navigate(-1)} className="btn-back-elite">Return to Interface</button>
  </div>;

  return (
    <div className="roadmap-detailed-wrapper premium">
      <div className="roadmap-nav-top">
        <button onClick={() => navigate(-1)} className="btn-back-link">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <header className="roadmap-detailed-header">
        <div className="header-badge">MASTERY PATH</div>
        <h1>{roadmap.competencyName}</h1>
        <p className="roadmap-overview">{roadmap.overview}</p>
        
        <div className="roadmap-progress-container-elite">
          <div className="progress-label-row">
            <span>Path Completion</span>
            <span className="percent-indicator">{roadmap.progress}%</span>
          </div>
          <div className="progress-track-elite">
            <div className="progress-fill-elite" style={{ width: `${roadmap.progress}%` }}></div>
          </div>
        </div>
      </header>

      <div className="modules-grid-elite">
        {roadmap.modules.map((module, index) => (
          <div key={module._id} className={`module-card-elite ${module.completed ? 'completed' : ''}`}>
            <div className="module-index">#0{index + 1}</div>
            <div className="module-content-elite">
              <div className="module-type-icon">{getModuleIcon(module.type)}</div>
              <h3 className="module-title">{module.title}</h3>
              <div className="module-meta">
                <span className="type-badge">{module.type.toUpperCase()}</span>
                <a href={module.link} target="_blank" rel="noopener noreferrer" className="btn-view-res">
                  Launch Resource <FaExternalLinkAlt />
                </a>
              </div>
            </div>
            <button 
              className={`module-action-btn ${module.completed ? 'completed' : ''}`}
              onClick={() => toggleModule(module._id, module.completed)}
            >
              {module.completed ? <FaCheckCircle /> : <FaRegCircle />}
              <span>{module.completed ? 'Achieved' : 'Initialize'}</span>
            </button>
          </div>
        ))}
      </div>

      {roadmap.modules.length === 0 && (
        <div className="empty-roadmap-state">
          <p>No modules have been defined for this mastery path yet.</p>
        </div>
      )}
    </div>
  );
};

export default RoadmapDetailed;
