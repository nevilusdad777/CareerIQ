import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userRole = localStorage.getItem('role') || sessionStorage.getItem('role'); // ya jahan se role milta hai
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

export default AdminRoute;