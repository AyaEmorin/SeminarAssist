import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { EmbedForm } from '../components/EmbedForm';
import { apiGet, apiPost } from '../lib/api';
import type { ChannelSummary, CurrentUserResponse, EmbedPayload } from '../lib/types';

export function DashboardPage({ user }: { user: CurrentUserResponse }) {
  const [channels, setChannels] = useState<ChannelSummary[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiGet<ChannelSummary[]>('/api/channels');
        setChannels(data);
      } finally {
        setLoadingChannels(false);
      }
    })();
  }, []);

  async function handleSubmit(payload: EmbedPayload) {
    await apiPost('/api/announcements/send', payload);
  }

  return (
    <div className="app-shell">
      <Navbar user={user} />
      <div className="page-shell">
        <div className="card info-card">
          <h1>ระบบประกาศ</h1>
          <p>หน้านี้ใช้สำหรับส่งประกาศแบบ Embed ไปยังห้องในเซิร์ฟเวอร์ Discord โดยตรง</p>
        </div>

        {loadingChannels ? (
          <div className="card">กำลังดึงรายชื่อห้อง...</div>
        ) : (
          <EmbedForm channels={channels} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}
