import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>This space doesn't exist.</h1>
      <p className="text-muted">The page you're looking for has left the building.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
        Back to Home
      </Link>
    </div>
  );
}
