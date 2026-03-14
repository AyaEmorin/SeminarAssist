import type { EmbedPayload } from '../lib/types';

export function EmbedPreview({ payload }: { payload: EmbedPayload }) {
  const color = payload.color || '#5865F2';

  return (
    <div className="preview-shell">
      <div className="embed-preview" style={{ borderLeftColor: color }}>
        {payload.title ? <h3>{payload.title}</h3> : null}
        {payload.description ? <p>{payload.description}</p> : null}
        {payload.thumbnailUrl ? (
          <img className="thumbnail-preview" src={payload.thumbnailUrl} alt="thumbnail" />
        ) : null}
        {payload.imageUrl ? <img className="image-preview" src={payload.imageUrl} alt="banner" /> : null}
        {payload.footer ? <small>{payload.footer}</small> : null}
      </div>
    </div>
  );
}
