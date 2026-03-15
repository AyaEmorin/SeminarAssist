import { useEffect, useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { apiGet } from './lib/api';
import type { CurrentUserResponse } from './lib/types';
import { supabase } from './lib/supabase';

export function App() {
  const [state, setState] = useState<'loading' | 'guest' | 'unauthorized' | 'ready'>('loading');
  const [me, setMe] = useState<CurrentUserResponse | null>(null);

  useEffect(() => {
    void (async () => {
      console.log('[App] Checking auth session...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('[App] No session found → guest');
        setState('guest');
        return;
      }
      console.log('[App] Session found, fetching /api/me...');
      try {
        const data = await apiGet<CurrentUserResponse>('/api/me');
        console.log('[App] User data:', data);
        setMe(data);
        setState(data.authorized ? 'ready' : 'unauthorized');
        console.log('[App] State →', data.authorized ? 'ready' : 'unauthorized');
      } catch (err) {
        console.error('[App] /api/me failed:', err);
        setState('guest');
      }
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      console.log('[App] Auth state changed:', event);
      if (event === 'SIGNED_OUT') {
        setState('guest');
        setMe(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (state === 'loading') {
    return (
      <div className="center-shell">
        <div className="card login-card">
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--dc-text-muted)' }}>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (state === 'guest') {
    return <LoginPage />;
  }

  if (state === 'unauthorized' || !me) {
    return <UnauthorizedPage user={me} />;
  }

  return <DashboardPage user={me} />;
}
