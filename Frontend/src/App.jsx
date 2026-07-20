import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Sidebar from "./components/Sidebar/Sidebar";
import Chatbot from "./components/Chatbot/Chatbot";

function App() {
  const location = useLocation();
  
  // Hide sidebar on auth pages and hero page
  const isAuthPage = location.pathname === "/login" || 
                     location.pathname === "/signup" ||
                     location.pathname === "/";
  
  // Hide sidebar on admin pages (prefix based) and specific routes
  const hideSidebar = isAuthPage || location.pathname.startsWith("/admin") || 
                      location.pathname.startsWith("/manage") || 
                      location.pathname === "/userrecords" ||
                      location.pathname === "/skillmanager" ||
                      location.pathname === "/marketdata" ||
                      location.pathname === "/settings";

  return (
    <div className="app-layout">
      {!hideSidebar && <Sidebar />}
      
      <div className={hideSidebar ? "content-full" : "content-with-sidebar"}>
        <AppRoutes />
      </div>
      <Chatbot />
    </div>
  );
}

// Add styles for layout
const styles = `
  .app-layout {
    display: flex;
    min-height: 100vh;
  }
  
  .content-with-sidebar {
    flex: 1;
    margin-left: 260px;
    transition: margin-left 0.3s ease;
  }
  
  .content-full {
    flex: 1;
    width: 100%;
    margin-left: 0;
  }
  
  @media (max-width: 768px) {
    .content-with-sidebar {
      margin-left: 0;
    }
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default App;