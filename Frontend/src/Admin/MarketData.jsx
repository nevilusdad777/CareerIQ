import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css";

export default function MarketData() {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [sortBy, setSortBy] = useState("skillName");

  const [formData, setFormData] = useState({
    skillName: "",
    industry: "Technology",
    demand: "High",
    avgSalary: "",
    jobOpenings: "",
    growthRate: "",
    description: "",
    topCompanies: ""
  });

  const [stats, setStats] = useState({
    total: 0,
    highDemand: 0,
    avgSalary: 0,
    totalJobs: 0
  });

  useEffect(() => {
    loadMarketData();
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [searchTerm, filterIndustry, marketData, sortBy]);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const storedData = JSON.parse(sessionStorage.getItem("marketData") || "[]");
      
      if (storedData.length === 0) {
        const sampleData = [
          {
            id: "1",
            skillName: "React Developer",
            industry: "Technology",
            demand: "High",
            avgSalary: "$95,000",
            jobOpenings: "12,450",
            growthRate: "+25%",
            description: "Building modern web applications with React framework",
            topCompanies: "Meta, Google, Amazon",
            createdAt: new Date().toISOString()
          },
          {
            id: "2",
            skillName: "Data Scientist",
            industry: "Technology",
            demand: "High",
            avgSalary: "$115,000",
            jobOpenings: "8,920",
            growthRate: "+32%",
            description: "Analyzing complex data and building ML models",
            topCompanies: "Microsoft, IBM, Netflix",
            createdAt: new Date().toISOString()
          },
          {
            id: "3",
            skillName: "Digital Marketing Specialist",
            industry: "Marketing",
            demand: "Medium",
            avgSalary: "$65,000",
            jobOpenings: "15,300",
            growthRate: "+18%",
            description: "Managing online marketing campaigns and SEO",
            topCompanies: "HubSpot, Salesforce, Adobe",
            createdAt: new Date().toISOString()
          },
          {
            id: "4",
            skillName: "UX/UI Designer",
            industry: "Design",
            demand: "High",
            avgSalary: "$85,000",
            jobOpenings: "9,800",
            growthRate: "+22%",
            description: "Creating user-friendly interfaces and experiences",
            topCompanies: "Apple, Airbnb, Figma",
            createdAt: new Date().toISOString()
          },
          {
            id: "5",
            skillName: "Cloud Architect",
            industry: "Technology",
            demand: "High",
            avgSalary: "$135,000",
            jobOpenings: "6,500",
            growthRate: "+28%",
            description: "Designing and implementing cloud infrastructure",
            topCompanies: "AWS, Azure, Google Cloud",
            createdAt: new Date().toISOString()
          }
        ];
        sessionStorage.setItem("marketData", JSON.stringify(sampleData));
        setMarketData(sampleData);
        calculateStats(sampleData);
      } else {
        setMarketData(storedData);
        calculateStats(storedData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading market data:", error);
      setLoading(false);
    }
  };

  const calculateStats = (dataList) => {
    const totalJobs = dataList.reduce((sum, item) => {
      const jobs = parseInt(item.jobOpenings.replace(/,/g, '')) || 0;
      return sum + jobs;
    }, 0);

    const avgSalary = dataList.reduce((sum, item) => {
      const salary = parseInt(item.avgSalary.replace(/[$,]/g, '')) || 0;
      return sum + salary;
    }, 0) / (dataList.length || 1);

    setStats({
      total: dataList.length,
      highDemand: dataList.filter(d => d.demand === "High").length,
      avgSalary: Math.round(avgSalary),
      totalJobs: totalJobs
    });
  };

  const filterAndSortData = () => {
    let filtered = [...marketData];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.skillName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.topCompanies?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterIndustry !== "all") {
      filtered = filtered.filter(item => item.industry === filterIndustry);
    }

    filtered.sort((a, b) => {
      const aVal = a[sortBy] || "";
      const bVal = b[sortBy] || "";
      return aVal > bVal ? 1 : -1;
    });

    setFilteredData(filtered);
  };

  const handleAddData = (e) => {
    e.preventDefault();
    
    const newData = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    const updatedData = [...marketData, newData];
    localStorage.setItem("marketData", JSON.stringify(updatedData));
    setMarketData(updatedData);
    calculateStats(updatedData);

    resetForm();
    setShowAddModal(false);
    alert("Market data added successfully!");
  };

  const handleEditData = (e) => {
    e.preventDefault();
    
    const updatedItem = {
      ...selectedData,
      ...formData,
      updatedAt: new Date().toISOString()
    };

    const updatedData = marketData.map(item =>
      item.id === selectedData.id ? updatedItem : item
    );
    localStorage.setItem("marketData", JSON.stringify(updatedData));
    setMarketData(updatedData);
    calculateStats(updatedData);

    resetForm();
    setSelectedData(null);
    setShowEditModal(false);
    alert("Market data updated successfully!");
  };

  const handleDeleteData = (dataId) => {
    if (!window.confirm("Are you sure you want to delete this market data?")) {
      return;
    }

    const updatedData = marketData.filter(item => item.id !== dataId);
    localStorage.setItem("marketData", JSON.stringify(updatedData));
    setMarketData(updatedData);
    calculateStats(updatedData);
    alert("Market data deleted successfully!");
  };

  const resetForm = () => {
    setFormData({
      skillName: "",
      industry: "Technology",
      demand: "High",
      avgSalary: "",
      jobOpenings: "",
      growthRate: "",
      description: "",
      topCompanies: ""
    });
  };

  const openEditModal = (data) => {
    setSelectedData(data);
    setFormData({
      skillName: data.skillName,
      industry: data.industry,
      demand: data.demand,
      avgSalary: data.avgSalary,
      jobOpenings: data.jobOpenings,
      growthRate: data.growthRate,
      description: data.description || "",
      topCompanies: data.topCompanies || ""
    });
    setShowEditModal(true);
  };

  const openViewModal = (data) => {
    setSelectedData(data);
    setShowViewModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Market Data...</p>
      </div>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="dashboard-layout">
        <div className={`overlay ${sidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>

        <div className={`sidebar-wrapper ${sidebarOpen ? 'mobile-open' : ''}`}>
          <AdminSidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onLogout={handleLogout}
            currentPage="market"
            setCurrentPage={(page) => {
              const routes = {
                'dashboard': '/admindashboard',
                'users': '/adminusers',
                'feedback': '/managefeedback',
                'skills': '/skillmanager',
                'market': '/marketdata'
              };
              if (routes[page]) navigate(routes[page]);
            }}
          />
        </div>

        <div className={`main-content ${collapsed ? 'expanded' : ''}`}>
          <div className="mobile-header">
            <button className="menu-btn" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1>Market Data</h1>
          </div>

          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>Job Market Intelligence</h1>
                <p>Track skill demand and salary trends</p>
              </div>
              <button className="btn-primary" onClick={openAddModal}>
                <i className="fas fa-plus"></i>
                <span>Add Market Data</span>
              </button>
            </div>

            <div className="market-stats-grid">
              <div className="market-stat-card stat-skills">
                <div className="stat-icon-market">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Skills</p>
                  <h2 className="stat-value">{stats.total}</h2>
                </div>
              </div>
              <div className="market-stat-card stat-demand">
                <div className="stat-icon-market">
                  <i className="fas fa-fire"></i>
                </div>
                <div className="stat-content">
                  <p className="stat-label">High Demand</p>
                  <h2 className="stat-value">{stats.highDemand}</h2>
                </div>
              </div>
              <div className="market-stat-card stat-salary">
                <div className="stat-icon-market">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Avg Salary</p>
                  <h2 className="stat-value">${stats.avgSalary.toLocaleString()}</h2>
                </div>
              </div>
              <div className="market-stat-card stat-jobs">
                <div className="stat-icon-market">
                  <i className="fas fa-briefcase"></i>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Jobs</p>
                  <h2 className="stat-value">{stats.totalJobs.toLocaleString()}</h2>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="market-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search skills, industries, companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="filter-select" 
                  value={filterIndustry} 
                  onChange={(e) => setFilterIndustry(e.target.value)}
                >
                  <option value="all">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Finance">Finance</option>
                </select>
                <select 
                  className="filter-select" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="skillName">Sort by Skill</option>
                  <option value="industry">Sort by Industry</option>
                  <option value="demand">Sort by Demand</option>
                  <option value="avgSalary">Sort by Salary</option>
                </select>
              </div>

              <div className="market-grid">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <div key={item.id} className="market-card">
                      <div className="market-card-header">
                        <div>
                          <h3 className="market-skill-name">{item.skillName}</h3>
                          <span className={`industry-tag industry-${item.industry.toLowerCase()}`}>
                            {item.industry}
                          </span>
                        </div>
                        <span className={`demand-badge demand-${item.demand.toLowerCase()}`}>
                          <i className="fas fa-chart-line"></i> {item.demand}
                        </span>
                      </div>
                      
                      <div className="market-card-stats">
                        <div className="stat-item">
                          <i className="fas fa-dollar-sign"></i>
                          <div>
                            <span className="stat-label-small">Avg Salary</span>
                            <strong>{item.avgSalary}</strong>
                          </div>
                        </div>
                        <div className="stat-item">
                          <i className="fas fa-briefcase"></i>
                          <div>
                            <span className="stat-label-small">Job Openings</span>
                            <strong>{item.jobOpenings}</strong>
                          </div>
                        </div>
                        <div className="stat-item">
                          <i className="fas fa-arrow-trend-up"></i>
                          <div>
                            <span className="stat-label-small">Growth Rate</span>
                            <strong className="growth-rate">{item.growthRate}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="market-card-companies">
                        <i className="fas fa-building"></i>
                        <span>{item.topCompanies}</span>
                      </div>

                      <div className="market-card-actions">
                        <button className="btn-icon-small btn-view" onClick={() => openViewModal(item)}>
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="btn-icon-small btn-edit" onClick={() => openEditModal(item)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn-icon-small btn-delete-small" onClick={() => handleDeleteData(item.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state-market">
                    <i className="fas fa-chart-bar"></i>
                    <p>No market data found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showViewModal && selectedData && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content modal-view" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-chart-line"></i> Market Data Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="market-details">
              <div className="detail-row">
                <label><i className="fas fa-code"></i> Skill Name</label>
                <p>{selectedData.skillName}</p>
              </div>
              <div className="detail-row">
                <label><i className="fas fa-industry"></i> Industry</label>
                <p>{selectedData.industry}</p>
              </div>
              <div className="detail-row">
                <label><i className="fas fa-fire"></i> Demand Level</label>
                <p><span className={`demand-badge demand-${selectedData.demand.toLowerCase()}`}>{selectedData.demand}</span></p>
              </div>
              <div className="detail-row">
                <label><i className="fas fa-dollar-sign"></i> Average Salary</label>
                <p className="highlight-text">{selectedData.avgSalary}</p>
              </div>
              <div className="detail-row">
                <label><i className="fas fa-briefcase"></i> Job Openings</label>
                <p>{selectedData.jobOpenings}</p>
              </div>
              <div className="detail-row">
                <label><i className="fas fa-arrow-trend-up"></i> Growth Rate</label>
                <p className="growth-rate">{selectedData.growthRate}</p>
              </div>
              <div className="detail-row full-width">
                <label><i className="fas fa-align-left"></i> Description</label>
                <p>{selectedData.description || "No description available"}</p>
              </div>
              <div className="detail-row full-width">
                <label><i className="fas fa-building"></i> Top Hiring Companies</label>
                <p>{selectedData.topCompanies}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-plus-circle"></i> Add Market Data</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddData}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Skill Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.skillName} 
                    onChange={(e) => setFormData({ ...formData, skillName: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Industry *</label>
                  <select 
                    className="form-input" 
                    value={formData.industry} 
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })} 
                    required
                  >
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Demand Level *</label>
                  <select 
                    className="form-input" 
                    value={formData.demand} 
                    onChange={(e) => setFormData({ ...formData, demand: e.target.value })} 
                    required
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Average Salary</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g., $95,000" 
                    value={formData.avgSalary} 
                    onChange={(e) => setFormData({ ...formData, avgSalary: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Job Openings</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g., 12,450" 
                    value={formData.jobOpenings} 
                    onChange={(e) => setFormData({ ...formData, jobOpenings: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Growth Rate</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g., +25%" 
                    value={formData.growthRate} 
                    onChange={(e) => setFormData({ ...formData, growthRate: e.target.value })} 
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Top Companies</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g., Google, Amazon, Meta" 
                    value={formData.topCompanies} 
                    onChange={(e) => setFormData({ ...formData, topCompanies: e.target.value })} 
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Description</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="action-btn cancel" onClick={() => setShowAddModal(false)}>
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button type="submit" className="action-btn primary">
                  <i className="fas fa-plus"></i> Add Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-edit"></i> Edit Market Data</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditData}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Skill Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.skillName} 
                    onChange={(e) => setFormData({ ...formData, skillName: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Industry *</label>
                  <select 
                    className="form-input" 
                    value={formData.industry} 
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })} 
                    required
                  >
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Demand Level *</label>
                  <select 
                    className="form-input" 
                    value={formData.demand} 
                    onChange={(e) => setFormData({ ...formData, demand: e.target.value })} 
                    required
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Average Salary</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g., $95,000" 
                    value={formData.avgSalary} 
                    onChange={(e) => setFormData({ ...formData, avgSalary: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Job Openings</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g., 12,450" 
                    value={formData.jobOpenings} 
                    onChange={(e) => setFormData({ ...formData, jobOpenings: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Growth Rate</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g., +25%" 
                    value={formData.growthRate} 
                    onChange={(e) => setFormData({ ...formData, growthRate: e.target.value })} 
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Top Companies</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g., Google, Amazon, Meta" 
                    value={formData.topCompanies} 
                    onChange={(e) => setFormData({ ...formData, topCompanies: e.target.value })} 
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Description</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="action-btn cancel" onClick={() => setShowEditModal(false)}>
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button type="submit" className="action-btn primary">
                  <i className="fas fa-save"></i> Update Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}