import type { CurrentUserResponse } from '../lib/types';

export function Navbar({ user }: { user: CurrentUserResponse }) {
  return (
    <div className="navbar">
      <div>
        <strong>Discord Suite Dashboard</strong>
      </div>
      <div className="nav-user">
        <span>{user.username}</span>
        <a href="/auth/logout">Logout</a>
      </div>
    </div>
  );
}
