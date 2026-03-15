import { supabase } from '../lib/supabase';

export function LoginPage() {
  const handleLogin = async () => {
    console.log('[LoginPage] Discord login clicked');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord'
      });
      if (error) {
        console.error('[LoginPage] OAuth error:', error);
      }
    } catch (err) {
      console.error('[LoginPage] Login exception:', err);
    }
  };

  return (
    <div className="center-shell">
      <div className="card login-card">
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🤖</div>
        <h1>Discord Suite Dashboard</h1>
        <p>ล็อกอินด้วย Discord เพื่อเข้าใช้งานระบบประกาศแบบ Embed</p>
        <button className="primary-button" onClick={handleLogin}>
          🎮 Login with Discord
        </button>
      </div>
    </div>
  );
}
