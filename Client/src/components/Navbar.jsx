import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">picta</Link>
        <div className="nav-links">
          <Link to="/search" className="nav-icon-link">Search</Link>
          <Link to="/create" className="nav-icon-link">New post</Link>
          {user && (
            <Link to={`/profile/${user.id}`} className="avatar-ring">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                alt={user.username}
                className="avatar"
                style={{ width: 28, height: 28 }}
              />
            </Link>
          )}
          <button onClick={logout} className="btn-ghost">Log out</button>
        </div>
      </div>
    </div>
  );
}