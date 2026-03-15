import React, { useMemo } from 'react';
import type { EmbedPayload, GuildMember, GuildRole } from '../lib/types';

type EmbedPreviewProps = {
  payload: EmbedPayload;
  members?: GuildMember[];
  roles?: GuildRole[];
};

/** Render mention syntax into Discord-style pills */
function renderMentions(
  text: string,
  members: GuildMember[],
  roles: GuildRole[]
): (string | React.ReactNode)[] {
  const parts: (string | React.ReactNode)[] = [];
  // Match <@id>, <@&id>, @everyone, @here
  const regex = /(<@&?\d+>|@everyone|@here)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token === '@everyone' || token === '@here') {
      parts.push(
        <span key={key++} className="discord-mention mention-everyone">
          {token}
        </span>
      );
    } else if (token.startsWith('<@&')) {
      const roleId = token.slice(3, -1);
      const role = roles.find((r) => r.id === roleId);
      const color = role?.color && role.color !== '#000000' ? role.color : '#99aab5';
      parts.push(
        <span
          key={key++}
          className="discord-mention"
          style={{ color, backgroundColor: `${color}26` }}
        >
          @{role?.name ?? roleId}
        </span>
      );
    } else if (token.startsWith('<@')) {
      const userId = token.slice(2, -1);
      const member = members.find((m) => m.id === userId);
      parts.push(
        <span key={key++} className="discord-mention">
          @{member?.displayName ?? userId}
        </span>
      );
    } else {
      parts.push(token);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function EmbedPreview({ payload, members = [], roles = [] }: EmbedPreviewProps) {
  const color = payload.color || '#5865F2';
  const now = useMemo(() => {
    const d = new Date();
    return `วันนี้ เวลา ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }, []);

  const contentParts = payload.content
    ? renderMentions(payload.content, members, roles)
    : null;

  const hasEmbed = payload.title || payload.description;

  return (
    <div className="discord-message-wrapper">
      {/* Bot info row */}
      <div className="discord-msg-header">
        <div className="discord-bot-avatar">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#5865F2" />
            <path
              d="M19.6 10.4a.6.6 0 0 0-.48-.24 10.1 10.1 0 0 0-2.52-.78.45.45 0 0 0-.48.22c-.12.2-.24.46-.34.66a9.4 9.4 0 0 0-2.76 0 6.3 6.3 0 0 0-.34-.66.45.45 0 0 0-.48-.22 10.1 10.1 0 0 0-2.52.78.4.4 0 0 0-.2.16C8.14 13.24 7.68 15.98 7.9 18.7a.48.48 0 0 0 .18.32 10.14 10.14 0 0 0 3.06 1.54.46.46 0 0 0 .5-.16c.24-.32.44-.66.62-1.02a.44.44 0 0 0-.24-.62c-.34-.12-.66-.28-.96-.44a.44.44 0 0 1-.04-.74c.06-.04.12-.1.18-.14a7.27 7.27 0 0 0 6.2 0c.06.04.12.1.18.14a.44.44 0 0 1-.04.74c-.3.18-.62.32-.96.44a.44.44 0 0 0-.24.62c.18.36.38.7.62 1.02a.46.46 0 0 0 .5.16 10.14 10.14 0 0 0 3.06-1.54.48.48 0 0 0 .18-.32c.26-2.76-.44-5.48-1.84-7.72a.38.38 0 0 0-.16-.16z"
              fill="white"
            />
          </svg>
        </div>
        <div>
          <span className="discord-bot-name">SeminarAssist</span>
          <span className="discord-bot-tag">BOT</span>
          <span className="discord-timestamp">{now}</span>
        </div>
      </div>

      {/* Content (mentions) */}
      {/* Embed card */}
      {hasEmbed && (
        <div className="discord-embed" style={{ borderLeftColor: color }}>
          <div className="discord-embed-body">
            <div className="discord-embed-content">
              {payload.title && (
                <div className="discord-embed-title">{payload.title}</div>
              )}
              {payload.description && (
                <div className="discord-embed-desc">
                  {payload.description.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < payload.description.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {payload.thumbnailUrl && (
              <img
                className="discord-embed-thumb"
                src={payload.thumbnailUrl}
                alt="thumbnail"
              />
            )}
          </div>

          {payload.imageUrl && (
            <img
              className="discord-embed-image"
              src={payload.imageUrl}
              alt="banner"
            />
          )}

          {payload.footer && (
            <div className="discord-embed-footer">
              <span>{payload.footer}</span>
            </div>
          )}
        </div>
      )}

      {/* Mention content — below embed */}
      {contentParts && contentParts.length > 0 && (
        <div className="discord-content">{contentParts}</div>
      )}
    </div>
  );
}
