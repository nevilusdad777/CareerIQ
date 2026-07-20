import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import activityTracker from "../../utils/activityTracker";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    if (token && token !== "null" && token !== "") {
      navigate(role === "admin" ? "/admindashboard" : "/home", { replace: true });
    }
  }, [navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 4 || email === "admin";

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    // Simulate Google OAuth login
    setTimeout(() => {
      setLoading(false);
      const email = "user@gmail.com";
      sessionStorage.setItem("token", `google-token-${Date.now()}`);
      sessionStorage.setItem("role", "user");
      sessionStorage.setItem("currentUser", JSON.stringify({
        name: "Google User",
        email: email,
        role: "user",
        provider: "google"
      }));

      // Log activity
      activityTracker.logUserLogin(email);

      navigate("/home");
    }, 1500);
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setError("");
    // Simulate GitHub OAuth login
    setTimeout(() => {
      setLoading(false);
      const email = "user@github.com";
      sessionStorage.setItem("token", `github-token-${Date.now()}`);
      sessionStorage.setItem("role", "user");
      sessionStorage.setItem("currentUser", JSON.stringify({
        name: "GitHub User",
        email: email,
        role: "user",
        provider: "github"
      }));

      // Log activity
      activityTracker.logUserLogin(email);

      navigate("/home");
    }, 1500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (isAdminMode) {
      console.log('🔐 Admin mode activated');
      console.log('📧 Email entered:', email);
      console.log('🔑 Password entered:', password);
      console.log('🔍 Checking credentials...');

      if ((email === "admin" || email === "admin@careeriq.com") && password === "admin@123") {
        console.log('✅ Admin credentials validated');
        setLoading(true);
        try {
          const response = await axios.post("http://localhost:5000/api/auth/login", {
            email: "admin@careeriq.com",
            password: "admin@123"
          });

          if (response.data.success) {
            sessionStorage.setItem("token", response.data.data.token);
            sessionStorage.setItem("role", response.data.data.user.role);
            sessionStorage.setItem("currentUser", JSON.stringify(response.data.data.user));
            navigate("/admindashboard");
          } else {
            setError("Invalid admin credentials!");
          }
        } catch (err) {
          setError(err.response?.data?.message || "Admin login failed. Please try again.");
        } finally {
          setLoading(false);
        }
      } else {
        setError("Invalid admin credentials!");
      }
      return;
    }

    if (!validateEmail(email)) { setError("Please enter a valid email address"); return; }
    if (!validatePassword(password)) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      });

      if (response.data.success) {
        sessionStorage.setItem("token", response.data.data.token);
        sessionStorage.setItem("role", response.data.data.user.role);
        sessionStorage.setItem("currentUser", JSON.stringify(response.data.data.user));

        // Log activity
        if (response.data.data.user.role === "admin") {
          activityTracker.logAdminLogin("Admin dashboard access", response.data.data.user.email);
          navigate("/admindashboard");
        } else {
          activityTracker.logUserLogin(response.data.data.user.email);
          navigate("/home");
        }
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === "NETWORK_ERROR") {
        setError("Network error. Please check your connection.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-login-container">
      <div className="login-form-container">

        <div className="form-header">
          <h2>{isAdminMode ? "Admin Access" : <span>Welcome to <span className="career-text">Career</span><span className="iq-text">IQ</span></span>}</h2>
          <p>{isAdminMode ? "Secure admin login portal" : "Sign in to your CareerIQ account"}</p>
        </div>

        {/* Toggle Admin / User */}
        <button
          type="button"
          onClick={() => { setIsAdminMode(!isAdminMode); setEmail(""); setPassword(""); setError(""); }}
          className="toggle-mode-btn"
        >
          <i className={isAdminMode ? "fas fa-user" : "fas fa-shield-alt"}></i>
          {isAdminMode ? "Switch to User Login" : "Admin Login"}
        </button>

        {error && (
          <div className="error-alert">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>
              <i className="fas fa-envelope"></i>
              {isAdminMode ? "Username" : "E-mail Address"}
            </label>
            <input
              type="text"
              placeholder={isAdminMode ? "Enter admin username" : "Enter your email"}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-lock"></i>
              Password
            </label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
              >
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
          </div>

          {!isAdminMode && (
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
            ) : (
              <><i className="fas fa-sign-in-alt"></i> Sign In</>
            )}
          </button>
        </form>

        {!isAdminMode && (
          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        )}
      </div>
    </div>
  );
}