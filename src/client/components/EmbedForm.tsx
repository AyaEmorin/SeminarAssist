import { useEffect, useMemo, useState } from 'react';
import type { ChannelSummary, EmbedPayload, GuildMember, GuildRole } from '../lib/types';
import { apiGet } from '../lib/api';
import { ChannelSelect } from './ChannelSelect';
import { EmbedPreview } from './EmbedPreview';
import { MentionPicker } from './MentionPicker';
import { TemplateBar } from './TemplateBar';

const defaultState: EmbedPayload = {
  channelId: '',
  content: '',
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
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [roles, setRoles] = useState<GuildRole[]>([]);

  useEffect(() => {
    void (async () => {
      console.log('[EmbedForm] Fetching members and roles...');
      try {
        const m = await apiGet<GuildMember[]>('/api/members');
        setMembers(m);
        console.log(`[EmbedForm] Loaded ${m.length} members`);
      } catch (err) {
        console.error('[EmbedForm] Failed to load members:', err);
      }
      try {
        const r = await apiGet<GuildRole[]>('/api/roles');
        setRoles(r);
        console.log(`[EmbedForm] Loaded ${r.length} roles`);
      } catch (err) {
        console.error('[EmbedForm] Failed to load roles:', err);
      }
    })();
  }, []);

  const canSubmit = useMemo(() => {
    return payload.channelId && payload.title.trim() && payload.description.trim();
  }, [payload]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    console.log('[EmbedForm] Submitting payload:', payload);
    setSending(true);
    setStatus({ type: 'info', text: 'กำลังส่งประกาศ...' });

    try {
      await onSubmit(payload);
      setStatus({ type: 'success', text: '✅ ส่งประกาศเรียบร้อยแล้ว' });
      console.log('[EmbedForm] Sent successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'ส่งประกาศไม่สำเร็จ';
      setStatus({ type: 'error', text: `❌ ${msg}` });
      console.error('[EmbedForm] Send failed:', error);
    } finally {
      setSending(false);
    }
  }

  function insertMention(mention: string) {
    setPayload((prev) => ({
      ...prev,
      content: (prev.content ?? '') + (prev.content ? ' ' : '') + mention
    }));
  }

  function loadTemplate(templatePayload: EmbedPayload) {
    console.log('[EmbedForm] Loading template:', templatePayload);
    setPayload((prev) => ({
      ...templatePayload,
      channelId: prev.channelId
    }));
  }

  return (
    <div className="grid-two">
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>📝 ส่งประกาศแบบ Embed</h2>

        <TemplateBar currentPayload={payload} onLoadTemplate={loadTemplate} />

        <ChannelSelect
          channels={channels}
          channelId={payload.channelId}
          onChange={(channelId) => setPayload((prev) => ({ ...prev, channelId }))}
        />

        <label className="field-block">
          <span>หัวข้อ <small className="required">*</small></span>
          <input
            value={payload.title}
            onChange={(e) => setPayload((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="เช่น ประกาศแจ้งงดเรียน"
          />
        </label>

        <label className="field-block">
          <span>รายละเอียด <small className="required">*</small></span>
          <textarea
            rows={6}
            value={payload.description}
            onChange={(e) => setPayload((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="พิมพ์ข้อความประกาศที่นี่"
          />
        </label>

        <label className="field-block">
          <span>สี Embed</span>
          <div className="color-input-row">
            <input
              type="color"
              value={payload.color}
              onChange={(e) => setPayload((prev) => ({ ...prev, color: e.target.value }))}
            />
            <span className="color-hex">{payload.color}</span>
          </div>
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

        {/* Content / Mention field — ล่างสุด */}
        <div className="field-block">
          <div className="field-label-row">
            <span>Mention ผู้ใช้ / ยศ <small>(ไม่บังคับ)</small></span>
            <MentionPicker members={members} roles={roles} onSelect={insertMention} />
          </div>
          <textarea
            rows={2}
            value={payload.content ?? ''}
            onChange={(e) => setPayload((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="เช่น @everyone ดูประกาศด้านล่างนะครับ"
          />
        </div>

        <button className="primary-button submit-btn" type="submit" disabled={!canSubmit || sending}>
          {sending ? (
            <>
              <span className="spinner" /> กำลังส่ง...
            </>
          ) : (
            '📤 ส่งประกาศ'
          )}
        </button>

        {status && (
          <div className={`status-toast status-${status.type}`}>
            {status.text}
          </div>
        )}
      </form>

      <div className="card preview-card">
        <h2>👁️ ตัวอย่างก่อนส่ง</h2>
        <EmbedPreview payload={payload} members={members} roles={roles} />
      </div>
    </div>
  );
}
