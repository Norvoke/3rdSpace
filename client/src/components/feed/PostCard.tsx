import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import styles from './PostCard.module.css';

interface Post {
  _id: string;
  author: { _id: string; username: string; displayName: string; avatar?: string };
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: any[];
  createdAt: string;
}

interface Props {
  post: Post;
  onDelete?: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PostCard({ post, onDelete }: Props) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const liked = user ? post.likes.includes(user._id) : false;

  // Invalidate all post-related queries regardless of which page we're on
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    queryClient.invalidateQueries({ queryKey: ['group'] });
    queryClient.invalidateQueries({ queryKey: ['public-wall'] });
    queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
  };

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/api/posts/${post._id}/like`),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/posts/${post._id}`),
    onSuccess: () => {
      invalidateAll();
      onDelete?.();
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      api.post(`/api/posts/${post._id}/comments`, { content }),
    onSuccess: () => {
      invalidateAll();
      setCommentText('');
    },
  });

  return (
    <article className={`card ${styles.post} animate-in`}>
      <header className={styles.header}>
        <Link to={`/u/${post.author.username}`} className={styles.authorLink}>
          <img
            src={post.author.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${post.author.username}`}
            alt={post.author.displayName}
            className={styles.avatar}
          />
          <div>
            <span className={styles.displayName}>{post.author.displayName}</span>
            <span className={styles.username}>@{post.author.username}</span>
          </div>
        </Link>
        <div className={styles.meta}>
          <time className="text-muted" title={new Date(post.createdAt).toLocaleString()}>
            {timeAgo(post.createdAt)}
          </time>
          {user && user._id === post.author._id && (
            <button
              className={`btn btn-ghost btn-sm ${styles.deleteBtn}`}
              onClick={() => deleteMutation.mutate()}
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <div className={styles.content}>
        <p>{post.content}</p>
        {post.imageUrl && (
          <img src={post.imageUrl} alt="" className={styles.postImage} />
        )}
      </div>

      <footer className={styles.footer}>
        <button
          className={`btn btn-ghost btn-sm ${liked ? styles.liked : ''}`}
          onClick={() => user && likeMutation.mutate()}
          disabled={!user || likeMutation.isPending}
        >
          ♥ {post.likes.length}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowComments(v => !v)}
        >
          💬 {post.comments.length}
        </button>
      </footer>

      {showComments && (
        <div className={styles.comments}>
          {post.comments.map((c: any) => (
            <div key={c._id} className={styles.comment}>
              <img
                src={c.author.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${c.author.username}`}
                className={styles.commentAvatar}
                alt={c.author.displayName}
              />
              <div className={styles.commentBody}>
                <span className={styles.commentAuthor}>{c.author.displayName}</span>
                <span className={styles.commentText}>{c.content}</span>
              </div>
            </div>
          ))}
          {user && (
            <div className={styles.commentComposer}>
              <input
                placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    commentMutation.mutate(commentText.trim());
                  }
                }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => commentText.trim() && commentMutation.mutate(commentText.trim())}
                disabled={!commentText.trim() || commentMutation.isPending}
              >
                Post
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
