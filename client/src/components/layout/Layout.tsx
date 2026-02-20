import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import styles from './Layout.module.css';

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
            <Link to="/search" className={styles.navLink}>Search</Link>
          </div>

          <div className={styles.navActions}>
            {isAuthenticated && user ? (
              <>
                <Link to={`/u/${user.username}`} className={styles.navLink}>
                  <img
                    src={user.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${user.username}`}
                    alt={user.displayName}
                    className={styles.navAvatar}
                  />
                  {user.displayName}
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
          <span className={styles.footerTagline}>no algorithms. no ads. just people.</span>
        </div>
      </footer>
    </div>
  );
}
