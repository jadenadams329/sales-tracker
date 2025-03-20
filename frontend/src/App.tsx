import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import LoginFormPage from "./pages/Login/LoginPage";
import { useSessionStore } from "./store/store";
import "./App.css";

function Layout() {
  const [isLoaded, setIsLoaded] = useState(false);
  const restoreUser = useSessionStore((state) => state.restoreUser);

  useEffect(() => {
    restoreUser().then(() => {
      setIsLoaded(true);
    });
  }, [restoreUser]);

  return <>{isLoaded && <Outlet />}</>;
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <h1>Welcome!</h1>,
      },
      {
        path: "/login",
        element: <LoginFormPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
