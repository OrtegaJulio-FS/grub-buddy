import { Link } from 'react-router-dom';
import './NavBar.css';

export function NavBar({ children }) {
  return (
    <header className="nav-bar">
      <div className="container nav-bar__inner">
        <Link to="/" className="nav-bar__logo">
          Grub<em>buds</em>
        </Link>
        <div className="nav-bar__search-slot">{children}</div>
        <nav className="nav-bar__links">
          <Link to="/activity" className="nav-bar__profile-link">
            Activity
          </Link>
          <Link to="/profile" className="nav-bar__profile-link">
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
