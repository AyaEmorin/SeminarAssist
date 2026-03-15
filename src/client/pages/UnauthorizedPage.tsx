import type { CurrentUserResponse } from '../lib/types';
import { supabase } from '../lib/supabase';

export function UnauthorizedPage({ user }: { user: CurrentUserResponse | null }) {
  async function handleLogout() {
    console.log('[UnauthorizedPage] Logout clicked');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[UnauthorizedPage] Sign-out error:', error);
      } else {
        console.log('[UnauthorizedPage] Sign-out success');
      }
    } catch (err) {
      console.error('[UnauthorizedPage] Sign-out exception:', err);
    }
  }

  return (
    <div className="center-shell">
      <div className="card login-card">
        <div className="lock-icon">🔒</div>
        <h1>ไม่มีสิทธิ์เข้าใช้งาน</h1>
        <p>
          {user
            ? `บัญชี ${user.username} ล็อกอินสำเร็จแล้ว แต่ยังไม่อยู่ในรายการผู้ใช้หรือบทบาทที่อนุญาต`
            : 'บัญชีนี้ยังไม่มีสิทธิ์เข้าใช้งานระบบ'}
        </p>
        <button className="secondary-button" onClick={handleLogout} type="button">
          🚪 ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
