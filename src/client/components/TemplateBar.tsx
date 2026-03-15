import { useState } from 'react';
import type { EmbedPayload } from '../lib/types';

export type SavedTemplate = {
  id: string;
  name: string;
  payload: EmbedPayload;
  createdAt: number;
};

const STORAGE_KEY = 'discord-suite-templates';

function loadTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedTemplate[];
  } catch {
    console.error('[TemplateBar] Failed to load templates from localStorage');
    return [];
  }
}

function saveTemplates(templates: SavedTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

type TemplateBarProps = {
  currentPayload: EmbedPayload;
  onLoadTemplate: (payload: EmbedPayload) => void;
};

export function TemplateBar({ currentPayload, onLoadTemplate }: TemplateBarProps) {
  const [templates, setTemplates] = useState<SavedTemplate[]>(loadTemplates);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showManage, setShowManage] = useState(false);

  function handleSave() {
    if (!templateName.trim()) return;
    const newTemplate: SavedTemplate = {
      id: Date.now().toString(36),
      name: templateName.trim(),
      payload: { ...currentPayload, channelId: '' },
      createdAt: Date.now()
    };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    saveTemplates(updated);
    setTemplateName('');
    setShowSaveModal(false);
    console.log('[TemplateBar] Saved template:', newTemplate.name);
  }

  function handleDelete(id: string) {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
    console.log('[TemplateBar] Deleted template:', id);
  }

  function handleLoad(template: SavedTemplate) {
    console.log('[TemplateBar] Loading template:', template.name);
    onLoadTemplate(template.payload);
  }

  const canSave = currentPayload.title.trim() || currentPayload.description.trim();

  return (
    <div className="template-section">
      {/* Hotbar */}
      <div className="template-hotbar">
        <div className="template-hotbar-label">
          <span>📋 Templates</span>
          <div className="template-actions">
            {templates.length > 0 && (
              <button
                type="button"
                className="template-manage-btn"
                onClick={() => setShowManage(!showManage)}
                title="จัดการ template"
              >
                ⚙️
              </button>
            )}
            <button
              type="button"
              className="template-save-btn"
              onClick={() => setShowSaveModal(true)}
              disabled={!canSave}
              title={canSave ? 'บันทึก template ปัจจุบัน' : 'กรอกข้อมูลก่อนบันทึก'}
            >
              💾 บันทึก
            </button>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="template-empty">
            ยังไม่มี template — กรอกฟอร์มแล้วกด 💾 เพื่อบันทึก
          </div>
        ) : (
          <div className="template-chips">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                className="template-chip"
                onClick={() => handleLoad(t)}
                title={`โหลด: ${t.name}`}
              >
                📄 {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Manage (delete) */}
      {showManage && templates.length > 0 && (
        <div className="template-manage-panel">
          <div className="template-manage-title">จัดการ Template</div>
          {templates.map((t) => (
            <div key={t.id} className="template-manage-row">
              <span className="template-manage-name">📄 {t.name}</span>
              <button
                type="button"
                className="template-delete-btn"
                onClick={() => handleDelete(t.id)}
              >
                🗑️ ลบ
              </button>
            </div>
          ))}
          <button
            type="button"
            className="template-close-btn"
            onClick={() => setShowManage(false)}
          >
            ✕ ปิด
          </button>
        </div>
      )}

      {/* Save modal */}
      {showSaveModal && (
        <div className="template-modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="template-modal" onClick={(e) => e.stopPropagation()}>
            <h3>💾 บันทึก Template</h3>
            <p>ตั้งชื่อ template เพื่อใช้ซ้ำภายหลัง</p>
            <input
              className="template-name-input"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="เช่น ประกาศงดเรียน"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="template-modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowSaveModal(false)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleSave}
                disabled={!templateName.trim()}
              >
                💾 บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
