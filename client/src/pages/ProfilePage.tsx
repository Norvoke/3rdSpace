import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import PostCard from '../components/feed/PostCard';
import PostComposer from '../components/feed/PostComposer';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: me } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.get(`/api/users/${username}`).then(r => r.data),
    enabled: !!username,
  });

  const friendRequest = useMutation({
    mutationFn: (userId: string) => api.post(`/api/friends/request/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', username] }),
  });

  const acceptFriend = useMutation({
    mutationFn: (userId: string) => api.post(`/api/friends/accept/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', username] }),
  });

  const wallPost = useMutation({
    mutationFn: (content: string) =>
      api.post('/api/posts', {
        content,
        targetProfile: data?.user?._id,
        visibility: 'public',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', username] }),
  });

  if (isLoading) return <div className={styles.loading}>Loading profile...</div>;
  if (error || !data) return <div className={styles.loading}>Profile not found.</div>;

  const { user, wallPosts, isOwner, isFriend } = data;

  if (user.isPrivate && !isOwner && !isFriend) {
    return (
      <div className="container">
        <div className={styles.private}>
          <img
            src={user.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${user.username}`}
            className={styles.privateAvatar}
            alt={user.displayName}
          />
          <h2>{user.displayName}</h2>
          <p className="text-muted">This profile is private.</p>
        </div>
      </div>
    );
  }

  const hasPendingRequest = me && user.friendRequests?.includes(me._id);
  const pendingFromThem = me && me.friendRequests?.includes(user._id);

  return (
    <div className={styles.page}>
      {/* Custom CSS injected per-profile — the MySpace magic */}
      {user.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: user.customCSS }} />
      )}

      {/* Banner */}
      <div
        className={styles.banner}
        style={user.headerImage ? { backgroundImage: `url(${user.headerImage})` } : {}}
      />

      <div className="container">
        <div className={styles.layout}>
          {/* Left: Profile info */}
          <aside className={styles.sidebar}>
            <div className={`card ${styles.profileCard}`}>
              <img
                src={user.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${user.username}`}
                className={styles.avatar}
                alt={user.displayName}
              />
              <h1 className={styles.displayName}>{user.displayName}</h1>
              <div className={styles.username}>@{user.username}</div>
              {user.mood && (
                <div className={styles.mood}>😶 feeling: {user.mood}</div>
              )}
              {user.bio && <p className={styles.bio}>{user.bio}</p>}

              <div className={styles.profileMeta}>
                {user.location && <div className={styles.metaItem}>📍 {user.location}</div>}
                {user.website && (
                  <div className={styles.metaItem}>
                    🔗 <a href={user.website} target="_blank" rel="noopener noreferrer">{user.website}</a>
                  </div>
                )}
              </div>

              <div className={styles.friendCount}>
                <span>{user.friends?.length || 0} friends</span>
              </div>

              {!isOwner && me && (
                <div className={styles.actions}>
                  {isFriend ? (
                    <span className={styles.friendBadge}>✓ Friends</span>
                  ) : pendingFromThem ? (
                    <button
                      className="btn btn-warm btn-sm"
                      onClick={() => acceptFriend.mutate(user._id)}
                    >
                      Accept Friend Request
                    </button>
                  ) : hasPendingRequest ? (
                    <span className={styles.pending}>Request Sent</span>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => friendRequest.mutate(user._id)}
                    >
                      + Add Friend
                    </button>
                  )}
                </div>
              )}

              {isOwner && (
                <a href="/edit-profile" className="btn btn-ghost btn-sm" style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}>
                  Edit Profile
                </a>
              )}
            </div>

            {/* Friends list */}
            {user.friends?.length > 0 && (
              <div className={`card ${styles.friendsCard}`}>
                <h3 className={styles.sectionTitle}>Friends</h3>
                <div className={styles.friendsGrid}>
                  {user.friends.slice(0, 9).map((f: any) => (
                    <a key={f._id} href={`/u/${f.username}`} title={f.displayName}>
                      <img
                        src={f.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${f.username}`}
                        className={styles.friendThumb}
                        alt={f.displayName}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Right: Wall */}
          <main className={styles.wall}>
            {user.customHTML && (
              <div
                className={`card ${styles.aboutMe}`}
                dangerouslySetInnerHTML={{ __html: user.customHTML }}
              />
            )}

            {user.song && (
              <div className={`card ${styles.songCard}`}>
                <h3 className={styles.sectionTitle}>🎵 Profile Song</h3>
                <iframe
                  src={user.song}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay"
                  title="Profile song"
                />
              </div>
            )}

            {(me && (isFriend || isOwner)) && (
              <PostComposer
                onSubmit={content => wallPost.mutate(content)}
                isSubmitting={wallPost.isPending}
                user={me}
                placeholder={isOwner ? "Post to your wall..." : `Write on ${user.displayName}'s wall...`}
              />
            )}

            <h3 className={styles.sectionTitle}>Wall</h3>
            {wallPosts?.length === 0 ? (
              <p className="text-muted" style={{ padding: '1rem 0' }}>No wall posts yet.</p>
            ) : (
              wallPosts?.map((post: any) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={() => queryClient.invalidateQueries({ queryKey: ['profile', username] })}
                />
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
