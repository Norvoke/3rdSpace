import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import PostCard from '../components/feed/PostCard';
import PostComposer from '../components/feed/PostComposer';
import styles from './FeedPage.module.css';

export default function FeedPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['feed', page],
    queryFn: () => api.get(`/api/posts/feed?page=${page}`).then(r => r.data),
  });

  const createPost = useMutation({
    mutationFn: (content: string) =>
      api.post('/api/posts', { content, visibility: 'friends' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  return (
    <div className="container">
      <div className={styles.layout}>
        <div className={styles.main}>
          <PostComposer
            onSubmit={content => createPost.mutate(content)}
            isSubmitting={createPost.isPending}
            user={user}
          />

          {isLoading ? (
            <div className={styles.loading}>Loading feed...</div>
          ) : data?.posts?.length === 0 ? (
            <div className={styles.empty}>
              <p>Your feed is empty. Add some friends to see their posts here!</p>
            </div>
          ) : (
            <>
              {data?.posts?.map((post: any) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={() => queryClient.invalidateQueries({ queryKey: ['feed'] })}
                />
              ))}

              {data?.totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Older
                  </button>
                  <span className="text-muted">{page} / {data.totalPages}</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= data.totalPages}
                  >
                    Newer →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className="card">
            <h3 className={styles.sidebarTitle}>Your Profile</h3>
            {user && (
              <a href={`/u/${user.username}`} className={styles.sidebarUser}>
                <img
                  src={user.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${user.username}`}
                  alt={user.displayName}
                  className={styles.sidebarAvatar}
                />
                <div>
                  <div className={styles.sidebarName}>{user.displayName}</div>
                  <div className="text-muted">@{user.username}</div>
                </div>
              </a>
            )}
            <a href="/edit-profile" className={`btn btn-ghost btn-sm ${styles.editBtn}`}>
              Edit Profile
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
