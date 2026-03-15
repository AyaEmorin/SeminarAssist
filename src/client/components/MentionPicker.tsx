import { useState, useRef, useEffect } from 'react';
import type { GuildMember, GuildRole } from '../lib/types';

type MentionPickerProps = {
  members: GuildMember[];
  roles: GuildRole[];
  onSelect: (mention: string) => void;
};

export function MentionPicker({ members, roles, onSelect }: MentionPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'members' | 'roles'>('members');
  const [search, setSearch] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      m.displayName.toLowerCase().includes(search.toLowerCase()) ||
      m.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(mention: string) {
    console.log('[MentionPicker] Selected:', mention);
    onSelect(mention);
    setOpen(false);
    setSearch('');
  }

  return (
    <div className="mention-picker-wrapper" ref={panelRef}>
      <button
        type="button"
        className="mention-trigger-btn"
        onClick={() => setOpen(!open)}
        title="เพิ่ม Mention (@ผู้ใช้ / @ยศ)"
      >
        <span>@</span>
      </button>

      {open && (
        <div className="mention-panel">
          <div className="mention-tabs">
            <button
              type="button"
              className={`mention-tab ${tab === 'members' ? 'active' : ''}`}
              onClick={() => setTab('members')}
            >
              👤 สมาชิก
            </button>
            <button
              type="button"
              className={`mention-tab ${tab === 'roles' ? 'active' : ''}`}
              onClick={() => setTab('roles')}
            >
              🎭 ยศ / Role
            </button>
          </div>

          <input
            className="mention-search"
            placeholder={tab === 'members' ? 'ค้นหาสมาชิก...' : 'ค้นหายศ...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          <div className="mention-list">
            {tab === 'roles' && (
              <>
                <button
                  type="button"
                  className="mention-item mention-item-special"
                  onClick={() => handleSelect('@everyone')}
                >
                  <span className="mention-pill everyone">@everyone</span>
                  <span className="mention-hint">ทุกคนในเซิร์ฟเวอร์</span>
                </button>
                <button
                  type="button"
                  className="mention-item mention-item-special"
                  onClick={() => handleSelect('@here')}
                >
                  <span className="mention-pill here">@here</span>
                  <span className="mention-hint">ทุกคนที่ออนไลน์</span>
                </button>
              </>
            )}

            {tab === 'members' &&
              filteredMembers.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  className="mention-item"
                  onClick={() => handleSelect(`<@${m.id}>`)}
                >
                  <img
                    className="mention-avatar"
                    src={m.avatarUrl}
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span className="mention-name">{m.displayName}</span>
                  <span className="mention-hint">@{m.username}</span>
                  {m.bot && <span className="mention-bot-badge">BOT</span>}
                </button>
              ))}

            {tab === 'roles' &&
              filteredRoles.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  className="mention-item"
                  onClick={() => handleSelect(`<@&${r.id}>`)}
                >
                  <span
                    className="mention-role-dot"
                    style={{ background: r.color === '#000000' ? '#99aab5' : r.color }}
                  />
                  <span className="mention-name">{r.name}</span>
                </button>
              ))}

            {tab === 'members' && filteredMembers.length === 0 && (
              <div className="mention-empty">ไม่พบสมาชิก</div>
            )}
            {tab === 'roles' && filteredRoles.length === 0 && search && (
              <div className="mention-empty">ไม่พบยศ</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
