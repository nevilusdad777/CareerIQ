import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import axios from "axios";

import "./styles/variables.css";
import "./styles/global.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Configure Axios Global Interceptor to dynamically rewrite local backend URLs to the deployed Backend URL
axios.interceptors.request.use(
  (config) => {
    let backendUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (backendUrl) {
      // Strip trailing slash if present
      backendUrl = backendUrl.replace(/\/$/, "");
      // Strip trailing /api if present because components include /api
      backendUrl = backendUrl.replace(/\/api$/, "");
      
      if (config.url) {
        if (config.url.startsWith("http://localhost:5000")) {
          config.url = config.url.replace("http://localhost:5000", backendUrl);
        } else if (config.url.startsWith("http://127.0.0.1:5000")) {
          config.url = config.url.replace("http://127.0.0.1:5000", backendUrl);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
