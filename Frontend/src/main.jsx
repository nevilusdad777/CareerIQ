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

// Configure Axios Global Interceptor to dynamically rewrite localhost:5000 to the deployed Backend URL
axios.interceptors.request.use(
  (config) => {
    // Falls back to a default, but VITE_API_URL environment variable can be set on Vercel Dashboard
    const backendUrl = import.meta.env.VITE_API_URL || "https://careeriq-backend.vercel.app";
    if (config.url && config.url.startsWith("http://localhost:5000")) {
      config.url = config.url.replace("http://localhost:5000", backendUrl);
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
