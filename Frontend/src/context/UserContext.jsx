import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = sessionStorage.getItem('currentUser');
    
    if (userData && userData !== 'null') {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        sessionStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      sessionStorage.setItem('currentUser', JSON.stringify(userData));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  };

  const value = {
    user,
    loading,
    updateUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;