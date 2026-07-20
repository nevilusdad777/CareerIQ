import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setError("");
        setErrors({});
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Email Validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password Validation
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear specific error when user types
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setError("");
    
    // Check for Caps Lock when typing in password fields
    if (name === "password" || name === "confirmPassword") {
      // Simple caps lock detection: check if there are uppercase letters without shift key
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      setCapsLockOn(hasUppercase && !hasLowercase && value.length > 0);
    }
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        const errorMessage = err.response.data.message;
        if (errorMessage.toLowerCase().includes("already exists") || errorMessage.toLowerCase().includes("email")) {
          setError("Email already registered. Please login.");
          setErrors({ email: "Email already exists" });
        } else {
          setError(errorMessage);
        }
      } else if (err.code === "NETWORK_ERROR") {
        setError("Network error. Please check your connection.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Social Sign Up Handlers
  const handleGoogleSignUp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Google sign up successful!");
      navigate("/");
    }, 1000);
  };

  const handleGithubSignUp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("GitHub sign up successful!");
      navigate("/");
    }, 1000);
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="logo-container">
          <h1 className="signup-logo">
            <span className="career" style={{ color: '#000000' }}>Career</span>
            <span className="iq" style={{ color: '#1E88E5' }}>IQ</span>
          </h1>
        </div>

        <h2>Create Account</h2>
        <p className="subtitle">Join CareerIQ Today</p>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <div className="input-group">
            <label>
              <i className="fas fa-user label-icon"></i>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
              required
            />
            {errors.name && (
              <span className="field-error">
                <i className="fas fa-exclamation-circle"></i> {errors.name}
              </span>
            )}
          </div>

          <div className="input-group">
            <label>
              <i className="fas fa-envelope label-icon"></i>
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              required
            />
            {errors.email && (
              <span className="field-error">
                <i className="fas fa-exclamation-circle"></i> {errors.email}
              </span>
            )}
          </div>

          <div className="input-group">
            <label>
              <i className="fas fa-lock label-icon"></i>
              Password
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-button"
              >
                <i
                  className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                ></i>
              </button>
            </div>
            {errors.password && (
              <span className="field-error">
                <i className="fas fa-exclamation-circle"></i> {errors.password}
              </span>
            )}
            {capsLockOn && (
              <span className="caps-lock-warning">
                <i className="fas fa-exclamation-triangle"></i> Caps Lock is ON
              </span>
            )}
          </div>

          <div className="input-group">
            <label>
              <i className="fas fa-lock label-icon"></i>
              Confirm Password
            </label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="eye-button"
              >
                <i
                  className={
                    showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"
                  }
                ></i>
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="field-error">
                <i className="fas fa-exclamation-circle"></i>{" "}
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="signup-footer">
          <span className="footer-text">Already have an account?</span>
          <Link to="/login" className="login-link">
            Login
          </Link>
        </div>

        <div className="shortcuts">
          <small className="shortcut-text">
            <i className="fas fa-keyboard"></i> Press <kbd>Enter</kbd> to sign
            up • <kbd>Esc</kbd> to clear
          </small>
        </div>
      </div>
    </div>
  );
}