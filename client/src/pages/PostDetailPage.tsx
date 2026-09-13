import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import PostCard from '../components/feed/PostCard';
import styles from './PostDetailPage.module.css';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const [searchParams] = useSearchParams();
  const highlightCommentId = searchParams.get('comment') || undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => api.get(`/api/posts/${postId}`).then(r => r.data),
    enabled: !!postId,
  });

  if (isLoading) {
    return <div className="container"><div className={styles.status}>Loading post...</div></div>;
  }

  if (error || !data?.post) {
    return (
      <div className="container">
        <div className={styles.status}>
          This post isn't available — it may have been deleted, or it's private.
          <div style={{ marginTop: '0.75rem' }}>
            <Link to="/feed" className="btn btn-ghost btn-sm">Back to feed</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.wrap}>
        <PostCard post={data.post} highlightCommentId={highlightCommentId} />
      </div>
    </div>
  );
}
