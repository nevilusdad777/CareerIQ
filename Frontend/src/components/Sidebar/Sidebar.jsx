import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Check sessionStorage for authentication (matches Login.jsx)
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    
    setIsLoggedIn(!!token);
    setUserName(currentUser.name || "User");
  }, []);

  // Logout Handler - Enhanced with better UX
  const handleLogout = () => {
    // Create custom confirmation dialog
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    
    if (confirmLogout) {
      try {
        // Clear all authentication data
        const storageKeys = ['token', 'role', 'currentUser', 'userEmail', 'userId'];
        
        // Clear sessionStorage
        storageKeys.forEach(key => {
          sessionStorage.removeItem(key);
        });
        
        // Clear localStorage (backup)
        storageKeys.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Update state immediately
        setIsLoggedIn(false);
        setUserName("");
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.textContent = 'Logged out successfully!';
        successMessage.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 500;
          z-index: 9999;
          animation: slideIn 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(successMessage);
        
        // Remove success message after 2 seconds
        setTimeout(() => {
          successMessage.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => {
            document.body.removeChild(successMessage);
            document.head.removeChild(style);
          }, 300);
        }, 2000);
        
        // Navigate to login after a short delay
        setTimeout(() => {
          // Use React Router navigate instead of window.location
          navigate('/login', { replace: true });
        }, 500);
        
      } catch (error) {
        console.error('Logout error:', error);
        // Fallback to original method if something goes wrong
        alert('Logged out successfully!');
        window.location.href = '/login';
      }
    }
  };

  return (
    <aside className="sidebar">
      <h1 className="logo">
        <span className="career">Career</span>
        <span className="iq">IQ</span>
      </h1>

      <ul className="menu">
        <li>
          <NavLink to="/home" end>
            <i className="fas fa-house"></i> Home
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard">
            <i className="fas fa-chart-line"></i> Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink to="/profile">
            <i className="fas fa-user-graduate"></i> Profile
          </NavLink>
        </li>

        <li>
          <NavLink to="/skillgap">
            <i className="fas fa-brain"></i> Skill Gap
          </NavLink>
        </li>

        <li>
          <NavLink to="/predictor">
            <i className="fas fa-robot"></i> Predictor
          </NavLink>
        </li>

        <li>
          <NavLink to="/roadmap">
            <i className="fas fa-road"></i> Roadmap
          </NavLink>
        </li>

        <li>
          <NavLink to="/market">
            <i className="fas fa-globe"></i> Market Intel
          </NavLink>
        </li>

        <li>
          <NavLink to="/interview-prep">
            <i className="fas fa-comments"></i> Interview Prep
          </NavLink>
        </li>

        <li>
          <NavLink to="/job-board">
            <i className="fas fa-briefcase"></i> Job Board
          </NavLink>
        </li>


        <li>
          <NavLink to="/feedback" className="nav-item">
            <i className="fa-regular fa-comment-dots"></i>
            Feedback
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-bottom">
        {isLoggedIn ? (
          <>
            <div className="user-info">
              <i className="fas fa-user-circle"></i>
              <span className="user-name">{userName}</span>
            </div>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                <i className="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login">
                <i className="fa-solid fa-right-to-bracket"></i> Login
              </NavLink>
            </li>

            <li>
              <NavLink to="/signup">
                <i className="fa-solid fa-user-plus"></i> Sign Up
              </NavLink>
            </li>
          </>
        )}
      </div>
    </aside>
  );
}