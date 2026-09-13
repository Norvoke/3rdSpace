import { useRef, useState } from 'react';
import ImageInput, { type ImageInputHandle } from '../ImageInput';
import styles from './PostComposer.module.css';

interface Props {
  onSubmit: (content: string, imageUrl?: string) => void;
  isSubmitting: boolean;
  user: any;
  placeholder?: string;
}

export default function PostComposer({ onSubmit, isSubmitting, user, placeholder }: Props) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const imageInputRef = useRef<ImageInputHandle>(null);
  const MAX = 5000;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) imageInputRef.current?.receiveFile(file);
  };

  const canPost = (content.trim() || imageUrl) && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPost) return;
    onSubmit(content.trim(), imageUrl || undefined);
    setContent('');
    setImageUrl('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`card ${styles.composer} ${dragActive ? styles.dragActive : ''}`}
      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
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
      <ImageInput ref={imageInputRef} value={imageUrl} onChange={setImageUrl} />
      <div className={styles.bottom}>
        <span className={`text-muted ${content.length > MAX * 0.9 ? styles.warn : ''}`}>
          {content.length} / {MAX}
        </span>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={!canPost}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
