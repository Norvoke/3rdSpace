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

  const allPostQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    queryClient.invalidateQueries({ queryKey: ['group'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['public-wall'] });
    queryClient.invalidateQueries({ queryKey: ['profile'], exact: false });
  };

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/api/posts/${post._id}/like`),
    // Optimistic update — flip the like instantly
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previousData = queryClient.getQueriesData({ queryKey: ['feed'] });
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
      const updateCache = (old: any) => {
        if (!old) return old;
        const updatePost = (p: any) =>
          p._id === post._id
            ? { ...p, comments: [...p.comments, optimisticComment] }
            : p;
        if (old.posts) return { ...old, posts: old.posts.map(updatePost) };
        if (old.profile?.posts) return {
          ...old,
          profile: { ...old.profile, posts: old.profile.posts.map(updatePost) }
        };
        return old;
      };

      queryClient.setQueriesData({ queryKey: ['feed'] }, updateCache);
      queryClient.setQueriesData({ queryKey: ['public-wall'] }, updateCache);
      queryClient.setQueriesData({ queryKey: ['group'], exact: false }, updateCache);
      queryClient.setQueriesData({ queryKey: ['profile'], exact: false }, updateCache);
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
