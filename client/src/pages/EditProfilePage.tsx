import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import ImageInput from '../components/ImageInput';
import { HERO_PATTERNS, patternDataUri } from '../utils/heroPatterns';
import styles from './EditProfilePage.module.css';

const DEFAULT_BANNER_COLOR = '#5aa3ed';

export default function EditProfilePage() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    displayName: '',
    avatar: '',
    bio: '',
    location: '',
    website: '',
    mood: '',
    bannerColor: '',
    bannerPattern: '',
    bannerPatternColor: '',
    customCSS: '',
    customHTML: '',
    interests: '',
    isPrivate: false,
  });

  useEffect(() => {
    if (user) {
      setForm({
        displayName: user.displayName || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        mood: user.mood || '',
        bannerColor: user.bannerColor || '',
        bannerPattern: user.bannerPattern || '',
        bannerPatternColor: user.bannerPatternColor || '',
        customCSS: user.customCSS || '',
        customHTML: user.customHTML || '',
        interests: (user.interests || []).join(', '),
        isPrivate: user.isPrivate || false,
      });
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: (data: typeof form) =>
      api.put('/api/users/me/profile', {
        ...data,
        interests: data.interests.split(',').map(s => s.trim()).filter(Boolean),
      }),
    onSuccess: ({ data }) => {
      updateUser(data.user);
      navigate(`/u/${user?.username}`);
    },
  });

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(form);
  };

  return (
    <div className="container">
      <div className={styles.page}>
        <h1 className={styles.title}>Edit Profile</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Basics */}
          <section className={`card ${styles.section}`}>
            <h2 className={styles.sectionTitle}>Basics</h2>
            <div className={styles.field}>
              <label>Profile Picture</label>
              <ImageInput
                value={form.avatar}
                onChange={url => setForm(prev => ({ ...prev, avatar: url }))}
                round
                crop
              />
            </div>
            <div className={styles.field}>
              <label>Display Name</label>
              <input value={form.displayName} onChange={set('displayName')} maxLength={50} />
            </div>
            <div className={styles.field}>
              <label>Bio</label>
              <textarea value={form.bio} onChange={set('bio')} rows={3} maxLength={500} />
              <span className="text-muted">{form.bio.length}/500</span>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Location</label>
                <input value={form.location} onChange={set('location')} placeholder="City, Country" />
              </div>
              <div className={styles.field}>
                <label>Website</label>
                <input value={form.website} onChange={set('website')} placeholder="https://..." />
              </div>
            </div>
            <div className={styles.field}>
              <label>Current Mood</label>
              <input value={form.mood} onChange={set('mood')} placeholder="excited, tired, vibing..." maxLength={100} />
            </div>
            <div className={styles.field}>
              <label>Interests <span className="text-muted">(comma-separated)</span></label>
              <input value={form.interests} onChange={set('interests')} placeholder="music, coding, hiking..." />
            </div>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.isPrivate}
                onChange={e => setForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
              />
              Private profile (only friends can see your full profile)
            </label>
          </section>

          {/* Banner */}
          <section className={`card ${styles.section}`}>
            <h2 className={styles.sectionTitle}>Profile Banner</h2>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              Pick a background color and, if you want, tile a pattern over it.
              Leave it blank for the default.
            </p>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Background color</label>
                <div className={styles.colorField}>
                  <input
                    type="color"
                    value={form.bannerColor || DEFAULT_BANNER_COLOR}
                    onChange={set('bannerColor')}
                  />
                  {form.bannerColor && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setForm(prev => ({ ...prev, bannerColor: '' }))}
                    >
                      Reset to default
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.field}>
                <label>Pattern color</label>
                <div className={styles.colorField}>
                  <input
                    type="color"
                    value={form.bannerPatternColor || '#ffffff'}
                    onChange={set('bannerPatternColor')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.field}>
              <label>Pattern</label>
              <div className={styles.patternGrid}>
                <button
                  type="button"
                  className={`${styles.patternSwatch} ${!form.bannerPattern ? styles.patternSwatchActive : ''}`}
                  style={{ backgroundColor: form.bannerColor || DEFAULT_BANNER_COLOR }}
                  onClick={() => setForm(prev => ({ ...prev, bannerPattern: '' }))}
                  title="None"
                >
                  None
                </button>
                {HERO_PATTERNS.map(pattern => (
                  <button
                    type="button"
                    key={pattern.id}
                    className={`${styles.patternSwatch} ${form.bannerPattern === pattern.id ? styles.patternSwatchActive : ''}`}
                    style={{
                      backgroundColor: form.bannerColor || DEFAULT_BANNER_COLOR,
                      backgroundImage: patternDataUri(pattern, form.bannerPatternColor || '#ffffff', 0.4),
                    }}
                    onClick={() => setForm(prev => ({ ...prev, bannerPattern: pattern.id }))}
                    title={pattern.name}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Custom HTML */}
          <section className={`card ${styles.section}`}>
            <h2 className={styles.sectionTitle}>📝 About Me (HTML)</h2>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              Go wild. This renders as HTML on your profile — tables, images, marquees welcome.
            </p>
            <div className={styles.field}>
              <textarea
                value={form.customHTML}
                onChange={set('customHTML')}
                rows={8}
                placeholder="<p>Hi! I'm a <b>cool person</b>.</p>"
                className={styles.codeArea}
                maxLength={20000}
              />
            </div>
          </section>

          {/* Custom CSS */}
          <section className={`card ${styles.section}`}>
            <h2 className={styles.sectionTitle}>🎨 Custom CSS</h2>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              Override anything. Change colors, fonts, backgrounds — make it truly yours.
            </p>
            <div className={styles.field}>
              <textarea
                value={form.customCSS}
                onChange={set('customCSS')}
                rows={10}
                placeholder={`/* Example */\nbody { background: #ff00ff !important; }\n.card { border-color: lime !important; }`}
                className={styles.codeArea}
                maxLength={10000}
              />
            </div>
          </section>

          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(`/u/${user?.username}`)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {updateProfile.isError && (
            <p className="text-error">Failed to save. Please try again.</p>
          )}
        </form>
      </div>
    </div>
  );
}
