import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";

import heroImg from "../../assets/images/hero.png";
import skillsImg from "../../assets/images/skills.png";
import growthImg from "../../assets/images/growth.png";
import marketImg from "../../assets/images/market.png";
import roadmapImg from "../../assets/images/roadmap.png";
import react from "../../assets/images/react.jpeg";
import python from "../../assets/images/python.png";
import da from "../../assets/images/da.jpg";

export default function Home() {
  const navigate = useNavigate();
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Newsletter
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Live stats with animation
  const [animatedStats, setAnimatedStats] = useState({
    courses: 0,
    students: 0,
    completion: 0,
    projects: 0
  });

  // FAQ toggle
  const [openFaq, setOpenFaq] = useState(null);

  // Course filter
  const [courseFilter, setCourseFilter] = useState("all");

  // Global events state
  const [globalEvents, setGlobalEvents] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);

  // Testimonials state
  const [testimonials, setTestimonials] = useState([]);

  // Countdown timer for next event
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // All courses data
  const allCourses = [
    { id: 1, title: "React for Beginners", category: "frontend", level: "Beginner", duration: "6 weeks", price: "Free", rating: 4.8, students: 1250, image: react, description: "Learn React fundamentals and build real projects." },
    { id: 2, title: "Python Programming", category: "programming", level: "Beginner", duration: "8 weeks", price: "Free", rating: 4.9, students: 2100, image: python, description: "Master Python from basics to advanced applications." },
    { id: 3, title: "Data Analytics", category: "data", level: "Intermediate", duration: "10 weeks", price: "$49", rating: 4.7, students: 890, image: da, description: "Analyze data and gain insights for real-world decisions." },
    { id: 4, title: "JavaScript Advanced", category: "frontend", level: "Advanced", duration: "5 weeks", price: "Free", rating: 4.6, students: 750, image: react, description: "Deep dive into advanced JavaScript concepts." },
    { id: 5, title: "Machine Learning Basics", category: "data", level: "Intermediate", duration: "12 weeks", price: "$99", rating: 4.8, students: 650, image: python, description: "Introduction to ML algorithms and applications." },
    { id: 6, title: "Full Stack Development", category: "fullstack", level: "Advanced", duration: "16 weeks", price: "$149", rating: 4.9, students: 980, image: react, description: "Complete full stack web development bootcamp." }
  ];

  const faqs = [
    { question: "How does the skill analysis work?", answer: "Our AI-powered system analyzes your skillset, compares it with industry standards, and provides detailed feedback on areas of improvement." },
    { question: "Is the placement prediction accurate?", answer: "Our prediction model is trained on thousands of placement records and has an accuracy rate of 85%. However, it should be used as a guide, not a guarantee." },
    { question: "Are the courses really free?", answer: "Yes! Most of our foundational courses are completely free. Premium courses with certifications are available at affordable prices." },
    { question: "How long does it take to complete a roadmap?", answer: "Depending on your current skill level and dedication, roadmaps typically take 3-6 months to complete. You can learn at your own pace." },
    { question: "Can I get a certificate?", answer: "Yes! Upon completing any course with a score of 80% or higher, you'll receive a verified certificate that you can share on LinkedIn." }
  ];

  const searchableContent = [
    { title: "Skill Gap Analysis", path: "/skillgap", keywords: "skill test assessment gap analysis" },
    { title: "Career Roadmap", path: "/roadmap", keywords: "roadmap path learning journey" },
    { title: "Placement Predictor", path: "/predictor", keywords: "placement prediction job career" },
    { title: "Market Intelligence", path: "/market-intel", keywords: "market trends industry demand" },
    { title: "Student Profile", path: "/profile", keywords: "profile settings account user" },
    { title: "Dashboard", path: "/dashboard", keywords: "dashboard analytics stats overview" }
  ];

  // Animate stats on load
  useEffect(() => {
    const targets = { courses: 20, students: 500, completion: 85, projects: 50 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        courses: Math.floor(targets.courses * progress),
        students: Math.floor(targets.students * progress),
        completion: Math.floor(targets.completion * progress),
        projects: Math.floor(targets.projects * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(targets);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  // Fetch global events & positive feedback
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/events/admin/global");
        if (response.data.success) {
          const fetchedEvents = response.data.data;
          setGlobalEvents(fetchedEvents);

          // Find the next upcoming event
          const now = new Date().getTime();
          const futureEvents = fetchedEvents.filter(event => new Date(event.date).getTime() > now);
          
          if (futureEvents.length > 0) {
            futureEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setNextEvent(futureEvents[0]);
          } else {
            setNextEvent(null);
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/feedback/positive");
        if (response.data.success) {
          setTestimonials(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };

    fetchEvents();
    fetchTestimonials();
  }, []);

  // Countdown timer for next event
  useEffect(() => {
    if (!nextEvent) return;

    const eventDate = new Date(nextEvent.date).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextEvent]);

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const results = searchableContent.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  // Newsletter subscription
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.includes("@")) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setSubscribed(false);
      }, 3000);
    } else {
      alert("Please enter a valid email address");
    }
  };

  // Filter courses
  const filteredCourses = courseFilter === "all" 
    ? allCourses 
    : allCourses.filter(course => course.category === courseFilter);

  return (
    <main className="home">

      {/* ===== SEARCH BAR ===== */}
      <section className="home-search">
        <div className="search-container">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search for courses, skills, roadmaps..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery && setShowSearchResults(true)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => { setSearchQuery(""); setShowSearchResults(false); }}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {showSearchResults && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result, index) => (
              <div 
                key={index} 
                className="search-result-item"
                onClick={() => {
                  navigate(result.path);
                  setShowSearchResults(false);
                  setSearchQuery("");
                }}
              >
                <i className="fas fa-arrow-right"></i>
                <span>{result.title}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== HERO SECTION ===== */}
      <section className="home-hero">
        <div className="hero-left">
          <h2>CareerIQ</h2>
          <p className="hero-subtitle">
            Real insights to help you grow your skills and career.
          </p>

          <div className="hero-cta">
            <button className="cta-primary" onClick={() => navigate("/skillgap")}>
              <i className="fas fa-rocket"></i> Start Your Journey
            </button>
            <button className="cta-secondary" onClick={() => navigate("/roadmap")}>
              <i className="fas fa-map"></i> View Roadmaps
            </button>
          </div>

          <div className="hero-tools">
            <div onClick={() => navigate("/skillgap")}>
              <i className="fas fa-brain"></i>
              <span>Skill Analysis</span>
            </div>
            <div onClick={() => navigate("/predictor")}>
              <i className="fas fa-chart-line"></i>
              <span>Placement Prediction</span>
            </div>
            <div onClick={() => navigate("/roadmap")}>
              <i className="fas fa-road"></i>
              <span>Roadmap Builder</span>
            </div>
            <div onClick={() => navigate("/market-intel")}>
              <i className="fas fa-globe"></i>
              <span>Market Insights</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <img src={heroImg} alt="Career illustration" />
        </div>
      </section>

      {/* ===== REAL STATS SECTION (Animated) ===== */}
      <section className="home-stats">
        <div className="stat-box">
          <i className="fas fa-book"></i>
          <h3>{animatedStats.courses}+</h3>
          <p>Courses Available</p>
        </div>

        <div className="stat-box">
          <i className="fas fa-user-graduate"></i>
          <h3>{animatedStats.students}+</h3>
          <p>Students Active</p>
        </div>

        <div className="stat-box">
          <i className="fas fa-check-circle"></i>
          <h3>{animatedStats.completion}%</h3>
          <p>Skills Completed</p>
        </div>

        <div className="stat-box">
          <i className="fas fa-clipboard-list"></i>
          <h3>{animatedStats.projects}+</h3>
          <p>Projects Done</p>
        </div>
      </section>

      {/* ===== REAL FEATURES ===== */}
      <section className="home-features-grid">
        <div className="feature-card" onClick={() => navigate("/skillgap")}>
          <img src={skillsImg} alt="Skill Analysis" />
          <h3>
            <i className="fas fa-lightbulb"></i> Skill Analysis
          </h3>
          <p>
            Understand your strengths and weaknesses, track your progress
            with measurable skill metrics.
          </p>
          <button className="feature-btn">
            Try Now <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        <div className="feature-card" onClick={() => navigate("/predictor")}>
          <img src={growthImg} alt="Placement Prediction" />
          <h3>
            <i className="fas fa-rocket"></i> Placement Prediction
          </h3>
          <p>
            Predict your chances based on your skill set and market trends.
          </p>
          <button className="feature-btn">
            Check Now <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        <div className="feature-card" onClick={() => navigate("/market-intel")}>
          <img src={marketImg} alt="Market Intelligence" />
          <h3>
            <i className="fas fa-globe"></i> Market Intelligence
          </h3>
          <p>
            Learn what skills are in demand in your field and emerging
            career trends.
          </p>
          <button className="feature-btn">
            Explore <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        <div className="feature-card" onClick={() => navigate("/roadmap")}>
          <img src={roadmapImg} alt="Roadmap" />
          <h3>
            <i className="fas fa-road"></i> Career Roadmap
          </h3>
          <p>
            Personalized roadmap showing the skills to learn, projects to
            do, and roles to target.
          </p>
          <button className="feature-btn">
            Get Started <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </section>

      {/* ===== EVENT COUNTDOWN ===== */}
      <section className="home-countdown">
        {nextEvent ? (
          <>
            <h3>Next Event: {nextEvent.title}</h3>
            <div style={{ marginTop: '10px', marginBottom: '15px' }}>Starting In</div>
            <div className="countdown-timer">
              <div className="countdown-item">
                <span className="countdown-number">{timeLeft.days}</span>
                <span className="countdown-label">Days</span>
              </div>
              <div className="countdown-divider">:</div>
              <div className="countdown-item">
                <span className="countdown-number">{timeLeft.hours}</span>
                <span className="countdown-label">Hours</span>
              </div>
              <div className="countdown-divider">:</div>
              <div className="countdown-item">
                <span className="countdown-number">{timeLeft.minutes}</span>
                <span className="countdown-label">Minutes</span>
              </div>
              <div className="countdown-divider">:</div>
              <div className="countdown-item">
                <span className="countdown-number">{timeLeft.seconds}</span>
                <span className="countdown-label">Seconds</span>
              </div>
            </div>
            <button className="register-btn">
              <i className="fas fa-calendar-check"></i> Register Now
            </button>
          </>
        ) : (
          <>
            <h3>No Upcoming Events</h3>
            <p style={{ marginTop: '15px' }}>Stay tuned for future events!</p>
          </>
        )}
      </section>

      {/* ===== TIPS / REAL ADVICE ===== */}
      <section className="home-tips">
        <h3>Pro Tips for Students</h3>
        <ul>
          <li><i className="fas fa-lightbulb"></i> Focus on learning one skill deeply rather than many superficially.</li>
          <li><i className="fas fa-network-wired"></i> Work on small projects to showcase your skills practically.</li>
          <li><i className="fas fa-rocket"></i> Keep an eye on industry trends and adjust your learning path.</li>
          <li><i className="fas fa-users"></i> Network and collaborate with peers on meaningful projects.</li>
        </ul>
      </section>

      {/* ===== COURSES SECTION (With Filter) ===== */}
      <section className="home-courses">
        <div className="courses-header">
          <h3>Recommended Courses</h3>
          <div className="course-filters">
            <button 
              className={courseFilter === "all" ? "active" : ""} 
              onClick={() => setCourseFilter("all")}
            >
              All
            </button>
            <button 
              className={courseFilter === "frontend" ? "active" : ""} 
              onClick={() => setCourseFilter("frontend")}
            >
              Frontend
            </button>
            <button 
              className={courseFilter === "data" ? "active" : ""} 
              onClick={() => setCourseFilter("data")}
            >
              Data Science
            </button>
            <button 
              className={courseFilter === "fullstack" ? "active" : ""} 
              onClick={() => setCourseFilter("fullstack")}
            >
              Full Stack
            </button>
          </div>
        </div>

        <div className="courses-grid">
          {filteredCourses.map(course => (
            <div className="course-card" key={course.id}>
              <div className="course-image">
                <img src={course.image} alt={course.title}/>
                <span className="course-level">{course.level}</span>
              </div>
              <div className="course-content">
                <h4>{course.title}</h4>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span><i className="fas fa-clock"></i> {course.duration}</span>
                  <span><i className="fas fa-user"></i> {course.students}</span>
                </div>
                <div className="course-footer">
                  <div className="course-rating">
                    <i className="fas fa-star"></i>
                    <span>{course.rating}</span>
                  </div>
                  <div className="course-price">{course.price}</div>
                </div>
                <button className="enroll-btn">
                  <i className="fas fa-graduation-cap"></i> Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== EVENTS SECTION ===== */}
      <section className="home-events">
        <h3>Upcoming Events</h3>
        <div className="events-grid">
          {globalEvents.filter(e => new Date(e.date).getTime() > new Date().getTime()).length > 0 ? (
            globalEvents
              .filter(e => new Date(e.date).getTime() > new Date().getTime())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 3)
              .map(event => (
                <div className="event-card" key={event._id}>
                  <div className="event-icon">
                    <i className={`fas ${event.type === 'meeting' || event.isVirtual ? 'fa-video' : event.type === 'workshop' ? 'fa-chalkboard-teacher' : 'fa-calendar-alt'}`}></i>
                  </div>
                  <div className="event-content">
                    <h4>{event.title}</h4>
                    <p className="event-date">
                      <i className="fas fa-calendar"></i> {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="event-desc">{event.description}</p>
                    <button className="event-register">Register</button>
                  </div>
                </div>
              ))
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', margin: '20px 0', width: '100%' }}>No upcoming events scheduled at the moment.</p>
          )}
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section className="home-faq">
        <h3>Frequently Asked Questions</h3>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <h4>{faq.question}</h4>
                <i className={`fas fa-chevron-${openFaq === index ? 'up' : 'down'}`}></i>
              </div>
              {openFaq === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="home-testimonials">
        <h3>What Students Say</h3>
        <div className="testimonials-grid">
          {testimonials.length > 0 ? (
            testimonials.map((testimonial) => (
              <div className="testimonial-card" key={testimonial._id}>
                <div className="testimonial-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={star <= testimonial.rating ? "fas fa-star" : "far fa-star"}
                    ></i>
                  ))}
                </div>
                <p>"{testimonial.message}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.userName ? testimonial.userName.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div>
                    <strong>{testimonial.userName || "Anonymous Student"}</strong>
                    <span>{testimonial.userEmail ? "Verified Student" : "Student"}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Fallback content if no external feedback is present yet
            <>
              <div className="testimonial-card">
                <div className="testimonial-rating">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p>
                  "CareerIQ helped me identify missing skills and get my dream
                  internship!"
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">M</div>
                  <div>
                    <strong>Meet K.</strong>
                    <span>Software Engineer Intern</span>
                  </div>
                </div>
              </div>

              <div className="testimonial-card">
                <div className="testimonial-rating">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p>
                  "The roadmap feature is amazing, it guided me step by step."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">K</div>
                  <div>
                    <strong>Krish V.</strong>
                    <span>Frontend Developer</span>
                  </div>
                </div>
              </div>

              <div className="testimonial-card">
                <div className="testimonial-rating">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p>
                  "I loved the placement prediction tool, it's very accurate!"
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">N</div>
                  <div>
                    <strong>Nevil U.</strong>
                    <span>Data Analyst</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="home-newsletter">
        <div className="newsletter-content">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for weekly career tips and course updates</p>
          {!subscribed ? (
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">
                <i className="fas fa-paper-plane"></i> Subscribe
              </button>
            </form>
          ) : (
            <div className="newsletter-success">
              <i className="fas fa-check-circle"></i>
              <span>Successfully subscribed! Check your inbox.</span>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}