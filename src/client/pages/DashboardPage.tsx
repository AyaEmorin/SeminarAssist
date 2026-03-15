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
        console.log('[Dashboard] Fetching channels...');
        const data = await apiGet<ChannelSummary[]>('/api/channels');
        setChannels(data);
        console.log(`[Dashboard] Loaded ${data.length} channels`);
      } catch (err) {
        console.error('[Dashboard] Failed to load channels:', err);
      } finally {
        setLoadingChannels(false);
      }
    })();
  }, []);

  async function handleSubmit(payload: EmbedPayload) {
    console.log('[Dashboard] Sending announcement:', payload);
    await apiPost('/api/announcements/send', payload);
  }

  return (
    <div className="app-shell">
      <Navbar user={user} />
      <div className="page-shell">
        <div className="card info-card">
          <h1>📢 ระบบประกาศ</h1>
          <p>ส่งประกาศแบบ Embed ไปยังห้องในเซิร์ฟเวอร์ Discord ได้ที่นี่ รองรับ @mention ผู้ใช้และยศ</p>
        </div>

        {loadingChannels ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--dc-text-muted)' }}>กำลังดึงรายชื่อห้อง...</p>
          </div>
        ) : (
          <EmbedForm channels={channels} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}
