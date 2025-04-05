import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Optional: Reset any relevant state (if using a state management library like Redux or Context)
    // Example: dispatch(logoutAction());

    // Redirect to the login page or homepage after logout
    navigate('/signin');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h2 className="text-xl">Logging you out...</h2>
    </div>
  );
};

export default Logout;
