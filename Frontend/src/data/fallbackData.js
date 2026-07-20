// Fallback data for dashboard when backend fails
export const fallbackDashboardData = {
  notifications: [
    { id: 1, type: "achievement", message: "Welcome to CareerIQ!", time: "Just now", icon: "fa-trophy" },
    { id: 2, type: "reminder", message: "Complete your profile to get started", time: "1 hour ago", icon: "fa-bell" }
  ],
  upcomingEvents: [
    { id: 1, title: "Getting Started", date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), type: "tutorial" },
    { id: 2, title: "Profile Setup", date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), type: "deadline" }
  ],
  learningProgress: [
    { name: "Profile Completion", progress: 25, target: 100, status: "In Progress" },
    { name: "Skills Assessment", progress: 0, target: 100, status: "Not Started" },
    { name: "Project Setup", progress: 0, target: 100, status: "Not Started" },
    { name: "Career Planning", progress: 0, target: 100, status: "Not Started" }
  ],
  quickActions: [
    { id: 1, title: "Complete Profile", icon: "fa-user", color: "#3b82f6", action: "profile" },
    { id: 2, title: "Take Assessment", icon: "fa-brain", color: "#10b981", action: "skillgap" },
    { id: 3, title: "View Roadmap", icon: "fa-road", color: "#f59e0b", action: "roadmap" },
    { id: 4, title: "Career Predictor", icon: "fa-robot", color: "#8b5cf6", action: "predictor" }
  ],
  achievements: [
    { title: "First Steps", icon: "fa-rocket", unlocked: false, description: "Get started with CareerIQ", progress: 0 },
    { title: "Profile Complete", icon: "fa-user", unlocked: false, description: "Complete your profile", progress: 0 },
    { title: "Skill Master", icon: "fa-star", unlocked: false, description: "Master 5+ skills", progress: 0 },
    { title: "Career Ready", icon: "fa-trophy", unlocked: false, description: "Complete all assessments", progress: 0 }
  ],
  activities: [],
  learningHours: [
    { day: "Mon", hours: 0 },
    { day: "Tue", hours: 0 },
    { day: "Wed", hours: 0 },
    { day: "Thu", hours: 0 },
    { day: "Fri", hours: 0 },
    { day: "Sat", hours: 0 },
    { day: "Sun", hours: 0 }
  ],
  analytics: {
    placementProbability: 0,
    bestRoleMatch: "Not Available",
    totalSkills: 0,
    profileStrength: "Very Bad",
    confidenceLevel: 0,
    totalXP: 100
  },
  skills: [
    { name: "JavaScript", level: 0, category: "Technical" },
    { name: "React", level: 0, category: "Technical" },
    { name: "Node.js", level: 0, category: "Technical" },
    { name: "Communication", level: 0, category: "Soft Skills" }
  ]
};
