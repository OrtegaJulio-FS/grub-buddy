import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../common/Avatar';
import './NavBar.css';

export function NavBar({ children }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate('/');
  }

  return (
    <header className="nav-bar">
      <div className="container nav-bar__inner">
        <Link to="/" className="nav-bar__logo">
          Grub<em>buds</em>
        </Link>
        <div className="nav-bar__search-slot">{children}</div>
        <nav className="nav-bar__links">
          {user && (
            <Link to="/activity" className="nav-bar__profile-link">
              Activity
            </Link>
          )}

          {loading ? null : user ? (
            <div className="nav-bar__menu" ref={menuRef}>
              <button
                type="button"
                className="nav-bar__avatar-btn"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-label="Account menu"
              >
                <Avatar name={user.name} src={user.avatar_url} size="sm" />
              </button>
              {menuOpen && (
                <div className="nav-bar__dropdown" role="menu">
                  <Link
                    to={`/profile/${user.id}`}
                    className="nav-bar__dropdown-item"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    My profile
                  </Link>
                  <button type="button" className="nav-bar__dropdown-item" role="menuitem" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-bar__profile-link">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
