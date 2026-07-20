import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './hero.css';

// NOTE: Add this line to your public/index.html <head> for Font Awesome:
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

const staticTestimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer at Google",
    company: "Google",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "CareerIQ completely transformed my career journey. I went from being confused about my path to landing my dream role at Google in just 8 months. The personalized guidance and practical learning approach made all the difference."
  },
  {
    name: "Rahul Verma",
    role: "Data Analyst at Microsoft",
    company: "Microsoft",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "The skill-based courses on CareerIQ are incredibly practical. I learned by doing real projects, and within 6 months I had the portfolio and confidence to ace my Microsoft interviews. Best investment in my career!"
  },
  {
    name: "Ananya Patel",
    role: "Product Manager at Amazon",
    company: "Amazon",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "From engineering to product management — CareerIQ helped me navigate this transition smoothly. The mentorship program connected me with PMs from top companies who guided me every step of the way."
  }
];

const features = [
  {
    title: "Personalized Career Guidance",
    description: "AI-powered assessments analyze your skills, interests, and goals to recommend the perfect career path tailored just for you.",
    highlights: ["AI Career Matching", "Personality Assessment", "1-on-1 Mentorship"],
    icon: "fa-solid fa-brain"
  },
  {
    title: "Skill-Based Learning Paths",
    description: "Master in-demand skills through hands-on projects and industry-recognized courses designed by top professionals.",
    highlights: ["500+ Courses", "Project-Based Learning", "Industry Certifications"],
    icon: "fa-solid fa-laptop-code"
  },
  {
    title: "Job & Internship Preparation",
    description: "Get job-ready with mock interviews, resume optimization, and direct connections to top companies hiring now.",
    highlights: ["Mock Interviews", "Resume Builder", "Job Matching"],
    icon: "fa-solid fa-briefcase"
  },
  {
    title: "Smart Career Roadmaps",
    description: "Follow personalized step-by-step roadmaps that guide you from beginner to expert in your chosen field.",
    highlights: ["Custom Roadmaps", "Progress Tracking", "Milestone Rewards"],
    icon: "fa-solid fa-map-marked-alt"
  }
];

const stats = [
  { number: "100+", label: "Students Guided", icon: "fa-solid fa-user-graduate" },
  { number: "500+",    label: "Expert Courses",   icon: "fa-solid fa-book-open" },
  { number: "200+",    label: "Career Paths",     icon: "fa-solid fa-route" },
  { number: "95%",     label: "Success Rate",     icon: "fa-solid fa-chart-line" }
];

const process = [
  { step: 1, title: "Take Assessment",     description: "Complete our AI-powered career assessment to discover your strengths, interests, and ideal career matches.", icon: "fa-solid fa-clipboard-list" },
  { step: 2, title: "Get Your Roadmap",    description: "Receive a personalized learning roadmap with courses, projects, and milestones tailored to your goals.",      icon: "fa-solid fa-map" },
  { step: 3, title: "Learn & Build",       description: "Master skills through hands-on projects, mentorship sessions, and industry-recognized certifications.",        icon: "fa-solid fa-hammer" },
  { step: 4, title: "Land Your Dream Job", description: "Get matched with opportunities, prepare with mock interviews, and launch your successful career.",             icon: "fa-solid fa-rocket" }
];

const trustAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
];

