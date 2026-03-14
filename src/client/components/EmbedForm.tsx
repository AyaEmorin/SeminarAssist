import { useMemo, useState } from 'react';
import type { ChannelSummary, EmbedPayload } from '../lib/types';
import { ChannelSelect } from './ChannelSelect';
import { EmbedPreview } from './EmbedPreview';

const defaultState: EmbedPayload = {
  channelId: '',
  title: '',
  description: '',
  color: '#5865F2',
  imageUrl: '',
  thumbnailUrl: '',
  footer: ''
};

export function EmbedForm({
  channels,
  onSubmit
}: {
  channels: ChannelSummary[];
  onSubmit: (payload: EmbedPayload) => Promise<void>;
}) {
  const [payload, setPayload] = useState<EmbedPayload>(defaultState);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string>('');

  const canSubmit = useMemo(() => {
    return payload.channelId && payload.title.trim() && payload.description.trim();
  }, [payload]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSending(true);
    setStatus('กำลังส่งประกาศ...');

    try {
      await onSubmit(payload);
      setStatus('ส่งประกาศเรียบร้อยแล้ว');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'ส่งประกาศไม่สำเร็จ');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid-two">
      <form className="card" onSubmit={handleSubmit}>
        <h2>ส่งประกาศแบบ Embed</h2>

        <ChannelSelect
          channels={channels}
          channelId={payload.channelId}
          onChange={(channelId) => setPayload((prev) => ({ ...prev, channelId }))}
        />

        <label className="field-block">
          <span>หัวข้อ</span>
          <input
            value={payload.title}
            onChange={(e) => setPayload((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="เช่น ประกาศแจ้งงดเรียน"
          />
        </label>

        <label className="field-block">
          <span>รายละเอียด</span>
          <textarea
            rows={8}
            value={payload.description}
            onChange={(e) => setPayload((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="พิมพ์ข้อความประกาศที่นี่"
          />
        </label>

        <label className="field-block">
          <span>สี Embed</span>
          <input
            type="color"
            value={payload.color}
            onChange={(e) => setPayload((prev) => ({ ...prev, color: e.target.value }))}
          />
        </label>

        <label className="field-block">
          <span>Banner / GIF URL</span>
          <input
            value={payload.imageUrl}
            onChange={(e) => setPayload((prev) => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="https://.../banner.gif"
          />
        </label>

        <label className="field-block">
          <span>Thumbnail URL</span>
          <input
            value={payload.thumbnailUrl}
            onChange={(e) => setPayload((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
            placeholder="https://.../thumb.png"
          />
        </label>

        <label className="field-block">
          <span>Footer</span>
          <input
            value={payload.footer}
            onChange={(e) => setPayload((prev) => ({ ...prev, footer: e.target.value }))}
            placeholder="เช่น Student Affairs"
          />
        </label>

        <button className="primary-button" type="submit" disabled={!canSubmit || sending}>
          {sending ? 'กำลังส่ง...' : 'ส่งประกาศ'}
        </button>
        {status ? <p className="status-text">{status}</p> : null}
      </form>

      <div className="card">
        <h2>ตัวอย่างก่อนส่ง</h2>
        <EmbedPreview payload={payload} />
      </div>
    </div>
  );
}
