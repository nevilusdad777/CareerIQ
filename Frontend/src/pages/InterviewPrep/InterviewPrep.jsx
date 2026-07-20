import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MockInterview from './MockInterview';
import './InterviewPrep.css';

const InterviewPrep = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/interview");
      if (res.data.success) {
        setQuestions(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const interviewTips = [
    {
      title: "Research the Company",
      description: "Understand their products, culture, and recent news.",
      icon: "fa-building"
    },
    {
      title: "Practice STAR Method",
      description: "Situation, Task, Action, Result for behavioral questions.",
      icon: "fa-star"
    },
    {
      title: "Check Your Tech",
      description: "Ensure your camera, mic, and internet are stable for remote interviews.",
      icon: "fa-laptop"
    }
  ];

  return (
    <div className="interview-prep-container">
      <header className="prep-header">
        <div className="header-content">
          <h1 style={{ color: '#000000' }}><i className="fas fa-comments"></i> Interview Preparation</h1>
          <p style={{ color: '#000000' }}>Master your next interview with curated questions and expert tips.</p>
        </div>
      </header>

      <div className="prep-tabs">
        <button 
          className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          <i className="fas fa-question-circle"></i> Common Questions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`}
          onClick={() => setActiveTab('tips')}
        >
          <i className="fas fa-lightbulb"></i> Interview Tips
        </button>
        <button 
          className={`tab-btn ${activeTab === 'mock' ? 'active' : ''}`}
          onClick={() => setActiveTab('mock')}
        >
          <i className="fas fa-video"></i> Mock Interviews
        </button>
      </div>

      <main className="prep-main">
        {activeTab === 'questions' && (
          <section className="questions-section">
            <div className="section-header">
              <h2>Top Interview Questions</h2>
              <div className="filter-tags">
                {['All', 'Behavioral', 'Technical', 'HR'].map(tag => (
                  <span 
                    key={tag}
                    className={`tag ${filter === tag ? 'active' : ''}`}
                    onClick={() => setFilter(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="questions-grid">
              {loading ? (
                <div className="loading-spinner">Loading questions...</div>
              ) : questions.length > 0 ? (
                questions.filter(q => filter === 'All' || q.category === filter).map(q => (
                  <div key={q._id} className="question-card">
                    <div className="card-top">
                      <span className={`category-badge ${q.category.toLowerCase()}`}>{q.category}</span>
                      <button className="save-btn"><i className="far fa-bookmark"></i></button>
                    </div>
                    <h3>{q.question}</h3>
                    <div className="tips-box">
                      <strong>Expert Tip:</strong>
                      <p>{q.tips || "No specific tips yet. Focus on being concise!"}</p>
                    </div>
                    <button className="view-answer-btn">View Best Answer</button>
                  </div>
                ))
              ) : (
                <div className="no-data">No interview questions added by admin yet.</div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'tips' && (
          <section className="tips-section">
            <h2>Expert Interview Strategies</h2>
            <div className="tips-grid">
              {interviewTips.map((tip, index) => (
                <div key={index} className="tip-card">
                  <div className="tip-icon-box">
                    <i className={`fas ${tip.icon}`}></i>
                  </div>
                  <div className="tip-content">
                    <h3>{tip.title}</h3>
                    <p>{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pro-tip-banner">
              <i className="fas fa-lightbulb"></i>
              <div className="banner-text">
                <h3>Pro Tip: The First 5 Minutes Matter</h3>
                <p>Start with a confident handshake (or greeting) and a clear, concise "Tell me about yourself" pitch.</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'mock' && (
          <section className="mock-section">
            <div className="mock-intro">
              <h2>AI-Powered Mock Interviews</h2>
              <p>Practice in a real-time environment and get instant feedback on your performance.</p>
              <div className="mock-features">
                <div className="feature">
                  <i className="fas fa-video"></i>
                  <span>Video Simulation</span>
                </div>
                <div className="feature">
                  <i className="fas fa-microphone"></i>
                  <span>Voice Recognition</span>
                </div>
                <div className="feature">
                  <i className="fas fa-robot"></i>
                  <span>AI Feedback</span>
                </div>
              </div>
              <div className="mock-actions">
                <button 
                  className="start-mock-btn"
                  onClick={() => setShowMockInterview(true)}
                >
                  <i className="fas fa-robot"></i> Start AI Mock Interview
                </button>
                <a 
                  href="https://meet.google.com/new" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="meet-btn"
                >
                  <i className="fab fa-google"></i> Launch Google Meet
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      {showMockInterview && (
        <MockInterview onExit={() => setShowMockInterview(false)} />
      )}
    </div>
  );
};

export default InterviewPrep;
