import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar({ onLogout, isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuConfig = {
    overview: [
      { id: 'dashboard', icon: 'fa-layer-group', label: 'Overview', path: '/admindashboard' }
    ],
    operations: [
      { id: 'admin-interview', icon: 'fa-microphone-alt', label: 'Interviews', path: '/manage-interview' },
      { id: 'admin-jobs', icon: 'fa-briefcase', label: 'Jobs', path: '/manage-jobs' },
      { id: 'users', icon: 'fa-user-astronaut', label: 'Candidates', path: '/adminusers' },
      { id: 'user-records', icon: 'fa-database', label: 'User Records', path: '/userrecords' },
      { id: 'feedback', icon: 'fa-comment-alt', label: 'Feedback', path: '/managefeedback' }
    ],
    intelligence: [
      { id: 'market', icon: 'fa-bolt', label: 'Market Intel', path: '/marketdata' },
      { id: 'events', icon: 'fa-calendar-check', label: 'Global Events', path: '/adminevents' },
      { id: 'skills', icon: 'fa-database', label: 'MCQ Bank', path: '/skillmanager' }
    ],
    config: [
      { id: 'settings', icon: 'fa-sliders-h', label: 'System', path: '/settings' }
    ]
  };

  const isPathActive = (path) => location.pathname === path;

  const handleNavClick = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <div className={`proper-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top-branding">
        <div className="elite-logo-wrapper">
          <div className="logo-orb">
            <i className="fas fa-shield-halved"></i>
          </div>
          {!isCollapsed && <span className="logo-text">Career<span>IQ</span></span>}
        </div>
        <button className="collapse-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav-scroll">
        {Object.entries(menuConfig).map(([section, items]) => (
          <div key={section} className="menu-section-elite">
            {!isCollapsed && <div className="section-label-ultra">{section}</div>}
            <ul className="nav-list-proper">
              {items.map(item => (
                <li key={item.id} className="nav-item-proper">
                  <a
                    href="#"
                    className={`nav-link-proper ${isPathActive(item.path) ? 'active' : ''}`}
                    onClick={(e) => handleNavClick(e, item.path)}
                  >
                    <div className="icon-frame">
                      <i className={`fas ${item.icon}`}></i>
                    </div>
                    {!isCollapsed && <span className="link-label">{item.label}</span>}
                    {!isCollapsed && isPathActive(item.path) && <div className="active-glow-dot"></div>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom-proper">
        <button className="logout-action-proper" onClick={() => navigate("/login")}>
          <div className="logout-icon-wrapper">
            <i className="fas fa-power-off"></i>
          </div>
          {!isCollapsed && <span>End Session</span>}
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;