import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import PostCard from '../components/feed/PostCard';
import styles from './WallPage.module.css';

export default function WallPage() {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['public-wall'],
    queryFn: () => api.get('/api/wall').then(r => r.data),
    refetchInterval: 60000,
  });

  const post = useMutation({
    mutationFn: () => api.post('/api/wall', { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-wall'] });
      setContent('');
    },
  });

  const posts = data?.posts || [];

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>The Wall</h1>
          <p className={styles.sub}>
            Everyone on 3rdSpace can post here. Chronological. No curation.
          </p>
        </div>

        {isAuthenticated && user && (
          <div className={`card ${styles.composer}`}>
            <div className={styles.composerTop}>
              <img
                src={user.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${user.username}`}
                alt={user.displayName}
                className={styles.avatar}
              />
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Say something to everyone..."
                rows={3}
                maxLength={5000}
              />
            </div>
            <div className={styles.composerFooter}>
              <span className="text-muted">{content.length} / 5000</span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => post.mutate()}
                disabled={!content.trim() || post.isPending}
              >
                Post to wall
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className={styles.empty}>Loading...</p>
        ) : posts.length === 0 ? (
          <p className={styles.empty}>Nothing here yet. Be the first to post.</p>
        ) : (
          <div className={styles.feed}>
            {posts.map((p: any) => <PostCard key={p._id} post={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
