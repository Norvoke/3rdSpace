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
              A place for<br />
              <span className={styles.accent}>your people.</span>
            </h1>
            <p className={styles.sub}>
              3rdSpace is a non-profit social network. There are no advertisers,
              no algorithms, and nothing to sell you. It exists for one reason —
              to help you stay close to the people you care about.
            </p>
            <p className={styles.sub}>
              No influencers. No content. No feed designed to keep you scrolling.
              Just your friends, their updates, and a place to talk.
            </p>
            <div className={styles.heroActions}>
              {isAuthenticated ? (
                <Link to="/feed" className="btn btn-primary">Go to Feed</Link>
              ) : (
                <Link to="/login" className="btn btn-primary">Join 3rdSpace</Link>
              )}
              <Link to="/search" className="btn btn-ghost">Find people</Link>
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
            {
              title: 'Not the product',
              body: 'No ads. No data sold. No investors to answer to. 3rdSpace is non-profit and always will be. Your account exists for you, not for a revenue model.',
            },
            {
              title: 'Chronological, always',
              body: "You see what your friends post, in the order they posted it. No ranking, no boosting, no posts buried because they didn't drive engagement.",
            },
            {
              title: 'Your profile, your way',
              body: 'Write your bio, set your mood, customise your page. It should feel like yours — not a template optimised for time-on-site.',
            },
            {
              title: 'Real distance, real connection',
              body: 'Whether your friends are across the city or across the world, this is a place to actually keep up with each other.',
            },
          ].map(f => (
            <div key={f.title} className={`${styles.feature} card`}>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureBody}>{f.body}</p>
            </div>
          ))}
        </section>

        <section className={styles.manifesto}>
          <p>
            Social media was supposed to be about people. Somewhere along the way
            it became about attention, advertising, and keeping you online as long
            as possible. 3rdSpace is an attempt to go back — a small, quiet corner
            of the internet where the point is just to be connected to your friends.
          </p>
          <p>
            It is free. It will stay free. It is non-profit. It will stay non-profit.
          </p>
        </section>
      </div>
    </div>
  );
}
