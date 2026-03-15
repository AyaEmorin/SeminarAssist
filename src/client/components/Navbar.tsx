import type { CurrentUserResponse } from '../lib/types';
import { supabase } from '../lib/supabase';

export function Navbar({ user }: { user: CurrentUserResponse }) {
  async function handleLogout() {
    console.log('[Navbar] Logout clicked');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Navbar] Sign-out error:', error);
      } else {
        console.log('[Navbar] Sign-out success');
      }
    } catch (err) {
      console.error('[Navbar] Sign-out exception:', err);
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="nav-logo">🤖</span>
        <strong>Discord Suite Dashboard</strong>
      </div>
      <div className="nav-user">
        {user.avatarUrl && (
          <img className="nav-avatar" src={user.avatarUrl} alt="" width={32} height={32} />
        )}
        <span className="nav-username">{user.username}</span>
        <button className="logout-btn" onClick={handleLogout} type="button">
          🚪 ออกจากระบบ
        </button>
      </div>
    </nav>
  );
}