const CareerIQLanding = () => {
  const [isMenuOpen, setIsMenuOpen]               = useState(false);
  const [scrolled, setScrolled]                   = useState(false);
  const [testimonials, setTestimonials]           = useState(staticTestimonials);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isLoaded, setIsLoaded]                   = useState(false);

  useEffect(() => { 
    setIsLoaded(true);
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/feedback/positive');
      if (response.data.success && response.data.data.length > 0) {
        const dynamicTestimonials = response.data.data.map(fb => ({
          name: fb.userName || 'Student',
          role: fb.category === 'feature' ? 'Elite Student' : 'Verified Learner',
          company: 'CareerIQ User',
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(fb.userName || 'S')}&background=random&color=fff`,
          rating: fb.rating,
          text: fb.message
        }));
        // Use dynamic ones first, fallback to static if few
        if (dynamicTestimonials.length >= 3) {
          setTestimonials(dynamicTestimonials);
        } else {
          setTestimonials([...dynamicTestimonials, ...staticTestimonials.slice(0, 3 - dynamicTestimonials.length)]);
        }
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const id = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const handleNavClick = useCallback((sectionId) => {
    setIsMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleMenuToggle = useCallback(() => setIsMenuOpen(prev => !prev), []);

  return (
    <div className={`landing-page${isLoaded ? ' loaded' : ''}`}>

      {/* ── Animated Background ── */}
      <div className="animated-background">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="grid-overlay" />
      </div>

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-content">

          <a href="#" className="logo">
            <span className="logo-text">
              <span className="career">Career</span>
              <span className="iq">IQ</span>
            </span>
          </a>

          <div className={`nav-links${isMenuOpen ? ' active' : ''}`}>
            <a onClick={() => handleNavClick('features')}>
              <i className="fa-solid fa-star" /> Features
            </a>
            <a onClick={() => handleNavClick('process')}>
              <i className="fa-solid fa-list-check" /> How It Works
            </a>
            <a onClick={() => handleNavClick('testimonials')}>
              <i className="fa-solid fa-comments" /> Testimonials
            </a>
            <a onClick={() => handleNavClick('footer')}>
              <i className="fa-solid fa-envelope" /> Contact
            </a>
          </div>

          <div className="nav-actions">
            <button className="btn-link" onClick={() => window.location.href = '/login'}>
              <i className="fa-solid fa-right-to-bracket" style={{ marginRight: 6 }} />
              Login
            </button>
            <button className="btn-primary-small" onClick={() => window.location.href = '/signup'}>
              Get Started &nbsp;<i className="fa-solid fa-arrow-right" />
            </button>
          </div>

          <button className="menu-toggle" onClick={handleMenuToggle} aria-label="Toggle menu">
            <span style={{ transform: isMenuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
            <span style={{ opacity: isMenuOpen ? 0 : 1 }} />
            <span style={{ transform: isMenuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="hero" id="home">
        <div className="hero-content">

          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-pulse-dot" />
              <i className="fa-solid fa-microchip" style={{ marginRight: 6 }} />
              AI-Powered Career Intelligence
            </div>

            <h1 className="hero-title">
              Unlock Your<br />
              <span className="gradient-text">Career Potential</span><br />
              with CareerIQ
            </h1>

            <p className="hero-subtitle">
              Smart career guidance, skill-based learning, and job-ready preparation — all in one platform.
              Join 10,000+ students who transformed their careers.
            </p>

            <div className="hero-features">
              {[
                { text: "Personalized Career Guidance", icon: "fa-solid fa-bullseye" },
                { text: "Industry-Ready Skills",         icon: "fa-solid fa-graduation-cap" },
                { text: "Job & Internship Preparation",  icon: "fa-solid fa-briefcase" }
              ].map((f, i) => (
                <div className="hero-feature" key={i}>
                  <span className="check-icon">
                    <i className="fa-solid fa-check" />
                  </span>
                  <i className={f.icon} style={{ marginRight: 8, color: '#1E88E5' }} />
                  {f.text}
                </div>
              ))}
            </div>

            <div className="hero-cta">
              <button className="btn-primary" onClick={() => window.location.href = '/signup'}>
                Start Your Journey &nbsp;<i className="fa-solid fa-arrow-right arrow" />
              </button>
              <button className="btn-secondary" onClick={() => window.location.href = '/login'}>
                <i className="fa-solid fa-right-to-bracket" style={{ marginRight: 8 }} />
                Login
              </button>
            </div>

            <div className="hero-trust">
              <div className="trust-avatars">
                {trustAvatars.map((src, i) => (
                  <img key={i} src={src} alt={`Student ${i + 1}`} />
                ))}
              </div>
              <div className="trust-text">
                <div className="trust-rating">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fa-solid fa-star" style={{ color: '#f59e0b', fontSize: 14 }} />
                  ))}
                  <span className="rating-number">4.9/5</span>
                </div>
                <p>Trusted by 10,000+ students worldwide</p>
              </div>
            </div>
          </div>

          {/* Hero Right */}
          <div className="hero-right">
            <div className="hero-image-container">
              <img
                className="hero-image"
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=650&fit=crop"
                alt="Students learning"
              />

              <div className="floating-stat stat-1">
                <span className="stat-icon"><i className="fa-solid fa-arrow-trend-up" style={{ color: '#1E88E5' }} /></span>
                <div className="stat-content">
                  <span className="stat-value">+127%</span>
                  <span className="stat-label">Career Growth</span>
                </div>
              </div>

              <div className="floating-stat stat-2">
                <span className="stat-icon"><i className="fa-solid fa-clock" style={{ color: '#1E88E5' }} /></span>
                <div className="stat-content">
                  <span className="stat-value">3.2 mo</span>
                  <span className="stat-label">Avg. to Job</span>
                </div>
              </div>

              <div className="floating-stat stat-3">
                <span className="stat-icon"><i className="fa-solid fa-chalkboard-user" style={{ color: '#1E88E5' }} /></span>
                <div className="stat-content">
                  <span className="stat-value">200+</span>
                  <span className="stat-label">Expert Mentors</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════ STATS ══════════════════ */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-emoji">
                  <i className={s.icon} style={{ fontSize: 44, color: '#1E88E5' }} />
                </div>
                <span className="stat-number">{s.number}</span>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section className="features-section" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 6 }} />
              Why Choose Us
            </span>
            <h2 className="section-title">Everything You Need for Career Success</h2>
            <p className="section-subtitle">Comprehensive tools and resources backed by AI technology and expert guidance.</p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">
                  <i className={f.icon} style={{ fontSize: 28, color: '#1E88E5' }} />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-description">{f.description}</p>
                <div className="feature-highlights">
                  {f.highlights.map((h, j) => (
                    <span className="highlight-badge" key={j}>
                      <i className="fa-solid fa-check" style={{ marginRight: 4, fontSize: 10 }} />
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ PROCESS ══════════════════ */}
      <section className="process-section" id="process">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <i className="fa-solid fa-sitemap" style={{ marginRight: 6 }} />
              Our Process
            </span>
            <h2 className="section-title">Your Path to Success</h2>
            <p className="section-subtitle">A proven 4-step process to transform your career in months, not years.</p>
          </div>

          <div className="process-steps">
            {process.map((item, i) => (
              <div className="process-step" key={i}>
                <div className="step-number">
                  <i className={item.icon} style={{ fontSize: 22 }} />
                </div>
                <div className="step-content">
                  <h3 className="step-title">{item.title}</h3>
                  <p className="step-description">{item.description}</p>
                </div>
                {i < process.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <section className="testimonials-section" id="testimonials">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <i className="fa-solid fa-trophy" style={{ marginRight: 6 }} />
              Success Stories
            </span>
            <h2 className="section-title">What Our Students Say</h2>
            <p className="section-subtitle">Real stories from students who transformed their careers with CareerIQ.</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div
                className="testimonial-card"
                key={i}
                onClick={() => setActiveTestimonial(i)}
                style={{ outline: i === activeTestimonial ? '2px solid rgba(30,136,229,0.4)' : 'none' }}
              >
                <div className="testimonial-header">
                  <img src={t.image} alt={t.name} className="testimonial-avatar" />
                  <div className="testimonial-info">
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-role">{t.role}</p>
                    <p className="testimonial-company">{t.company}</p>
                  </div>
                  <div className="testimonial-quote">
                    <i className="fa-solid fa-quote-left" style={{ color: 'rgba(30,136,229,0.25)', fontSize: 36 }} />
                  </div>
                </div>
                <div className="testimonial-rating">
                  {[...Array(t.rating)].map((_, j) => (
                    <i key={j} className="fa-solid fa-star" style={{ color: '#f59e0b' }} />
                  ))}
                </div>
                <p className="testimonial-text">{t.text}</p>
              </div>
            ))}
          </div>

          <div className="testimonial-indicators">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`indicator${i === activeTestimonial ? ' active' : ''}`}
                onClick={() => setActiveTestimonial(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">Your Career Journey Starts Here</h2>
            <p className="cta-subtitle">
              Join thousands of students who are already building their dream careers.
              Get started today with our AI-powered career assessment and personalized roadmap.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary btn-large" onClick={() => window.location.href = '/signup'}>
                Join CareerIQ Today &nbsp;<i className="fa-solid fa-arrow-right arrow" />
              </button>
              <button 
                className="btn-secondary btn-large" 
                style={{ backgroundColor: '#1E88E5', color: '#ffffff', borderColor: '#1E88E5' }}
                onClick={() => window.location.href = '/login'}
              >
                <i className="fa-solid fa-right-to-bracket" style={{ marginRight: 8 }} />
                Sign In
              </button>
            </div>
            <p className="cta-note">
              <i className="fa-solid fa-shield-halved" style={{ marginRight: 6, color: '#1E88E5' }} />
              14-day free trial &nbsp;·&nbsp; No credit card required &nbsp;·&nbsp; Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="footer" id="footer">
        <div className="footer-content">

          <div className="footer-column">
            <a href="#" className="footer-logo">
              <span className="career">Career</span>
              <span style={{ background: 'linear-gradient(135deg,#1E88E5,#42A5F5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IQ</span>
            </a>
            <p className="footer-description">
              AI-powered career guidance and skill-based learning platform helping students achieve their dream careers.
            </p>
            <div className="footer-social">
              <span className="social-link" style={{ color: '#1565C0' }}><i className="fa-brands fa-x-twitter" /></span>
              <span className="social-link" style={{ color: '#1565C0' }}><i className="fa-brands fa-linkedin-in" /></span>
              <span className="social-link" style={{ color: '#1565C0' }}><i className="fa-brands fa-instagram" /></span>
            </div>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Features</h4>
            <ul className="footer-links">
              <li><a onClick={() => handleNavClick('features')}><i className="fa-solid fa-chevron-right" style={{ marginRight: 6, fontSize: 11 }} />How It Works</a></li>
              <li><a onClick={() => handleNavClick('testimonials')}><i className="fa-solid fa-chevron-right" style={{ marginRight: 6, fontSize: 11 }} />Success Stories</a></li>
              <li><a onClick={() => handleNavClick('features')}><i className="fa-solid fa-chevron-right" style={{ marginRight: 6, fontSize: 11 }} />Get Started</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-links">
              <li><a href="#"><i className="fa-solid fa-chevron-right" style={{ marginRight: 6, fontSize: 11 }} />Career Guides</a></li>
              <li><a href="#"><i className="fa-solid fa-chevron-right" style={{ marginRight: 6, fontSize: 11 }} />Blog</a></li>
              <li><a href="#"><i className="fa-solid fa-chevron-right" style={{ marginRight: 6, fontSize: 11 }} />Help Center</a></li>
              <li><a href="#"><i className="fa-solid fa-chevron-right" style={{ marginRight: 6, fontSize: 11 }} />Community</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-contact">
              <li><i className="fa-solid fa-envelope" style={{ color: '#1E88E5', width: 18 }} /> careeriq@gmail.com</li>
              <li><i className="fa-solid fa-phone" style={{ color: '#1E88E5', width: 18 }} /> +91 79907 07842</li>
              <li><i className="fa-solid fa-location-dot" style={{ color: '#1E88E5', width: 18 }} /> Surat, Gujarat</li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            <i className="fa-regular fa-copyright" style={{ marginRight: 6 }} />
            2026 CareerIQ. All rights reserved.
          </p>
          <div className="footer-legal">
            <a href="#"><i className="fa-solid fa-shield-halved" style={{ marginRight: 4 }} />Privacy Policy</a>
            <span>•</span>
            <a href="#"><i className="fa-solid fa-file-contract" style={{ marginRight: 4 }} />Terms of Service</a>
            <span>•</span>
            <a href="#"><i className="fa-solid fa-cookie-bite" style={{ marginRight: 4 }} />Cookie Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default CareerIQLanding;