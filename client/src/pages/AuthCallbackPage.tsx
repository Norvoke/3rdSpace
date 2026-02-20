import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { setToken, fetchMe } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setToken(token);
      fetchMe().then(() => {
        navigate('/feed', { replace: true });
      });
    } else {
      navigate('/login?error=no_token', { replace: true });
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--accent-hot)' }}>
        Signing you in...
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>just a moment</div>
    </div>
  );
}
