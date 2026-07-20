import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
 
import Home from "../pages/Home/Home";
import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Profile/Profile";
import SkillGap from "../pages/SkillGap/SkillGap";
import Predictor from "../pages/PlacementPredictor/Predictor";
import Roadmap from "../pages/Roadmap/Roadmap";
import RoadmapDetailed from "../pages/Roadmap/RoadmapDetailed";
import MarketIntel from "../pages/MarketIntel/MarketIntel";
import Feedback from "../pages/Feedback/Feedback";
import InterviewPrep from "../pages/InterviewPrep/InterviewPrep";
import JobBoard from "../pages/JobBoard/JobBoard";
import AdminInterview from "../Admin/AdminInterview";
import AdminJob from "../Admin/AdminJob";
import Signup from "../pages/Auth/Signup";
import Login from "../pages/Auth/Login";
import Hero from "../pages/Hero/hero";

// Admin Pages
import AdminDashboard from "../Admin/AdminDashboard";
import AdminUsers from "../Admin/AdminUsers";
import UserRecords from "../Admin/UserRecords";
import ManageFeedback from "../Admin/ManageFeedback";
import SkillManager from "../Admin/SkillManager";
import AdminMarketIntel from "../Admin/AdminMarketIntel";
import AdminEvents from "../Admin/AdminEvents";
import AdminLayout from "../Admin/AdminLayout";
import Settings from "../Admin/Settings";

// 404 Page
const NotFound = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "26px",
      fontWeight: "600",
      background: "#0f172a",
      color: "#fff"
    }}
  >
    404 | Page Not Found
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Login/Signup */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Landing Page - Public */}
      <Route path="/" element={<Hero />} />
      
      {/* Protected Home/Landing (agar logged in user ko home dikhana hai) */}
      <Route path="/home" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />

      {/* Protected User Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/skill-gap" element={<Navigate to="/skillgap" replace />} />
      <Route path="/skill_gap" element={<Navigate to="/skillgap" replace />} />
      
      <Route path="/skillgap" element={
        <ProtectedRoute>
          <SkillGap />
        </ProtectedRoute>
      } />
      
      <Route path="/predictor" element={
        <ProtectedRoute>
          <Predictor />
        </ProtectedRoute>
      } />
      
      <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
      <Route path="/roadmap/:id" element={<ProtectedRoute><RoadmapDetailed /></ProtectedRoute>} />
      
      <Route path="/market" element={
        <ProtectedRoute>
          <MarketIntel />
        </ProtectedRoute>
      } />
      
      
      
      <Route path="/feedback" element={
        <ProtectedRoute>
          <Feedback />
        </ProtectedRoute>
      } />

      <Route path="/interview-prep" element={
        <ProtectedRoute>
          <InterviewPrep />
        </ProtectedRoute>
      } />

      <Route path="/job-board" element={
        <ProtectedRoute>
          <JobBoard />
        </ProtectedRoute>
      } />


      {/* Admin Routes with Shared Layout */}
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/adminusers" element={<AdminUsers />} />
        <Route path="/userrecords" element={<UserRecords />} />
        <Route path="/managefeedback" element={<ManageFeedback />} />
        <Route path="/skillmanager" element={<SkillManager />} />
        <Route path="/marketdata" element={<AdminMarketIntel />} />
        <Route path="/adminevents" element={<AdminEvents />} />
        <Route path="/manage-interview" element={<AdminInterview />} />
        <Route path="/manage-jobs" element={<AdminJob />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* 404 - Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}