import { supabase } from '../lib/supabase';

export function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord'
    });
  };

  return (
    <div className="center-shell">
      <div className="card login-card">
        <h1>Discord Suite Dashboard</h1>
        <p>ล็อกอินด้วย Discord เพื่อเข้าใช้งานระบบประกาศแบบ Embed</p>
        <button className="primary-button" onClick={handleLogin}>
          Login with Discord
        </button>
      </div>
    </div>
  );
}
