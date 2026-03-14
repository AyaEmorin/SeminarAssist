import type { ChannelSummary } from '../lib/types';

export function ChannelSelect({
  channels,
  channelId,
  onChange
}: {
  channels: ChannelSummary[];
  channelId: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field-block">
      <span>ห้องปลายทาง</span>
      <select value={channelId} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- เลือกห้อง --</option>
        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            #{channel.name}
          </option>
        ))}
      </select>
    </label>
  );
}
