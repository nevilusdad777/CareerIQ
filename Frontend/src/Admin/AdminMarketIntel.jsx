import { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import "./AdminMarketIntel.css";

export default function AdminMarketIntel() {
  const [intelData, setIntelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchIntelData();
  }, []);

  const fetchIntelData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/market-intel");
      if (res.data.success && res.data.data) {
        setIntelData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching admin market intel:", error);
      setMessage("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const saveIntelData = async () => {
    try {
      setSaving(true);
      setMessage("");
      const res = await axios.put("http://localhost:5000/api/market-intel", intelData);
      if (res.data.success) {
        setMessage("✅ Market Intel Data saved successfully!");
        setIntelData(res.data.data); // Update with server timestamp
      }
    } catch (error) {
      console.error("Error saving intel data:", error);
      setMessage("❌ Failed to save data");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // --- Helpers for Arrays ---
  const handleRoleChange = (index, field, value) => {
    const newData = { ...intelData };
    newData.jobRoles[index][field] = value;
    setIntelData(newData);
  };

  const addRole = () => {
    const newData = { ...intelData };
    newData.jobRoles.push({
      role: "New Role", demand: "High", demandLevel: 50, growth: "+0%",
      avgSalary: "5 - 10 LPA", minSalary: 5, maxSalary: 10,
      skills: [], topCompanies: [], placementChance: 50
    });
    setIntelData(newData);
  };

  const deleteRole = (index) => {
    const newData = { ...intelData };
    newData.jobRoles.splice(index, 1);
    setIntelData(newData);
  };

  // --- Helpers for Skill Demands ---
  const handleSkillDemandChange = (index, field, value) => {
    const newData = { ...intelData };
    if (!newData.skillDemands) newData.skillDemands = [];
    newData.skillDemands[index][field] = value;
    setIntelData(newData);
  };

  const addSkillDemand = () => {
    const newData = { ...intelData };
    if (!newData.skillDemands) newData.skillDemands = [];
    newData.skillDemands.push({
      skill: "New Skill",
      demand: "High",
      icon: "💻",
      demandPercent: 75,
      growth: "+15%"
    });
    setIntelData(newData);
  };

  const deleteSkillDemand = (index) => {
    const newData = { ...intelData };
    newData.skillDemands.splice(index, 1);
    setIntelData(newData);
  };

  // --- Helpers for Trending Skills ---
  const handleTrendingSkillChange = (index, field, value) => {
    const newData = { ...intelData };
    if (!newData.trendingSkills) newData.trendingSkills = [];
    newData.trendingSkills[index][field] = field === 'jobs' ? Number(value) : value;
    setIntelData(newData);
  };

  const addTrendingSkill = () => {
    const newData = { ...intelData };
    if (!newData.trendingSkills) newData.trendingSkills = [];
    newData.trendingSkills.push({
      skill: "New Trending Skill",
      trend: "🔥 Hot",
      growth: "+25%",
      jobs: 500
    });
    setIntelData(newData);
  };

  const deleteTrendingSkill = (index) => {
    const newData = { ...intelData };
    newData.trendingSkills.splice(index, 1);
    setIntelData(newData);
  };

  // --- Helpers for Location Demand ---
  const handleLocationChange = (locationKey, field, value) => {
    const newData = { ...intelData };
    if (!newData.locationDemands) newData.locationDemands = {};
    if (!newData.locationDemands[locationKey]) {
        newData.locationDemands[locationKey] = { demand: "Medium", jobs: 0, avgSalary: "0 LPA", growth: "+0%" };
    }
    newData.locationDemands[locationKey][field] = value;
    setIntelData(newData);
  };

  const handleLocationNameChange = (oldKey, newKey) => {
    if (oldKey === newKey || newKey.trim() === "") return;
    const newData = { ...intelData };
    if (!newData.locationDemands) newData.locationDemands = {};
    
    // Copy data to new key, delete old key
    newData.locationDemands[newKey] = newData.locationDemands[oldKey];
    delete newData.locationDemands[oldKey];
    
    setIntelData(newData);
  }

  const addLocation = () => {
    const newData = { ...intelData };
    if (!newData.locationDemands) newData.locationDemands = {};
    
    let baseName = "New City";
    let name = baseName;
    let count = 1;
    while (newData.locationDemands[name]) {
        name = `${baseName} ${count}`;
        count++;
    }
    
    newData.locationDemands[name] = {
      demand: "High", 
      jobs: 1000, 
      avgSalary: "6 - 12 LPA", 
      growth: "+15%"
    };
    setIntelData(newData);
  };

  const deleteLocation = (locationKey) => {
    const newData = { ...intelData };
    if (newData.locationDemands && newData.locationDemands[locationKey]) {
        delete newData.locationDemands[locationKey];
        setIntelData(newData);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Market Intelligence Data...</p>
      </div>
    );
  }

  if (!intelData) return <div>No intel data found.</div>;

  return (
    <div className="admin-content-container inner-padding">
      <div className="admin-intel-header">
        <div className="header-meta">
          <h1>Global Market Intelligence Data</h1>
          <p>Update trends, demand scores, and salary benchmarks for student dashboards.</p>
        </div>
        <div className="header-actions">
          {message && <span className="save-message">{message}</span>}
          <span className="last-updated">Last Updated: {new Date(intelData.lastUpdated).toLocaleString()}</span>
          <button className="btn-save" onClick={saveIntelData} disabled={saving}>
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>

      <div className="admin-intel-content">
        {/* Job Roles Section */}
        <section className="intel-section">
          <div className="section-header">
            <h3>Job Roles Database ({intelData.jobRoles?.length || 0})</h3>
            <button className="btn-add" onClick={addRole}>+ Add New Role</button>
          </div>
          
          <div className="roles-grid">
            {intelData.jobRoles?.map((role, idx) => (
              <div key={idx} className="role-editor-card">
                <div className="card-header">
                  <input 
                    className="role-title-input" 
                    value={role.role || ""} 
                    onChange={(e) => handleRoleChange(idx, "role", e.target.value)} 
                  />
                  <button className="btn-delete" onClick={() => deleteRole(idx)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Demand (e.g. High, Very High)</label>
                    <input value={role.demand || ""} onChange={(e) => handleRoleChange(idx, "demand", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Demand Score (0-100)</label>
                    <input type="number" value={role.demandLevel || 0} onChange={(e) => handleRoleChange(idx, "demandLevel", Number(e.target.value))} />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Avg Salary Label (e.g. 5 - 10 LPA)</label>
                    <input value={role.avgSalary || ""} onChange={(e) => handleRoleChange(idx, "avgSalary", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Growth Label</label>
                    <input value={role.growth || ""} onChange={(e) => handleRoleChange(idx, "growth", e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Skills (comma separated)</label>
                  <input 
                    value={role.skills?.join(", ") || ""} 
                    onChange={(e) => handleRoleChange(idx, "skills", e.target.value.split(",").map(s => s.trim()))} 
                  />
                </div>

                <div className="form-group">
                  <label>Top Companies (comma separated)</label>
                  <input 
                    value={role.topCompanies?.join(", ") || ""} 
                    onChange={(e) => handleRoleChange(idx, "topCompanies", e.target.value.split(",").map(c => c.trim()))} 
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skill Demands Section */}
        <section className="intel-section">
          <div className="section-header">
            <h3>Skill Demands ({intelData.skillDemands?.length || 0})</h3>
            <button className="btn-add" onClick={addSkillDemand}>+ Add New Skill</button>
          </div>
          
          <div className="roles-grid">
            {intelData.skillDemands?.map((skill, idx) => (
              <div key={idx} className="role-editor-card">
                <div className="card-header">
                  <input 
                    className="role-title-input" 
                    value={skill.skill || ""} 
                    onChange={(e) => handleSkillDemandChange(idx, "skill", e.target.value)} 
                  />
                  <button className="btn-delete" onClick={() => deleteSkillDemand(idx)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Demand Level</label>
                    <select value={skill.demand || ""} onChange={(e) => handleSkillDemandChange(idx, "demand", e.target.value)}>
                      <option value="Very High">Very High</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Demand Percent (0-100)</label>
                    <input type="number" value={skill.demandPercent || 0} onChange={(e) => handleSkillDemandChange(idx, "demandPercent", Number(e.target.value))} />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Icon (emoji)</label>
                    <input value={skill.icon || ""} onChange={(e) => handleSkillDemandChange(idx, "icon", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Growth Rate</label>
                    <input value={skill.growth || ""} onChange={(e) => handleSkillDemandChange(idx, "growth", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Skills Section */}
        <section className="intel-section">
          <div className="section-header">
            <h3>Trending Skills ({intelData.trendingSkills?.length || 0})</h3>
            <button className="btn-add" onClick={addTrendingSkill}>+ Add New Trending Skill</button>
          </div>
          
          <div className="roles-grid">
            {intelData.trendingSkills?.map((skill, idx) => (
              <div key={idx} className="role-editor-card">
                <div className="card-header">
                  <input 
                    className="role-title-input" 
                    value={skill.skill || ""} 
                    onChange={(e) => handleTrendingSkillChange(idx, "skill", e.target.value)} 
                  />
                  <button className="btn-delete" onClick={() => deleteTrendingSkill(idx)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Trend Label</label>
                    <input value={skill.trend || ""} onChange={(e) => handleTrendingSkillChange(idx, "trend", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Growth Rate</label>
                    <input value={skill.growth || ""} onChange={(e) => handleTrendingSkillChange(idx, "growth", e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Number of Jobs</label>
                  <input type="number" value={skill.jobs || 0} onChange={(e) => handleTrendingSkillChange(idx, "jobs", e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Location Based Demand Section */}
        <section className="intel-section">
          <div className="section-header">
            <h3>Location-Based Demand ({Object.keys(intelData.locationDemands || {}).length})</h3>
            <button className="btn-add" onClick={addLocation}>+ Add New Location</button>
          </div>
          
          <div className="roles-grid">
            {Object.entries(intelData.locationDemands || {}).map(([locationKey, locData], idx) => (
              <div key={idx} className="role-editor-card">
                <div className="card-header">
                  <input 
                    className="role-title-input" 
                    value={locationKey} 
                    onChange={(e) => handleLocationNameChange(locationKey, e.target.value)}
                  />
                  <button className="btn-delete" onClick={() => deleteLocation(locationKey)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                
                <div className="form-group-row">
                   <div className="form-group">
                    <label>Demand Level (e.g. High, Very High)</label>
                    <input 
                        value={locData.demand || ""} 
                        onChange={(e) => handleLocationChange(locationKey, "demand", e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Available Jobs</label>
                    <input 
                        type="number" 
                        value={locData.jobs || 0} 
                        onChange={(e) => handleLocationChange(locationKey, "jobs", Number(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="form-group-row">
                   <div className="form-group">
                    <label>Avg Salary (e.g. 10 - 15 LPA)</label>
                    <input 
                        value={locData.avgSalary || ""} 
                        onChange={(e) => handleLocationChange(locationKey, "avgSalary", e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Growth Rate (e.g. +20%)</label>
                    <input 
                        value={locData.growth || ""} 
                        onChange={(e) => handleLocationChange(locationKey, "growth", e.target.value)} 
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
