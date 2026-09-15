import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import PostCard from '../components/feed/PostCard';
import PostComposer from '../components/feed/PostComposer';
import styles from './GroupPage.module.css';

export default function GroupPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['group', slug],
    queryFn: () => api.get(`/api/groups/${slug}`).then(r => r.data),
  });

  const join = useMutation({
    mutationFn: () => api.post(`/api/groups/${slug}/join`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group', slug] }),
  });

  const leave = useMutation({
    mutationFn: () => api.post(`/api/groups/${slug}/leave`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group', slug] }),
  });

  const deleteGroup = useMutation({
    mutationFn: () => api.delete(`/api/groups/${slug}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      navigate('/groups');
    },
  });

  const postToGroup = useMutation({
    mutationFn: ({ content, imageUrl }: { content: string; imageUrl?: string }) =>
      api.post('/api/posts', {
        content,
        imageUrl,
        group: data?.group?._id,
        visibility: 'public',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', slug] });
    },
  });

  if (isLoading) return (
    <div className="container">
      <p className={styles.loading}>Loading...</p>
    </div>
  );

  if (isError || !data) return (
    <div className="container">
      <p className={styles.loading}>Group not found.</p>
    </div>
  );

  const { group, posts } = data;

  const isMember = isAuthenticated && user &&
    group.members?.some((m: any) => (m._id || m) === user._id);
  const isOwner = isAuthenticated && user &&
    (group.owner?._id || group.owner) === user._id;
  const canDelete = isOwner || (isAuthenticated && user?.username === 'finnellingwood');

  return (
    <div className="container">
      <div className={styles.page}>

        {/* Group header */}
        <div className={`card ${styles.groupHeader}`}>
          <div className={styles.groupInfo}>
            <h1 className={styles.title}>{group.name}</h1>
            {group.description && (
              <p className={styles.desc}>{group.description}</p>
            )}
            <p className={styles.meta}>
              {group.members?.length || 0} {group.members?.length === 1 ? 'member' : 'members'}
              {' · '}started by{' '}
              <Link to={`/u/${group.owner?.username}`} className={styles.ownerLink}>
                {group.owner?.displayName}
              </Link>
            </p>
          </div>
          <div className={styles.groupActions}>
            {isAuthenticated && !isOwner && (
              isMember ? (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => leave.mutate()}
                  disabled={leave.isPending}
                >
                  Leave group
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => join.mutate()}
                  disabled={join.isPending}
                >
                  Join group
                </button>
              )
            )}
            {!isAuthenticated && (
              <Link to="/login" className="btn btn-primary btn-sm">
                Sign in to join
              </Link>
            )}
            {canDelete && (
              <button
                className={`btn btn-ghost btn-sm ${styles.deleteGroupBtn}`}
                onClick={() => {
                  if (window.confirm('Delete this group and all its posts? This cannot be undone.')) {
                    deleteGroup.mutate();
                  }
                }}
                disabled={deleteGroup.isPending}
              >
                Delete group
              </button>
            )}
          </div>
        </div>

        <div className={styles.layout}>
          {/* Main wall */}
          <div className={styles.feed}>

            {/* Composer — any logged-in member can post */}
            {isAuthenticated && isMember && (
              <PostComposer
                onSubmit={(content, imageUrl) => postToGroup.mutate({ content, imageUrl })}
                isSubmitting={postToGroup.isPending}
                user={user}
                placeholder={`Post to ${group.name}...`}
              />
            )}

            {!isAuthenticated && (
              <div className={`card ${styles.joinPrompt}`}>
                <p><Link to="/login">Sign in</Link> to post in this group.</p>
              </div>
            )}

            {isAuthenticated && !isMember && (
              <div className={`card ${styles.joinPrompt}`}>
                <p>Join this group to start posting.</p>
              </div>
            )}

            {posts.length === 0 ? (
              <p className={styles.empty}>No posts yet. Be the first.</p>
            ) : (
              posts.map((p: any) => <PostCard key={p._id} post={p} />)
            )}
          </div>

          {/* Sidebar — members */}
          <aside className={styles.sidebar}>
            <div className="card">
              <h3 className={styles.sidebarTitle}>Members</h3>
              <div className={styles.memberList}>
                {group.members?.slice(0, 16).map((m: any) => (
                  <Link
                    key={m._id || m}
                    to={`/u/${m.username}`}
                    className={styles.member}
                    title={m.displayName}
                  >
                    <img
                      src={m.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${m.username}`}
                      alt={m.displayName}
                      className={styles.memberAvatar}
                    />
                  </Link>
                ))}
              </div>
              {group.members?.length > 16 && (
                <p className={styles.moreMembers}>
                  +{group.members.length - 16} more members
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
