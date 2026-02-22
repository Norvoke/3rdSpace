import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import styles from './NotificationBell.module.css';

interface Notification {
  _id: string;
  type: 'friend_request' | 'friend_accepted' | 'wall_post' | 'comment' | 'reply';
  sender: { username: string; displayName: string; avatar?: string };
  post?: { _id: string };
  read: boolean;
  createdAt: string;
}

function notificationText(n: Notification): string {
  switch (n.type) {
    case 'friend_request':  return `${n.sender.displayName} sent you a friend request`;
    case 'friend_accepted': return `${n.sender.displayName} accepted your friend request`;
    case 'wall_post':       return `${n.sender.displayName} posted on your wall`;
    case 'comment':         return `${n.sender.displayName} commented on your post`;
    case 'reply':           return `${n.sender.displayName} replied to a post you're in`;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/api/notifications').then(r => r.data),
    refetchInterval: 30000,
  });

  const markAllRead = useMutation({
    mutationFn: () => api.put('/api/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = data?.unreadCount || 0;
  const notifications: Notification[] = data?.notifications || [];

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open && unread > 0) markAllRead.mutate();
  };

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.bell} onClick={handleOpen} title="Notifications">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span className={styles.title}>Notifications</span>
            {notifications.length > 0 && (
              <button className={styles.clearBtn} onClick={() => markAllRead.mutate()}>Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className={styles.empty}>Nothing yet — go make some friends!</div>
          ) : (
            <div className={styles.list}>
              {notifications.map(n => (
                <Link
                  key={n._id}
                  to={`/u/${n.sender.username}`}
                  className={`${styles.item} ${!n.read ? styles.unread : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <img
                    src={n.sender.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${n.sender.username}`}
                    className={styles.avatar}
                    alt={n.sender.displayName}
                  />
                  <div className={styles.itemBody}>
                    <span className={styles.itemText}>{notificationText(n)}</span>
                    <span className={styles.itemTime}>{timeAgo(n.createdAt)}</span>
                  </div>
                  {!n.read && <span className={styles.dot} />}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
