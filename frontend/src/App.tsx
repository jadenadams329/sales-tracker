import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import LoginFormPage from "./pages/Login/LoginPage";
import { useSessionStore } from "./store/SessionStore";
import SignupPage from "./pages/SignUp/SignupPage";
import Navigation from "./components/Navigation/Navigation";
import './App.css'
import HomePage from "./pages/Home/HomePage";
import { useNavigate } from "react-router-dom";

// Protected route component to check authentication
const ProtectedRoute = () => {
  const user = useSessionStore.getState().user;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <HomePage />;
}

function Layout() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const restoreUser = useSessionStore((state) => state.restoreUser);
  const navigate = useNavigate();

  useEffect(() => {
    restoreUser().then(() => {
      setIsLoaded(true);
      const user = useSessionStore.getState().user;
      
      // Redirect to login page if user is not authenticated
      if (!user && window.location.pathname === '/') {
        navigate('/login');
      }
    });
  }, [restoreUser, navigate]);

  return (
    <>
      <div className="navContainer">
        <Navigation isLoaded={isLoaded} />
      </div>
      <div className="pageContainer">
        {isLoaded && <Outlet />}
      </div>
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <ProtectedRoute />,
      },
      {
        path: "/login",
        element: <LoginFormPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
