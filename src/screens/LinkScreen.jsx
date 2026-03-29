import { useState } from 'react';
import { avatarColors, getInitials, relationLabels } from '../utils';
import { useApp } from '../store';

const MOCK_FAMILIES = [
  {
    id: 'fam_kim',
    name: '김민준 가족',
    code: 'KIM-2847',
    members: [
      { id: 'km1', name: '김민준', relation: 'me', birth: '1988-07-20', alive: true },
      { id: 'km2', name: '김아버지', relation: 'parent', birth: '1960-04-10', alive: true },
      { id: 'km3', name: '김어머니', relation: 'parent', birth: '1963-09-05', alive: true },
    ],
  },
  {
    id: 'fam_park',
    name: '박지수 가족',
    code: 'PARK-5913',
    members: [
      { id: 'pk1', name: '박지수', relation: 'me', birth: '1992-03-14', alive: true },
      { id: 'pk2', name: '박언니', relation: 'sibling', birth: '1989-11-22', alive: true },
    ],
  },
];

export default function LinkScreen({ onBack }) {
  const { members } = useApp();
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState('code'); // 'code' | 'contact'
  const [result, setResult] = useState(null);
  const [linking, setLinking] = useState(false);
  const [linked, setLinked] = useState(false);
  const [mergePreviewStep, setMergePreviewStep] = useState(0);

  const me = members.find(m => m.relation === 'me');

  function handleSearch() {
    const q = query.trim().toUpperCase();
    const found = MOCK_FAMILIES.find(f =>
      f.code === q || f.name.includes(query) || f.members.some(m => m.name.includes(query))
    );
    setResult(found || null);
    if (!found) setResult({ notFound: true });
    setMergePreviewStep(0);
    setLinked(false);
  }

  function handleLink() {
    setLinking(true);
    // Simulate async
    setTimeout(() => {
      setLinking(false);
      setLinked(true);
      setMergePreviewStep(2);
    }, 1500);
  }

  const myCode = 'MY-' + (me?.id?.slice(0, 4) || 'XXXX').toUpperCase();

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#fdf6f0' }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: '#fff', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(90,62,43,0.12)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a08c7a" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <div style={{ fontSize: 11, color: '#c4a88a', fontWeight: 600, letterSpacing: 1.2 }}>CONNECT</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#5a3e2b' }}>패밀리 링크</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 40px' }}>
        {/* My invite code card */}
        <div style={{
          background: 'linear-gradient(135deg, #e96443 0%, #f5a877 100%)',
          borderRadius: 20,
          padding: '20px 20px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: 6 }}>내 초대 코드</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: 3, marginBottom: 8 }}>{myCode}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>이 코드를 가족에게 공유하세요</div>
          <button style={{
            marginTop: 14,
            background: 'rgba(255,255,255,0.25)',
            border: '1.5px solid rgba(255,255,255,0.4)',
            borderRadius: 20,
            padding: '7px 18px',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            코드 복사
          </button>
        </div>

        {/* Search mode tabs */}
        <div style={{
          display: 'flex',
          background: '#f0e6dc',
          borderRadius: 14,
          padding: 4,
          marginBottom: 16,
        }}>
          {[
            { key: 'code', label: '초대 코드' },
            { key: 'contact', label: '이름 검색' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setSearchMode(tab.key); setResult(null); setQuery(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 11,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                background: searchMode === tab.key ? '#fff' : 'transparent',
                color: searchMode === tab.key ? '#e96443' : '#a08c7a',
                boxShadow: searchMode === tab.key ? '0 1px 4px rgba(90,62,43,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4a88a" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={searchMode === 'code' ? '초대 코드 입력 (예: KIM-2847)' : '이름으로 가족 검색'}
              style={{
                width: '100%',
                padding: '14px 14px 14px 40px',
                borderRadius: 14,
                border: '1.5px solid #e0d5cc',
                background: '#fff8f4',
                fontSize: 15,
                color: '#5a3e2b',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            style={{
              padding: '0 20px',
              borderRadius: 14,
              background: '#e96443',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            검색
          </button>
        </div>

        {/* Search result */}
        {result && !result.notFound && (
          <div className="fade-in">
            {/* Found family card */}
            <div style={{
              background: '#fff',
              borderRadius: 20,
              border: '2px solid',
              borderColor: linked ? '#a8d5a2' : '#e0d5cc',
              overflow: 'hidden',
              marginBottom: 20,
              boxShadow: '0 4px 20px rgba(90,62,43,0.08)',
            }}>
              <div style={{
                background: linked ? 'linear-gradient(135deg,#a8d5a2,#c8e6c4)' : 'linear-gradient(135deg, #fdf0e8, #fde8d8)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: linked ? '#6ac16a' : '#e96443',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {linked ? '✓' : '👨‍👩‍👧‍👦'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#5a3e2b' }}>{result.name}</div>
                  <div style={{ fontSize: 12, color: '#a08c7a', marginTop: 2 }}>
                    {linked ? '링크 완료 ✓' : `코드: ${result.code} · 구성원 ${result.members.length}명`}
                  </div>
                </div>
              </div>

              {/* Merge preview */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#a08c7a', marginBottom: 12, letterSpacing: 0.5 }}>
                  {linked ? '연결된 트리 미리보기' : '연결 미리보기'}
                </div>

                <MergePreview
                  myMembers={members}
                  theirMembers={result.members}
                  linked={linked}
                  me={me}
                />
              </div>
            </div>

            {!linked ? (
              <button
                onClick={handleLink}
                disabled={linking}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 16,
                  background: linking ? '#f0e6dc' : '#e96443',
                  color: linking ? '#a08c7a' : '#fff',
                  fontWeight: 700,
                  fontSize: 16,
                  border: 'none',
                  cursor: linking ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {linking ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    연결 중…
                  </>
                ) : '패밀리 링크 연결하기 →'}
              </button>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '16px',
                borderRadius: 16,
                background: '#eafae8',
                color: '#4a8c48',
                fontWeight: 700,
                fontSize: 15,
              }}>
                🎉 패밀리가 성공적으로 연결되었습니다!
              </div>
            )}
          </div>
        )}

        {result?.notFound && (
          <div className="fade-in" style={{
            textAlign: 'center',
            padding: '32px 20px',
            borderRadius: 20,
            background: '#fff8f4',
            border: '1.5px dashed #e0d5cc',
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
            <div style={{ fontWeight: 600, color: '#a08c7a', fontSize: 15 }}>
              가족을 찾을 수 없어요
            </div>
            <div style={{ fontSize: 13, color: '#c4a88a', marginTop: 6 }}>
              코드 또는 이름을 다시 확인해 주세요
            </div>
          </div>
        )}

        {!result && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
            <div style={{ fontWeight: 600, color: '#a08c7a', fontSize: 15 }}>
              초대 코드를 입력하거나<br />이름으로 가족을 검색하세요
            </div>
            <div style={{ fontSize: 13, color: '#c4a88a', marginTop: 8 }}>
              예시 코드: KIM-2847
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function MergePreview({ myMembers, theirMembers, linked, me }) {
  const myDisplay = myMembers.slice(0, 4);
  const theirDisplay = theirMembers.slice(0, 4);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* My family nodes */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#a08c7a', marginBottom: 6, textAlign: 'center', fontWeight: 500 }}>내 가족</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {myDisplay.map(m => (
            <MiniNode key={m.id} member={m} />
          ))}
        </div>
      </div>

      {/* Link indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: linked ? 'linear-gradient(135deg,#a8d5a2,#6ac16a)' : 'linear-gradient(135deg,#e96443,#f5a877)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: linked ? '0 2px 8px rgba(106,193,106,0.4)' : '0 2px 8px rgba(233,100,67,0.3)',
        }}>
          {linked ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          )}
        </div>
        <div style={{ width: 30, height: 1.5, background: linked ? '#a8d5a2' : '#e0d5cc' }} />
      </div>

      {/* Their family nodes */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#a08c7a', marginBottom: 6, textAlign: 'center', fontWeight: 500 }}>상대 가족</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {theirDisplay.map(m => (
            <MiniNode key={m.id} member={m} dim={!linked} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniNode({ member, dim }) {
  const color = avatarColors[member.relation] || avatarColors.other;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: dim ? '#e8ddd5' : color.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700,
      color: dim ? '#c4a88a' : color.text,
      border: `2px solid ${dim ? '#d9ccc2' : '#fff'}`,
      flexShrink: 0,
      transition: 'all 0.3s',
    }}>
      {getInitials(member.name)}
    </div>
  );
}
