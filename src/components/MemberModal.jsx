import { useState, useEffect } from 'react';
import { relationLabels, formatBirth, getAge, avatarColors, getInitials } from '../utils';

const RELATIONS = ['parent', 'child', 'sibling', 'spouse', 'grandparent', 'grandchild', 'other'];
const GENDERS = ['female', 'male', 'none'];
const GENDER_LABELS = { female: '여성', male: '남성', none: '선택 안 함' };

function initForm(member) {
  return {
    name: member?.name || '',
    birth: member?.birth || '',
    relation: member?.relation || 'parent',
    alive: member?.alive ?? true,
    gender: member?.gender || 'none',
  };
}

export default function MemberModal({ member, mode, onClose, onSave, onDelete }) {
  // mode: 'view' | 'add' | 'edit'
  const [form, setForm] = useState(() => initForm(member));
  const [currentMode, setCurrentMode] = useState(mode);

  useEffect(() => {
    setForm(initForm(member));
    setCurrentMode(mode);
  }, [member, mode]);

  const color = avatarColors[form.relation] || avatarColors.other;
  const age = getAge(form.birth);

  function handleSave() {
    if (!form.name.trim()) return;
    onSave({ ...member, ...form, id: member?.id || `m_${Date.now()}` });
  }

  const isView = currentMode === 'view';
  const isEdit = currentMode === 'edit' || currentMode === 'add';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(90,62,43,0.35)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full slide-up"
        style={{
          maxWidth: 430,
          background: '#fdf6f0',
          borderRadius: '24px 24px 0 0',
          maxHeight: '92dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d9c9bb' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0e6dc' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a08c7a" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <span style={{ fontWeight: 700, fontSize: 17, color: '#5a3e2b' }}>
            {currentMode === 'add' ? '새 가족 추가' : isView ? '가족 정보' : '정보 수정'}
          </span>

          <button
            onClick={isEdit ? handleSave : () => setCurrentMode('edit')}
            style={{
              background: '#e96443',
              color: '#fff',
              borderRadius: 20,
              padding: '6px 16px',
              fontWeight: 700,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isEdit ? '저장' : '수정'}
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex flex-col items-center py-4">
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: color.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 700,
              color: color.text,
              boxShadow: '0 4px 16px rgba(233,100,67,0.2)',
            }}
          >
            {getInitials(form.name || '?')}
          </div>
          {isView && (
            <div className="mt-2 text-center">
              <div style={{ fontWeight: 700, fontSize: 20, color: '#5a3e2b' }}>{member.name}</div>
              <div style={{ fontSize: 13, color: '#a08c7a', marginTop: 2 }}>
                {relationLabels[member.relation]} · {age}세
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-8">
          {/* VIEW mode */}
          {isView && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <InfoRow icon="🎂" label="생년월일" value={formatBirth(member.birth)} />
              <InfoRow icon="👤" label="성별" value={GENDER_LABELS[member.gender] || '선택 안 함'} />
              <InfoRow icon="💛" label="생존 여부" value={member.alive ? '생존' : '사망'} />

              {member.id !== 'me' && (
                <button
                  onClick={() => onDelete(member.id)}
                  className="mt-4"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 14,
                    border: '1.5px solid #f5c4b8',
                    background: 'transparent',
                    color: '#e96443',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  가족 삭제
                </button>
              )}
            </div>
          )}

          {/* EDIT / ADD mode */}
          {isEdit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Name */}
              <Field label="이름 *">
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="이름을 입력하세요"
                  style={inputStyle}
                />
              </Field>

              {/* Birth */}
              <Field label="생년월일 *">
                <input
                  type="date"
                  value={form.birth}
                  onChange={e => setForm(f => ({ ...f, birth: e.target.value }))}
                  style={inputStyle}
                />
              </Field>

              {/* Relation */}
              {currentMode !== 'add' || member?.relation !== 'me' ? (
                <Field label="나와의 관계 *">
                  <select
                    value={form.relation}
                    onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
                    style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a08c7a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                  >
                    {RELATIONS.map(r => (
                      <option key={r} value={r}>{relationLabels[r]}</option>
                    ))}
                  </select>
                </Field>
              ) : null}

              {/* Gender - optional, light tag style */}
              <Field label="성별 (선택 사항)">
                <div style={{ display: 'flex', gap: 8 }}>
                  {GENDERS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, gender: g }))}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 20,
                        border: '1.5px solid',
                        borderColor: form.gender === g ? '#e96443' : '#e0d5cc',
                        background: form.gender === g ? '#fff1ec' : 'transparent',
                        color: form.gender === g ? '#e96443' : '#a08c7a',
                        fontSize: 13,
                        fontWeight: form.gender === g ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {GENDER_LABELS[g]}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Alive toggle */}
              <Field label="생존 여부">
                <div
                  onClick={() => setForm(f => ({ ...f, alive: !f.alive }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {/* Toggle switch */}
                  <div
                    style={{
                      width: 52,
                      height: 30,
                      borderRadius: 15,
                      background: form.alive ? '#e96443' : '#d9c9bb',
                      position: 'relative',
                      transition: 'background 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: form.alive ? 25 : 3,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#fff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        transition: 'left 0.2s',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 15, color: form.alive ? '#e96443' : '#a08c7a', fontWeight: 500 }}>
                    {form.alive ? '생존' : '사망'}
                  </span>
                </div>
              </Field>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={!form.name.trim()}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 16,
                  background: form.name.trim() ? '#e96443' : '#e0d5cc',
                  color: form.name.trim() ? '#fff' : '#a08c7a',
                  fontWeight: 700,
                  fontSize: 16,
                  border: 'none',
                  cursor: form.name.trim() ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                  marginTop: 4,
                }}
              >
                {currentMode === 'add' ? '가족 추가하기' : '변경 저장'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#a08c7a', marginBottom: 7, letterSpacing: 0.5 }}>
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      borderRadius: 14,
      background: '#fff8f4',
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: '#a08c7a', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 15, color: '#5a3e2b', fontWeight: 600, marginTop: 1 }}>{value || '—'}</div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 14,
  border: '1.5px solid #e0d5cc',
  background: '#fff8f4',
  fontSize: 15,
  color: '#5a3e2b',
  outline: 'none',
  fontFamily: 'inherit',
};
