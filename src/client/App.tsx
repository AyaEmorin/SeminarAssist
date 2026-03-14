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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState('guest');
        return;
      }
      try {
        const data = await apiGet<CurrentUserResponse>('/api/me');
        setMe(data);
        setState(data.authorized ? 'ready' : 'unauthorized');
      } catch {
        setState('guest');
      }
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
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
    return <div className="center-shell">กำลังโหลด...</div>;
  }

  if (state === 'guest') {
    return <LoginPage />;
  }

  if (state === 'unauthorized' || !me) {
    return <UnauthorizedPage user={me} />;
  }

  return <DashboardPage user={me} />;
}
