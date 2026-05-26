import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, LayoutDashboard, ShieldCheck, User } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        {/* Brand */}
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-dot" />
          <span>Spendly</span>
        </Link>

        {/* Navigation links */}
        <nav className="navbar-links">
          <Link
            to="/dashboard"
            className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          <Link
            to="/profile"
            className={`nav-link ${isActive("/profile") ? "active" : ""}`}
          >
            <User size={16} />
            Profile
          </Link>

          {/* Admin link is only visible to users with the admin role */}
          {user.role === "admin" && (
            <Link
              to="/admin"
              className={`nav-link nav-link-admin ${isActive("/admin") ? "active" : ""}`}
            >
              <ShieldCheck size={16} />
              Admin
            </Link>
          )}
        </nav>

        {/* User info + logout */}
        <div className="navbar-right">
          <span className="navbar-username">@{user.username}</span>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
