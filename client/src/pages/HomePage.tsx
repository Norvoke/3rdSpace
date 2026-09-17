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
              The Third<br />
              <span className={styles.accent}>Place.</span>
            </h1>
            <p className={styles.sub}>
              Somewhere between home and work where you can just exist.
              No reason needed. No money required.
            </p>
            <div className={styles.heroActions}>
              {isAuthenticated ? (
                <Link to="/feed" className="btn btn-primary">Go to your space</Link>
              ) : (
                <Link to="/login" className="btn btn-primary">Join 3rdSpace</Link>
              )}
              <Link to="/wall" className="btn btn-ghost">See the wall</Link>
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
          <h2 className={styles.sectionHeading}>What is a third place?</h2>
          <div className={styles.thirdPlaceText}>
            <p>
              Your first place is home. Your second place is work or school.
              The third place is everything in between. The library. The park.
              The cafe where nobody asks you to leave. Places you can just be
              without it costing anything.
            </p>
            <p>
              A sociologist named Ray Oldenburg wrote about these places back
              in the 80s. His point was that this is where actual community
              happens. Not because anything important is going on, but because
              you're around other people with no agenda. You're a regular,
              not a customer.
            </p>
            <p>
              Most of them are gone now. Libraries got cut. Parks close at
              dusk. The pub turns into flats. Turns out the places where you
              could just exist without spending money were doing more for
              people than anyone gave them credit for.
            </p>
            <p>
              This is an attempt at one online, and it's built like the old
              internet instead of the current one. Think early MySpace, not
              TikTok. Back before "social media" was even a phrase, sites like
              this were just called social networks, and the difference
              actually matters. A social network is for finding your friends.
              Social media is for holding your attention. This is trying to
              be the first one.
            </p>
            <p>
              So there's no algorithm. No ads. No endless feed of content from
              people you've never met. No push notifications buzzing your
              phone because someone liked your post. Nothing updates in real
              time, and nothing needs to. Post something, come back whenever
              you feel like it, see what your friends have been up to. That's
              the whole app. Log off and go outside if you want, this place
              isn't going anywhere.
            </p>
          </div>
        </section>

        <section className={styles.features}>
          {[
            {
              title: 'Not the product',
              body: "No ads. No data sold. We're a non-profit. You're here because you want to be, not because something was engineered to keep you scrolling.",
            },
            {
              title: 'Chronological, always',
              body: "Posts show up in the order they were written. Nothing gets ranked or boosted because it's \"trending.\" If you missed it, you missed it. That's fine.",
            },
            {
              title: 'Actually your profile',
              body: 'Write your bio. Set your mood. Mess with the CSS if you feel like it. It should feel like somewhere you live, not a form you filled out once.',
            },
            {
              title: 'For your people, not your feed',
              body: "Friends near and far. Groups for stuff you care about. No followers, no strangers' posts pushed at you. Just the people you actually know.",
            },
            {
              title: 'No pressure to check it',
              body: "No push notifications. Nothing is real time. There's no red dot guilting you into opening the app. Come back tomorrow or next week, it'll still be here.",
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
            The early internet felt a bit like this. Forums, blogs, MySpace
            profiles you'd spend hours customizing at 2am. Places people
            showed up because they wanted to, not because a feed was
            engineered to keep pulling them back in. That changed once the
            advertising money showed up and the whole business model became
            keeping you on the page as long as possible.
          </p>
          <p>
            3rdSpace doesn't take money from advertisers. There's no growth
            target and no one here is trying to get you to open the app more.
            It's free and it'll stay free, because the whole point is that
            you shouldn't have to get sold just to have somewhere to exist
            online.
          </p>
        </section>
      </div>
    </div>
  );
}
