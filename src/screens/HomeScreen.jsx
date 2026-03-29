import { useState, useRef, useEffect } from 'react';
import FamilyNode from '../components/FamilyNode';
import FamilyEdge from '../components/FamilyEdge';
import MemberModal from '../components/MemberModal';
import { getNodePositions, getEdges } from '../utils';
import { useApp } from '../store';

const VIEW_W = 380;
const VIEW_H = 520;

export default function HomeScreen({ onNavigate }) {
  const { members, setMembers } = useApp();
  const [selected, setSelected] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [showAdd, setShowAdd] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const positions = getNodePositions(members);
  const edges = getEdges(members);

  // SVG pan state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const svgRef = useRef(null);

  function handlePointerDown(e) {
    if (e.target.closest('[data-node]')) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }
  function handlePointerMove(e) {
    if (!dragging.current) return;
    setPan(p => ({
      x: p.x + (e.clientX - lastPos.current.x),
      y: p.y + (e.clientY - lastPos.current.y),
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }
  function handlePointerUp() { dragging.current = false; }

  function handleWheel(e) {
    e.preventDefault();
    setScale(s => Math.min(2, Math.max(0.5, s - e.deltaY * 0.001)));
  }

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const cx = VIEW_W / 2 + pan.x;
  const cy = VIEW_H / 2 + pan.y;

  function handleNodeClick(member) {
    setSelected(member);
    setModalMode('view');
    setFabOpen(false);
  }

  function handleSave(updated) {
    if (modalMode === 'add' || showAdd) {
      setMembers(prev => [...prev, updated]);
    } else {
      setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    }
    setSelected(null);
    setShowAdd(false);
  }

  function handleDelete(id) {
    setMembers(prev => prev.filter(m => m.id !== id));
    setSelected(null);
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '52px 20px 12px',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#c4a88a', fontWeight: 600, letterSpacing: 1.2 }}>MY FAMILY</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#5a3e2b', marginTop: 2 }}>가족 트리</div>
        </div>
        <button
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: '#fff', boxShadow: '0 2px 8px rgba(90,62,43,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
          onClick={() => {}}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a08c7a" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div style={{ padding: '0 20px 8px', display: 'flex', gap: 10, overflowX: 'auto' }}>
        {[
          { color: '#e96443', label: '나' },
          { color: '#f5a877', label: '부모' },
          { color: '#f9c784', label: '형제' },
          { color: '#fbd5b5', label: '자녀' },
          { color: '#d4a5c9', label: '배우자' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: 11, color: '#a08c7a', fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ touchAction: 'none', cursor: dragging.current ? 'grabbing' : 'grab' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8f4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fdf6f0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bgGrad)" />

          <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
            {/* Draw edges first */}
            {edges.map(edge => {
              const fromPos = positions[edge.from];
              const toPos = positions[edge.to];
              if (!fromPos || !toPos) return null;
              return (
                <FamilyEdge
                  key={`${edge.from}-${edge.to}`}
                  x1={fromPos.x} y1={fromPos.y}
                  x2={toPos.x} y2={toPos.y}
                  relation={edge.relation}
                />
              );
            })}

            {/* Draw nodes */}
            {members.map(member => {
              const pos = positions[member.id];
              if (!pos) return null;
              return (
                <g key={member.id} data-node="true">
                  <FamilyNode
                    member={member}
                    x={pos.x}
                    y={pos.y}
                    isMe={member.relation === 'me'}
                    onClick={handleNodeClick}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* Pinch hint */}
        <div style={{
          position: 'absolute',
          bottom: 110,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(90,62,43,0.15)',
          borderRadius: 20,
          padding: '5px 12px',
          fontSize: 11,
          color: '#a08c7a',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          핀치로 확대 · 드래그로 이동
        </div>
      </div>

      {/* FAB area */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
        zIndex: 20,
      }}>
        {/* FAB sub-buttons */}
        {fabOpen && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <FABAction
              label="새 가족 추가"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              }
              bg="#e96443"
              onClick={() => {
                setShowAdd(true);
                setFabOpen(false);
              }}
            />
            <FABAction
              label="다른 패밀리와 링크"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
              }
              bg="#d4a5c9"
              onClick={() => {
                onNavigate('link');
                setFabOpen(false);
              }}
            />
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setFabOpen(o => !o)}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#e96443',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(233,100,67,0.45)',
            transition: 'transform 0.2s',
            transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Member detail modal */}
      {selected && (
        <MemberModal
          member={selected}
          mode={modalMode}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {/* Add member modal */}
      {showAdd && (
        <MemberModal
          member={null}
          mode="add"
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
          onDelete={() => {}}
        />
      )}
    </div>
  );
}

function FABAction({ label, icon, bg, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        border: 'none',
        cursor: 'pointer',
        background: 'transparent',
        padding: 0,
      }}
    >
      <span style={{
        background: '#fff8f4',
        color: '#5a3e2b',
        fontSize: 13,
        fontWeight: 600,
        padding: '7px 14px',
        borderRadius: 20,
        boxShadow: '0 2px 8px rgba(90,62,43,0.15)',
        whiteSpace: 'nowrap',
      }}>{label}</span>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
        flexShrink: 0,
      }}>
        {icon}
      </div>
    </button>
  );
}
