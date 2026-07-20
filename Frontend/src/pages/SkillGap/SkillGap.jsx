import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SkillGap.css";

const API_SKILLS_URL = "http://localhost:5000/api/skills";

export default function SkillGap() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canTakeExam, setCanTakeExam] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [nextAllowedDate, setNextAllowedDate] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('skillTestHistory');
    if (saved) {
      const history = JSON.parse(saved);
      setTestHistory(history);
    }
    checkExamStatus();
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get(API_SKILLS_URL);
      if (response.data.success) {
        setSkills(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  };

  const checkExamStatus = async () => {
    try {
      setCheckingStatus(true);
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        setCanTakeExam(true);
        setCheckingStatus(false);
        fetchQuestions();
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/skillgap/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.canTakeExam) {
        setCanTakeExam(true);
        fetchQuestions();
      } else {
        setCanTakeExam(false);
        setNextAllowedDate(response.data.nextAllowedDate);
      }
    } catch (err) {
      setCanTakeExam(true);
      fetchQuestions();
    } finally {
      setCheckingStatus(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await axios.get('http://localhost:5000/api/skillgap/questions', { headers });
      if (response.data.success) setQuestions(response.data.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateResult = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      if (!token) { setError('Please login to submit'); return; }
      const answersArray = questions.map((q, i) => ({
        questionId: q._id,
        selectedOptionIndex: answers[i] !== undefined ? answers[i] : 0
      }));
      const response = await axios.post('http://localhost:5000/api/skillgap/submit', { answers: answersArray }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setResult(response.data.data);
        setShowResults(true);
        setCanTakeExam(false);
      }
    } catch (err) {
      console.error('❌ Assessment Submission Error:', err);
      setError(err.response?.data?.error || 'Submission failed. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getSkillLevel = (score) => {
    if (score >= 81) return { label: "Strong", icon: "fa-trophy", color: "#000000" };
    if (score >= 61) return { label: "Job Ready", icon: "fa-briefcase", color: "#000000" };
    if (score >= 31) return { label: "Intermediate", icon: "fa-book", color: "#000000" };
    return { label: "Beginner", icon: "fa-seedling", color: "#000000" };
  };

  if (loading || checkingStatus) return <div className="skilltest"><p>Checking assessment status...</p></div>;

  if (!canTakeExam && nextAllowedDate) {
    return (
      <main className="skilltest">
        <div className="cooldown-container" style={{ textAlign: "center", padding: "40px", background: "#1e293b", borderRadius: "15px", border: "1px solid #334155", marginTop: "50px" }}>
          <div className="lock-icon" style={{ fontSize: "50px", color: "#f59e0b", marginBottom: "20px" }}>
            <i className="fas fa-lock"></i>
          </div>
          <h2 style={{ color: "white", marginBottom: "15px" }}>Assessment Locked</h2>
          <p style={{ color: "#94a3b8", marginBottom: "25px", fontSize: "1.1rem" }}>
            To ensure meaningful progress tracking, assessments are limited to once per week.
          </p>
          <div className="next-date" style={{ background: "#0f172a", padding: "15px", borderRadius: "8px", display: "inline-block", border: "1px solid #3b82f6" }}>
            <span style={{ color: "#3b82f6", fontWeight: "700" }}>Next Assessment Available: </span>
            <span style={{ color: "white" }}>{new Date(nextAllowedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div style={{ marginTop: "30px" }}>
            <button className="submit-btn" onClick={() => navigate("/dashboard")} style={{ padding: "12px 30px", width: "auto" }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (showResults && result) {
    return (
      <main className="skilltest">
        <section className="result-header">
          <h2><i className="fas fa-certificate"></i> Assessment Report</h2>
          <p className="subtitle">Detailed breakdown of your technical expertise</p>
        </section>

        <section className="stats-grid">
          <div className="stat-card stat-good">
            <p className="stat-number">{result.overallScore}%</p>
            <h3>Overall Score</h3>
          </div>
          <div className="stat-card stat-warning">
            <p className="stat-number">{result.intelligenceIndex}</p>
            <h3>Intelligence Index</h3>
          </div>
          <div className="stat-card stat-danger">
            <p className="stat-number" style={{fontSize: "1.2rem"}}>{result.predictedRole}</p>
            <h3>Target Role</h3>
          </div>
        </section>

        <section className="result-section analysis-premium">
          <h3><i className="fas fa-layer-group"></i> Skills Analysis</h3>
          <div className="skills-analysis-grid">
            {result.categoryScores && Object.entries(result.categoryScores).map(([cat, score]) => {
              const level = getSkillLevel(score);
              const barClass = score >= 81 ? 'good' : score >= 51 ? 'warning' : 'danger';
              
              return (
                <div key={cat} className="skill-analysis-card">
                  <div className="skill-card-header">
                    <div className="skill-icon-box" style={{ background: `${level.color}15`, color: level.color }}>
                      <i className={`fas ${level.icon}`}></i>
                    </div>
                    <div className="skill-label-group">
                      <span className="skill-name">{cat}</span>
                      <span className="skill-badge" style={{ background: `${level.color}20`, color: level.color }}>{level.label}</span>
                    </div>
                    <div className="skill-percentage">{score}%</div>
                  </div>
                  
                  <div className="skill-bar-container">
                    <div className="result-bar">
                      <div 
                        className={`fill ${barClass}`} 
                        style={{ '--fill-width': `${score}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="skill-card-footer">
                    <span>{score >= 80 ? "Mastery achieved" : score >= 50 ? "Proficient level" : "Focus area"}</span>
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="result-section">
          <h3><i className="fas fa-graduation-cap"></i> Personalized Learning Path</h3>
          <p className="subtitle" style={{marginBottom: "20px"}}>Recommended resources to bridge your identified skill gaps</p>
          <div className="learning-path-grid" style={{ display: "grid", gap: "20px" }}>
            {result.weaknesses?.map(weakness => {
              const searchName = weakness === "NodeJS" ? "Node.js" : weakness;
              const skillData = skills.find(s => s.name === searchName);
              if (!skillData || !skillData.learningPath?.length) return null;
              return (
                <div key={weakness} className="path-category" style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                  <h4 style={{ color: "#3b82f6", display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                    <i className="fas fa-exclamation-circle" style={{ color: "#ef4444" }}></i> Focus: {weakness}
                  </h4>
                  <div className="resource-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px" }}>
                    {skillData.learningPath.map((res, idx) => (
                      <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer" className="resource-card" style={{
                        display: "flex", gap: "15px", padding: "15px", background: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b", textDecoration: "none", transition: "all 0.2s"
                      }}>
                        <div className="res-icon" style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#3b82f615", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
                          <i className={`fas fa-${res.type === 'video' ? 'play' : res.type === 'course' ? 'graduation-cap' : 'file-alt'}`}></i>
                        </div>
                        <div className="res-content">
                          <h5 style={{ margin: "0 0 5px", color: "white" }}>{res.title}</h5>
                          <div style={{ display: "flex", gap: "10px", fontSize: "0.75rem", color: "#94a3b8" }}>
                            <span><i className="fas fa-tag"></i> {res.type}</span>
                            {res.duration && <span><i className="fas fa-clock"></i> {res.duration}</span>}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="result-section">
          <h3><i className="fas fa-history"></i> Detailed Question Review</h3>
          <button className="submit-btn" onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}>
            {showDetailedAnalysis ? "Hide Review" : "View Detailed Explanations"}
          </button>
          
          {showDetailedAnalysis && result.answers?.map((ans, i) => (
            <div key={i} className={`review-card ${ans.isCorrect ? 'correct' : 'incorrect'}`} style={{
              background: "#1e293b", padding: "20px", borderRadius: "10px", marginTop: "15px", borderLeft: `5px solid ${ans.isCorrect ? '#10b981' : '#ef4444'}`
            }}>
              <p style={{ fontWeight: "600", marginBottom: "10px" }}>{i + 1}. {ans.questionText}</p>
              <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                <p>Your Answer: <span style={{ color: ans.isCorrect ? "#10b981" : "#ef4444" }}>{ans.selectedOptionText}</span></p>
                {!ans.isCorrect && <p>Correct Answer: <span style={{ color: "#10b981" }}>{ans.correctOptionText}</span></p>}
                {ans.explanation && (
                  <div style={{ marginTop: "10px", padding: "10px", background: "#3b82f610", borderRadius: "5px", color: "#e2e8f0" }}>
                    <strong>Insight:</strong> {ans.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        <div className="res-actions">
          <button className="submit-btn" onClick={() => navigate("/dashboard")}>
            <i className="fas fa-home"></i> Back to Dashboard
          </button>
          <button className="submit-btn secondary" onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}>
            <i className="fas fa-search"></i> {showDetailedAnalysis ? "Hide Details" : "Detailed Review"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="skilltest">
      <div className="assessment-header">
        <h2><i className="fas fa-brain"></i> Skill Assessment</h2>
        <p className="subtitle">Discover your industry readiness and personalized growth path</p>
      </div>

      {error && (
        <div className="error-banner" style={{background: "#fee2e2", color: "#ef4444", padding: "15px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #fca5a5"}}>
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {questions.map((q, i) => (
        <div key={q._id} className="question-card">
          <h4 style={{ color: "#e2e8f0", marginBottom: "15px" }}>{i + 1}. {q.questionText}</h4>
          <div className="question-meta" style={{ marginBottom: "15px" }}>
            <span className="category-tag">{q.category}</span>
            <span className={`difficulty-tag difficulty-${q.difficulty}`}>{q.difficulty}</span>
          </div>
          {q.options.map((opt, oi) => (
            <label key={oi} className="option">
              <input type="radio" name={`q-${i}`} value={oi} checked={answers[i] === oi} onChange={() => setAnswers({...answers, [i]: oi})} />
              <span style={{ color: "#cbd5e1" }}>{opt.text}</span>
            </label>
          ))}
        </div>
      ))}

      <button 
        className="submit-btn" 
        onClick={calculateResult} 
        disabled={loading || Object.keys(answers).length < questions.length}
      >
        {loading ? (
          <><i className="fas fa-spinner fa-spin"></i> Processing...</>
        ) : (
          "Complete Assessment"
        )}
      </button>
    </main>
  );
}
