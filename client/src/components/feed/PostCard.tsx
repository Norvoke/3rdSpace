import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import styles from './PostCard.module.css';

interface Post {
  _id: string;
  author: { _id: string; username: string; displayName: string; avatar?: string };
  targetProfile?: string;
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: any[];
  createdAt: string;
}

interface Props {
  post: Post;
  onDelete?: () => void;
  highlightCommentId?: string;
}

// Applies `updatePost` to the matching post inside whichever shape a cached
// query holds it in — a list (feed/wall/group) or a single post (profile
// wall / post detail) — used by both the like and comment optimistic updates.
function updatePostInCache(postId: string, updatePost: (p: any) => any) {
  return (old: any) => {
    if (!old) return old;
    const apply = (p: any) => (p._id === postId ? updatePost(p) : p);
    if (old.posts) return { ...old, posts: old.posts.map(apply) };
    if (old.profile?.posts) return { ...old, profile: { ...old.profile, posts: old.profile.posts.map(apply) } };
    if (old.post) return { ...old, post: apply(old.post) };
    return old;
  };
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

export default function PostCard({ post, onDelete, highlightCommentId }: Props) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(!!highlightCommentId);
  const [commentText, setCommentText] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [lightboxOpen]);

  useEffect(() => {
    if (highlightCommentId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightCommentId]);

  const liked = user ? post.likes.includes(user._id) : false;

  const allPostQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    queryClient.invalidateQueries({ queryKey: ['group'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['public-wall'] });
    queryClient.invalidateQueries({ queryKey: ['profile'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['post', post._id] });
  };

  const postQueryKeys = [['feed'], ['group'], ['public-wall'], ['profile'], ['post', post._id]] as const;

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/api/posts/${post._id}/like`),
    // Optimistic update — flip the like instantly
    onMutate: async () => {
      if (!user) return;
      await Promise.all(postQueryKeys.map(key => queryClient.cancelQueries({ queryKey: key, exact: false })));
      const previousData = postQueryKeys.flatMap(key => queryClient.getQueriesData({ queryKey: key, exact: false }));

      const toggleLike = (p: any) => ({
        ...p,
        likes: liked ? p.likes.filter((id: string) => id !== user._id) : [...p.likes, user._id],
      });
      const updateCache = updatePostInCache(post._id, toggleLike);
      for (const key of postQueryKeys) {
        queryClient.setQueriesData({ queryKey: key, exact: false }, updateCache);
      }

      return { previousData };
    },
    onError: (_err, _vars, context: any) => {
      // Roll back on failure
      context?.previousData?.forEach(([key, data]: any) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: allPostQueries,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/posts/${post._id}`),
    onSuccess: () => {
      allPostQueries();
      onDelete?.();
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      api.post(`/api/posts/${post._id}/comments`, { content }),
    // Optimistic update — show comment immediately
    onMutate: async (content: string) => {
      if (!user) return;
      setCommentText('');
      setShowComments(true);

      // Build a fake comment to show right away
      const optimisticComment = {
        _id: `temp-${Date.now()}`,
        author: {
          _id: user._id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
        },
        content,
        createdAt: new Date().toISOString(),
      };

      // Inject it into all matching cached queries
      const updateCache = updatePostInCache(post._id, (p: any) => ({
        ...p,
        comments: [...p.comments, optimisticComment],
      }));

      for (const key of postQueryKeys) {
        queryClient.setQueriesData({ queryKey: key, exact: false }, updateCache);
      }
    },
    onSettled: allPostQueries,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.delete(`/api/posts/${post._id}/comments/${commentId}`),
    onMutate: async (commentId: string) => {
      await Promise.all(postQueryKeys.map(key => queryClient.cancelQueries({ queryKey: key, exact: false })));
      const previousData = postQueryKeys.flatMap(key => queryClient.getQueriesData({ queryKey: key, exact: false }));

      const updateCache = updatePostInCache(post._id, (p: any) => ({
        ...p,
        comments: p.comments.filter((c: any) => c._id !== commentId),
      }));
      for (const key of postQueryKeys) {
        queryClient.setQueriesData({ queryKey: key, exact: false }, updateCache);
      }

      return { previousData };
    },
    onError: (_err, _vars, context: any) => {
      context?.previousData?.forEach(([key, data]: any) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: allPostQueries,
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
          {user && (user._id === post.author._id || user._id === post.targetProfile) && (
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
        {post.content && <p>{post.content}</p>}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            className={styles.postImage}
            onClick={() => setLightboxOpen(true)}
          />
        )}
      </div>

      {lightboxOpen && post.imageUrl && createPortal(
        <div className={styles.lightboxOverlay} onClick={() => setLightboxOpen(false)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
            aria-label="Close image preview"
          >
            ✕
          </button>
          <img
            src={post.imageUrl}
            alt=""
            className={styles.lightboxImage}
            onClick={e => e.stopPropagation()}
          />
        </div>,
        document.body
      )}

      <footer className={styles.footer}>
        <button
          className={`btn btn-ghost btn-sm ${liked ? styles.liked : ''}`}
          onClick={() => user && likeMutation.mutate()}
          disabled={!user}
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
            <div
              key={c._id}
              ref={c._id === highlightCommentId ? highlightRef : undefined}
              className={`${styles.comment} ${c._id === highlightCommentId ? styles.commentHighlight : ''}`}
            >
              <img
                src={c.author.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${c.author.username}`}
                className={styles.commentAvatar}
                alt={c.author.displayName}
              />
              <div className={styles.commentBody}>
                <span className={styles.commentAuthor}>{c.author.displayName}</span>
                <span className={styles.commentText}>{c.content}</span>
                <time className={styles.commentTime} title={new Date(c.createdAt).toLocaleString()}>
                  {timeAgo(c.createdAt)}
                </time>
              </div>
              {user && (user._id === c.author._id || user.username === 'finnellingwood') && (
                <button
                  className={styles.commentDelete}
                  onClick={() => deleteCommentMutation.mutate(c._id)}
                  aria-label="Delete comment"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {user && (
            <div className={styles.commentComposer}>
              <input
                placeholder="write a comment..."
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
                post
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
