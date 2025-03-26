import { NavLink } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import { useSessionStore } from "../../store/SessionStore";
import logo from "../../assets/logo.svg";
import "./Navigation.css";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSaleStore } from "../../store/SaleStore";
interface NavigationProps {
  isLoaded: boolean;
}

function Navigation({ isLoaded }: NavigationProps) {
  const user = useSessionStore((state) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logout = useSessionStore((state) => state.logout);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    useSaleStore.getState().clearSales();
    await logout();
    setMobileMenuOpen(false);
    navigate("/login");
};

  const sessionLinks = user ? (
    <>
      <li className="desktop-only">
        <ProfileButton user={user} />
      </li>
    </>
  ) : (
    <>
      <div className="navBar-links desktop-only">
        <li>
          <NavLink to="/login" className="nav-links">Log In</NavLink>
        </li>
        <li>
          <NavLink to="/signup" className="nav-links">Sign Up</NavLink>
        </li>
      </div>
    </>
  );

  const mobileMenuContent = user ? (
    <div className="mobile-menu-container">
      <div className="mobile-menu-user-info">
        <div className="mobile-menu-user-name">
          {user.firstName} {user.lastName}
        </div>
        <div className="mobile-menu-user-email">{user.email}</div>
      </div>
      <div className="mobile-menu-bottom">
        <button onClick={handleLogout} className="mobile-menu-logout">
          Log Out
        </button>
      </div>
    </div>
  ) : (
    <div className="mobile-menu-links">
      <NavLink to="/login" className="mobile-nav-link" onClick={toggleMobileMenu}>
        Log In
      </NavLink>
      <NavLink to="/signup" className="mobile-nav-link" onClick={toggleMobileMenu}>
        Sign Up
      </NavLink>
    </div>
  );

  return (
    <nav className="navBar">
      <div className="navBar-left">
        <NavLink to="/" className="logoContainer">
          <img src={logo} alt="Logo" className="logo" />
        </NavLink>
      </div>
      <div className="navBar-right">
        <ul>{isLoaded && sessionLinks}</ul>
        <div className="mobile-menu-button">
          <button onClick={toggleMobileMenu}>
            <FaBars />
          </button>
        </div>
      </div>

      {/* Mobile menu and backdrop */}
      {mobileMenuOpen && <div className="mobile-backdrop" onClick={toggleMobileMenu}></div>}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-title">Menu</div>
          <button className="mobile-menu-close" onClick={toggleMobileMenu}>
            <FaTimes />
          </button>
        </div>
        {mobileMenuContent}
      </div>
    </nav>
  );
}

export default Navigation;
