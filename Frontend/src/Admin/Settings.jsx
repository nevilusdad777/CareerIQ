import { useState, useEffect } from "react";
import "./AdminDashboard.css";
import "./Settings.css";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [showSuccess, setShowSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    avatar: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [systemSettings, setSystemSettings] = useState({
    siteName: "Learning Platform",
    siteEmail: "admin@learningplatform.com",
    timezone: "UTC",
    language: "English",
    emailNotifications: true,
    courseApproval: true,
    userRegistration: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
      const savedSettings = JSON.parse(sessionStorage.getItem("systemSettings") || "{}");
      
      setProfileData({
        name: currentUser.name || "Admin User",
        email: currentUser.email || "admin@example.com",
        phone: currentUser.phone || "",
        role: currentUser.role || "admin",
        avatar: currentUser.avatar || ""
      });

      if (Object.keys(savedSettings).length > 0) {
        setSystemSettings(savedSettings);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading settings:", error);
      setLoading(false);
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
      const updatedUser = { ...currentUser, ...profileData };
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
      showSuccessMessage();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    showSuccessMessage();
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleSystemSettingsUpdate = (e) => {
    e.preventDefault();
    try {
      sessionStorage.setItem("systemSettings", JSON.stringify(systemSettings));
      showSuccessMessage();
    } catch (error) {
      console.error("Error updating system settings:", error);
      alert("Failed to update system settings");
    }
  };

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-content-container">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and system preferences</p>
        </div>
      </div>

      {showSuccess && (
        <div className="success-alert">
          <i className="fas fa-check-circle"></i>
          <span>Settings updated successfully!</span>
        </div>
      )}

      <div className="settings-container">
        <div className="settings-tabs">
          <button 
            className={`settings-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </button>
          <button 
            className={`settings-tab ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            <i className="fas fa-lock"></i>
            <span>Password</span>
          </button>
          <button 
            className={`settings-tab ${activeTab === "system" ? "active" : ""}`}
            onClick={() => setActiveTab("system")}
          >
            <i className="fas fa-cog"></i>
            <span>System</span>
          </button>
        </div>

        <div className="settings-content">
          {activeTab === "profile" && (
            <div className="settings-panel">
              <div className="panel-header">
                <h2><i className="fas fa-user-circle"></i> Profile Information</h2>
                <p>Update your personal information and profile details</p>
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div className="settings-form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+1 234 567 8900"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.role}
                      disabled
                      style={{ background: "#f8fafc", cursor: "not-allowed" }}
                    />
                  </div>
                </div>

                <div className="form-actions-settings">
                  <button type="submit" className="btn-save">
                    <i className="fas fa-save"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div className="settings-panel">
              <div className="panel-header">
                <h2><i className="fas fa-shield-alt"></i> Change Password</h2>
                <p>Update your password to keep your account secure</p>
              </div>

              <form onSubmit={handlePasswordUpdate}>
                <div className="settings-form-grid">
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Current Password *</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password *</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="At least 6 characters"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password *</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Re-enter new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="password-requirements">
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li><i className="fas fa-check"></i> At least 6 characters long</li>
                    <li><i className="fas fa-check"></i> Contains uppercase and lowercase letters</li>
                    <li><i className="fas fa-check"></i> Contains numbers</li>
                  </ul>
                </div>

                <div className="form-actions-settings">
                  <button type="submit" className="btn-save">
                    <i className="fas fa-key"></i>
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "system" && (
            <div className="settings-panel">
              <div className="panel-header">
                <h2><i className="fas fa-sliders-h"></i> System Settings</h2>
                <p>Configure system-wide preferences and features</p>
              </div>

              <form onSubmit={handleSystemSettingsUpdate}>
                <div className="settings-form-grid">
                  <div className="form-group">
                    <label>Site Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Site Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={systemSettings.siteEmail}
                      onChange={(e) => setSystemSettings({ ...systemSettings, siteEmail: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Timezone</label>
                    <select
                      className="form-input"
                      value={systemSettings.timezone}
                      onChange={(e) => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Asia/Dubai">Dubai (GST)</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Language</label>
                    <select
                      className="form-input"
                      value={systemSettings.language}
                      onChange={(e) => setSystemSettings({ ...systemSettings, language: e.target.value })}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Chinese">Chinese</option>
                    </select>
                  </div>
                </div>

                <div className="settings-toggles">
                  <h3>Feature Toggles</h3>
                  
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>Email Notifications</h4>
                      <p>Send email notifications to users</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={systemSettings.emailNotifications}
                        onChange={(e) => setSystemSettings({ ...systemSettings, emailNotifications: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>Course Approval</h4>
                      <p>Require admin approval for new courses</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={systemSettings.courseApproval}
                        onChange={(e) => setSystemSettings({ ...systemSettings, courseApproval: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>User Registration</h4>
                      <p>Allow new users to register</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={systemSettings.userRegistration}
                        onChange={(e) => setSystemSettings({ ...systemSettings, userRegistration: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="form-actions-settings">
                  <button type="submit" className="btn-save">
                    <i className="fas fa-save"></i>
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}