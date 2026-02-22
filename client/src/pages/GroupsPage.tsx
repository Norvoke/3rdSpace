import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import styles from './GroupsPage.module.css';

export default function GroupsPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/api/groups').then(r => r.data),
  });

  const createGroup = useMutation({
    mutationFn: () => api.post('/api/groups', { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setShowCreate(false);
      setName('');
      setDescription('');
    },
  });

  const groups = data?.groups || [];

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Groups</h1>
            <p className={styles.sub}>Find people who share your interests.</p>
          </div>
          {isAuthenticated && (
            <button className="btn btn-primary" onClick={() => setShowCreate(v => !v)}>
              {showCreate ? 'Cancel' : 'Create a group'}
            </button>
          )}
        </div>

        {showCreate && (
          <div className={`card ${styles.createForm}`}>
            <h2 className={styles.formTitle}>New group</h2>
            <div className={styles.field}>
              <label>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cyclists in Edinburgh" maxLength={80} />
            </div>
            <div className={styles.field}>
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={500} placeholder="What's this group about?" />
            </div>
            <div className={styles.formActions}>
              <button
                className="btn btn-primary"
                onClick={() => createGroup.mutate()}
                disabled={!name.trim() || createGroup.isPending}
              >
                {createGroup.isPending ? 'Creating...' : 'Create group'}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className={styles.empty}>Loading groups...</p>
        ) : groups.length === 0 ? (
          <p className={styles.empty}>No groups yet. Be the first to create one.</p>
        ) : (
          <div className={styles.grid}>
            {groups.map((g: any) => (
              <Link key={g._id} to={`/groups/${g.slug}`} className={`card ${styles.groupCard}`}>
                <h3 className={styles.groupName}>{g.name}</h3>
                {g.description && <p className={styles.groupDesc}>{g.description}</p>}
                <div className={styles.groupMeta}>
                  <span>{g.members?.length || 0} {g.members?.length === 1 ? 'member' : 'members'}</span>
                  <span>by {g.owner?.displayName}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
