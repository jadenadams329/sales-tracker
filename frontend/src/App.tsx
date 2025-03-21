import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import LoginFormPage from "./pages/Login/LoginPage";
import { useSessionStore } from "./store/SessionStore";
import SignupPage from "./pages/SignUp/SignupPage";
import Navigation from "./components/Navigation/Navigation";

function Layout() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const restoreUser = useSessionStore((state) => state.restoreUser);

  useEffect(() => {
    restoreUser().then(() => {
      setIsLoaded(true);
    });
  }, [restoreUser]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
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
