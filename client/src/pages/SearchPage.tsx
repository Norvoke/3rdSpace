import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import styles from './SearchPage.module.css';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['search', submitted],
    queryFn: () => api.get(`/api/users/search?q=${encodeURIComponent(submitted)}`).then(r => r.data),
    enabled: submitted.length >= 2,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(query.trim());
  };

  return (
    <div className="container">
      <div className={styles.page}>
        <h1 className={styles.title}>Find People</h1>

        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, username, or bio..."
            className={styles.searchInput}
            autoFocus
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {isLoading && <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Searching...</p>}

        {data?.users?.length === 0 && submitted && (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
            No users found for "{submitted}".
          </p>
        )}

        <div className={styles.results}>
          {data?.users?.map((u: any) => (
            <Link to={`/u/${u.username}`} key={u._id} className={`card ${styles.result}`}>
              <img
                src={u.avatar || `https://api.dicebear.com/8.x/identicon/svg?seed=${u.username}`}
                className={styles.avatar}
                alt={u.displayName}
              />
              <div className={styles.info}>
                <span className={styles.displayName}>{u.displayName}</span>
                <span className={styles.username}>@{u.username}</span>
                {u.bio && <p className={styles.bio}>{u.bio.slice(0, 100)}{u.bio.length > 100 ? '...' : ''}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
