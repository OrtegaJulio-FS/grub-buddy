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
      </div>
    </header>
  );
}
