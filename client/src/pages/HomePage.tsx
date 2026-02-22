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
              the third<br />
              <span className={styles.accent}>place.</span>
            </h1>
            <p className={styles.sub}>
              somewhere between home and work where you can just exist.
              no reason needed. no money required.
            </p>
            <div className={styles.heroActions}>
              {isAuthenticated ? (
                <Link to="/feed" className="btn btn-primary">go to your space</Link>
              ) : (
                <Link to="/login" className="btn btn-primary">join 3rdSpace</Link>
              )}
              <Link to="/wall" className="btn btn-ghost">see the wall</Link>
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

        <section className={styles.thirdPlace}>
          <h2 className={styles.sectionHeading}>what is a third place?</h2>
          <div className={styles.thirdPlaceText}>
            <p>
              your first place is home. your second place is work or school.
              the third place is everything in between. the library. the park.
              the cafe where nobody asks you to leave. places you can just be
              without it costing anything.
            </p>
            <p>
              a sociologist called ray oldenburg wrote about these places in
              the 80s. his point was that they are where actual community
              happens. not because anything important is going on, but because
              you are around other people with no agenda. you are a regular,
              not a customer.
            </p>
            <p>
              a lot of them are gone now. libraries shut. parks close at dusk.
              the pub becomes flats. slowly the places where you could exist
              without spending money are disappearing and it turns out they
              were doing more than we noticed.
            </p>
            <p>
              this is an attempt at one online. free to use, no ads, no
              algorithm deciding what you see. just your friends and a wall
              and some groups.
            </p>
          </div>
        </section>

        <section className={styles.features}>
          {[
            {
              title: 'not the product',
              body: 'no ads. no data sold. non-profit. you are here because you want to be, not because something was engineered to keep you scrolling.',
            },
            {
              title: 'chronological, always',
              body: 'posts show up in the order they were written. nothing is ranked or boosted. if you missed it, you missed it.',
            },
            {
              title: 'actually your profile',
              body: 'write your bio. set your mood. change the css if you feel like it. it should feel like somewhere you live, not a form you filled in.',
            },
            {
              title: 'for your people',
              body: 'friends near and far. groups for things you care about. the point is people, not followers.',
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
            the early internet felt a bit like this. forums and blogs and spaces
            where people showed up because they wanted to. that changed when the
            money came in and the point became keeping you on the page.
          </p>
          <p>
            3rdSpace does not take money from advertisers. there is no growth
            target. it is free and it will stay free because the whole point
            is that you should not have to pay to just exist somewhere.
          </p>
        </section>
      </div>
    </div>
  );
}
