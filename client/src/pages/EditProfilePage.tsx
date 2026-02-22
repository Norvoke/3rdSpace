import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import styles from './EditProfilePage.module.css';

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
    song: '',
    customCSS: '',
    customHTML: '',
    interests: '',
    isPrivate: false,
  });

  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        displayName: user.displayName || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        mood: user.mood || '',
        song: user.song || '',
        customCSS: user.customCSS || '',
        customHTML: user.customHTML || '',
        interests: (user.interests || []).join(', '),
        isPrivate: user.isPrivate || false,
      });
      setAvatarPreview(user.avatar || '');
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
  ) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'avatar') setAvatarPreview(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(form);
  };

  const fallbackAvatar = `https://api.dicebear.com/8.x/identicon/svg?seed=${user?.username}`;

  return (
    <div className="container">
      <div className={styles.page}>
        <h1 className={styles.title}>Edit Profile</h1>

        <form onSubmit={handleSubmit} className={styles.form}>

          <section className={`card ${styles.section}`}>
            <h2 className={styles.sectionTitle}> Profile Photo</h2>
            <div className={styles.avatarRow}>
              <img
                src={avatarPreview || fallbackAvatar}
                alt="Avatar preview"
                className={styles.avatarPreview}
                onError={e => { (e.target as HTMLImageElement).src = fallbackAvatar; }}
              />
              <div className={styles.avatarFields}>
                <div className={styles.field}>
                  <label>Image URL</label>
                  <input
                    value={form.avatar}
                    onChange={set('avatar')}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                </div>
                <p className="text-muted" style={{ marginTop: '0.25rem' }}>
                  Paste any direct image link. Leave blank to use your Google photo.
                </p>
                {form.avatar && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: '0.5rem', width: 'fit-content' }}
                    onClick={() => { setForm(p => ({ ...p, avatar: '' })); setAvatarPreview(''); }}
                  >
                    ✕ Reset to Google photo
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className={`card ${styles.section}`}>
            <h2 className={styles.sectionTitle}>Basics</h2>
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

          <section className={`card ${styles.section}`}>
            <h2 className={styles.sectionTitle}>🎵 Profile Song</h2>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              Paste a SoundCloud or YouTube embed URL to auto-play on your profile.
            </p>
            <div className={styles.field}>
              <label>Song Embed URL</label>
              <input value={form.song} onChange={set('song')} placeholder="https://w.soundcloud.com/player/?url=..." />
            </div>
          </section>

          <section className={`card ${styles.section}`}>
            <h2 className={styles.sectionTitle}>📝 About Me (HTML)</h2>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              Go wild. This renders as HTML on your profile — tables, images, marquees welcome.
            </p>
            <div className={styles.field}>
              <textarea value={form.customHTML} onChange={set('customHTML')} rows={8}
                placeholder="<p>Hi! I'm a <b>cool person</b>.</p>" className={styles.codeArea} maxLength={20000} />
            </div>
          </section>

          <section className={`card ${styles.section}`}>
            <h2 className={styles.sectionTitle}>🎨 Custom CSS</h2>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              Override anything. Change colors, fonts, backgrounds — make it truly yours.
            </p>
            <div className={styles.field}>
              <textarea value={form.customCSS} onChange={set('customCSS')} rows={10}
                placeholder={`/* Example */\nbody { background: #ff00ff !important; }`}
                className={styles.codeArea} maxLength={10000} />
            </div>
          </section>

          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(`/u/${user?.username}`)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {updateProfile.isError && <p className="text-error">Failed to save. Please try again.</p>}
        </form>
      </div>
    </div>
  );
}
