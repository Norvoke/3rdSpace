import { Outlet, Link, useNavigate } from 'react-router-dom';
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

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoAccent}>3rd</span>Space
          </Link>

          <div className={styles.navLinks}>
            {isAuthenticated && (
              <Link to="/feed" className={styles.navLink}>Feed</Link>
            )}
            <Link to="/wall" className={styles.navLink}>The Wall</Link>
            <Link to="/groups" className={styles.navLink}>Groups</Link>
          </div>

          <div className={styles.navActions}>
            <Link to="/search" className={styles.searchBtn} title="Search">
              <SearchIcon />
            </Link>
            {isAuthenticated && user ? (
              <>
                <NotificationBell />
                <Link to={`/u/${user.username}`} className={styles.userChip}>
                  <img
                    src={user.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${user.username}`}
                    alt={user.displayName}
                    className={styles.navAvatar}
                  />
                  <span className={styles.navName}>{user.displayName}</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}><span className={styles.logoAccent}>3rd</span>Space</span>
          <span className={styles.footerTagline}>non-profit · no ads · no algorithm</span>
        </div>
      </footer>
    </div>
  );
}
