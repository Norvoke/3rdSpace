import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className={styles.page}>
      <div className="container">
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              Your <span className={styles.accent}>Space.</span><br />
              Your <span className={styles.accentCyan}>Rules.</span>
            </h1>
            <p className={styles.sub}>
              A social network built different. No algorithmic feeds. No advertisers
              shaping what you see. Chronological. Personal. Yours.
            </p>
            <div className={styles.heroActions}>
              {isAuthenticated ? (
                <Link to="/feed" className="btn btn-primary">Go to Feed</Link>
              ) : (
                <Link to="/login" className="btn btn-warm">Claim Your Space</Link>
              )}
              <Link to="/search" className="btn btn-ghost">Explore Profiles</Link>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.profileCard}>
              <div className={styles.profileBanner} />
              <div className={styles.profileBody}>
                <div className={styles.profileAvatar} />
                <div className={styles.profileLines}>
                  <div className={styles.line} style={{ width: '60%' }} />
                  <div className={styles.line} style={{ width: '40%' }} />
                </div>
              </div>
              <div className={styles.profilePosts}>
                {[80, 60, 70].map((w, i) => (
                  <div key={i} className={styles.postStub}>
                    <div className={styles.stubAvatar} />
                    <div className={styles.stubLines}>
                      <div className={styles.line} style={{ width: `${w}%` }} />
                      <div className={styles.line} style={{ width: `${w - 20}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.features}>
          {[
            { icon: '⏱', title: 'Chronological Feed', body: 'Posts appear in the order they were written. No ranking. No boosting. Just time.' },
            { icon: '🎨', title: 'Custom Profiles', body: 'Make your profile yours. Custom CSS, header images, bio, mood, music — the whole deal.' },
            { icon: '🚫', title: 'Zero Ads', body: 'No advertisers. No tracking pixels. No sponsored content. You\'re not the product.' },
            { icon: '🤝', title: 'Real Connections', body: 'Friends, wall posts, and comments. Actual human interaction, not engagement metrics.' },
          ].map(f => (
            <div key={f.title} className={`${styles.feature} card`}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureBody}>{f.body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
