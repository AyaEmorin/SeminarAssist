import type { CurrentUserResponse } from '../lib/types';

export function UnauthorizedPage({ user }: { user: CurrentUserResponse | null }) {
  return (
    <div className="center-shell">
      <div className="card login-card">
        <h1>ไม่มีสิทธิ์เข้าใช้งาน</h1>
        <p>
          {user
            ? `บัญชี ${user.username} ล็อกอินสำเร็จแล้ว แต่ยังไม่อยู่ในรายการผู้ใช้หรือบทบาทที่อนุญาต`
            : 'บัญชีนี้ยังไม่มีสิทธิ์เข้าใช้งานระบบ'}
        </p>
        <a className="secondary-button" href="/auth/logout">
          ออกจากระบบ
        </a>
      </div>
    </div>
  );
}
