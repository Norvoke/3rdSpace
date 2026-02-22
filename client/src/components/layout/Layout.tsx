import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from './NotificationBell';
import styles from './Layout.module.css';

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </>
      ) : (
        <>
          <line x1="3" y1="7" x2="21" y2="7"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="17" x2="21" y2="17"/>
        </>
      )}
    </svg>
  );
}

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  // Close menu on navigation
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>

          {/* Logo — full on desktop, '3rd' only on mobile */}
          <Link to="/" className={styles.logo} onClick={closeMenu}>
            <span className={styles.logoAccent}>3rd</span>
            <span className={styles.logoSuffix}>Space</span>
          </Link>

          {/* Desktop nav links */}
          <div className={styles.navLinks}>
            {isAuthenticated && (
              <Link to="/feed" className={styles.navLink}>Feed</Link>
            )}
            <Link to="/wall" className={styles.navLink}>The Wall</Link>
            <Link to="/groups" className={styles.navLink}>Groups</Link>
          </div>

          {/* Right side actions */}
          <div className={styles.navActions}>
            <Link to="/search" className={styles.searchBtn} title="Search" onClick={closeMenu}>
              <SearchIcon />
            </Link>
            {isAuthenticated && user ? (
              <>
                <NotificationBell />
                <Link to={`/u/${user.username}`} className={styles.userChip} onClick={closeMenu}>
                  <img
                    src={user.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${user.username}`}
                    alt={user.displayName}
                    className={styles.navAvatar}
                  />
                  <span className={styles.navName}>{user.displayName}</span>
                </Link>
                <button onClick={handleLogout} className={`btn btn-ghost btn-sm ${styles.logoutBtn}`}>
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" onClick={closeMenu}>
                Sign in
              </Link>
            )}

            {/* Hamburger — mobile only */}
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menu"
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            {isAuthenticated && (
              <Link to="/feed" className={styles.mobileLink} onClick={closeMenu}>Feed</Link>
            )}
            <Link to="/wall" className={styles.mobileLink} onClick={closeMenu}>The Wall</Link>
            <Link to="/groups" className={styles.mobileLink} onClick={closeMenu}>Groups</Link>
            <div className={styles.mobileDivider} />
            {isAuthenticated ? (
              <button className={styles.mobileLink} onClick={handleLogout}>Log out</button>
            ) : (
              <Link to="/login" className={styles.mobileLink} onClick={closeMenu}>Sign in</Link>
            )}
          </div>
        )}
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>
            <span className={styles.logoAccent}>3rd</span>Space
          </span>
          <span className={styles.footerTagline}>non-profit · no ads · no algorithm</span>
        </div>
      </footer>
    </div>
  );
}
