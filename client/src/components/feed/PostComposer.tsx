import { useState } from 'react';
import styles from './PostComposer.module.css';

interface Props {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
  user: any;
  placeholder?: string;
}

export default function PostComposer({ onSubmit, isSubmitting, user, placeholder }: Props) {
  const [content, setContent] = useState('');
  const MAX = 5000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    onSubmit(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className={`card ${styles.composer}`}>
      <div className={styles.top}>
        <img
          src={user?.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${user?.username || 'anon'}`}
          alt={user?.displayName}
          className={styles.avatar}
        />
        <textarea
          className={styles.textarea}
          placeholder={placeholder || "What's on your mind?"}
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          maxLength={MAX}
        />
      </div>
      <div className={styles.bottom}>
        <span className={`text-muted ${content.length > MAX * 0.9 ? styles.warn : ''}`}>
          {content.length} / {MAX}
        </span>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
