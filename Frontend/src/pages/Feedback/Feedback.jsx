import { useState, useEffect } from "react";
import axios from "axios";
import "./Feedback.css";

export default function Feedback() {
  // Simple states
  const [rating, setRating] = useState(0);
  const [feedbackMode, setFeedbackMode] = useState("general");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [priority, setPriority] = useState("normal");
  
  // User info states for non-logged in users
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  
  // Bug report specific states
  const [pageName, setPageName] = useState("");
  const [errorType, setErrorType] = useState("UI Issue");
  const [browserInfo, setBrowserInfo] = useState("");
  const [steps, setSteps] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorHeader, setErrorHeader] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Attempt to load user data from sessionStorage (consistent with Login.jsx)
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from sessionStorage:", e);
      }
    }
  }, []);

  const handleSubmit = async () => {
    setErrorHeader("");
    
    // Validation
    if (!currentUser && (!guestName || !guestEmail)) {
      setErrorHeader("Please provide your name and email or sign in");
      return;
    }

    if (rating === 0) {
      setErrorHeader("Please provide a rating");
      return;
    }

    if (message.length < 10) {
      setErrorHeader("Please write at least 10 characters");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userId: currentUser ? currentUser.id || currentUser._id : null,
        userName: currentUser ? currentUser.name : guestName,
        userEmail: currentUser ? currentUser.email : guestEmail,
        rating,
        message,
        category: feedbackMode,
        priority,
        anonymous,
        bugDetails: feedbackMode === "bug" ? {
          pageName,
          errorType,
          browserInfo,
          steps
        } : undefined
      };

      const response = await axios.post("http://localhost:5000/api/feedback", payload);
      
      if (response.data.success) {
        setSubmitted(true);
      } else {
        setErrorHeader(response.data.message || "Something went wrong.");
      }
    } catch (error) {
       console.error("Error submitting feedback:", error);
       setErrorHeader(error.response?.data?.message || "Failed to submit feedback. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setRating(0);
    setMessage("");
    setAnonymous(false);
    setFeedbackMode("general");
    setPriority("normal");
    setPageName("");
    setErrorType("UI Issue");
    setBrowserInfo("");
    setSteps("");
    setGuestName("");
    setGuestEmail("");
  };

  // Emoji mapping
  const getEmoji = (rating) => {
    if (rating === 1) return "😡";
    if (rating === 2) return "😐";
    if (rating === 3) return "😊";
    if (rating === 4) return "😍";
    if (rating === 5) return "🤩";
    return "⭐";
  };

  if (submitted) {
    return (
      <div className="success-overlay">
        <div className="success-modal">
          <div className="success-icon">
            <i className="fas fa-check"></i>
          </div>
          <h2 className="success-title">Thank You!</h2>
          <p className="success-message">
            Your feedback helps us improve the experience
          </p>
          <button onClick={resetForm} className="success-close">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        {/* HEADER */}
        <div className="feedback-header">
          <h1>Feedback</h1>
          <p>Help us improve your experience</p>
          {errorHeader && <p className="error-message" style={{ color: '#ef4444', marginTop: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>{errorHeader}</p>}
        </div>

        {/* MODE TOGGLE */}
        <div className="mode-toggle">
          <button
            className={feedbackMode === "general" ? "active" : ""}
            onClick={() => setFeedbackMode("general")}
          >
            General
          </button>
          <button
            className={feedbackMode === "bug" ? "active" : ""}
            onClick={() => setFeedbackMode("bug")}
          >
            Bug Report
          </button>
        </div>

        {/* USER INFO (Only show if not logged in) */}
        {!currentUser && (
          <div className="user-info-fields">
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Full Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                className="form-input"
                placeholder="Email Address"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* RATING */}
        <div className="rating-section">
          <label className="rating-label">How would you rate your experience?</label>
          <div className="emoji-rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <span
                key={value}
                className={rating >= value ? "active" : ""}
                onClick={() => setRating(value)}
              >
                {getEmoji(value)}
              </span>
            ))}
          </div>
        </div>

        {/* MESSAGE */}
        <div className="form-group">
          <textarea
            className="form-input"
            placeholder={feedbackMode === "bug" ? "Describe the bug you encountered..." : "Share your feedback with us..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={4}
          />
        </div>

        {/* BUG REPORT SPECIFIC FIELDS */}
        {feedbackMode === "bug" && (
          <div className="bug-fields">
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Page or section where the bug occurred"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <select
                className="form-input"
                value={errorType}
                onChange={(e) => setErrorType(e.target.value)}
              >
                <option value="UI Issue">UI Issue</option>
                <option value="Functionality Problem">Functionality Problem</option>
                <option value="Performance Issue">Performance Issue</option>
                <option value="Error Message">Error Message</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Browser and version (e.g., Chrome 120)"
                value={browserInfo}
                onChange={(e) => setBrowserInfo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <textarea
                className="form-input"
                placeholder="Steps to reproduce (1. Go to... 2. Click...)"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        )}

        {/* PRIORITY */}
        <div className="priority-section">
          <label className="section-label">Priority</label>
          <div className="priority-buttons">
            <button
              className={`priority-btn low ${priority === "low" ? "active" : ""}`}
              onClick={() => setPriority("low")}
            >
              Low
            </button>
            <button
              className={`priority-btn medium ${priority === "medium" ? "active" : ""}`}
              onClick={() => setPriority("medium")}
            >
              Medium
            </button>
            <button
              className={`priority-btn high ${priority === "high" ? "active" : ""}`}
              onClick={() => setPriority("high")}
            >
              High
            </button>
          </div>
        </div>

        {/* ANONYMOUS CHECKBOX */}
        <div className="checkbox-group">
          <input
            id="anon-check"
            type="checkbox"
            checked={anonymous}
            onChange={() => setAnonymous(!anonymous)}
          />
          <label htmlFor="anon-check">Submit anonymously</label>
        </div>

        {/* SUBMIT BUTTON */}
        <button onClick={handleSubmit} className="submit-btn" disabled={loading}>
          {loading ? (<span><i className="fas fa-spinner fa-spin"></i> Submitting...</span>) : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}
