import { useState, useRef, useEffect, useCallback } from 'react';
import FamilyNode from '../components/FamilyNode';
import FamilyEdge from '../components/FamilyEdge';
import MemberModal from '../components/MemberModal';
import { getNodePositions, getEdges } from '../utils';
import { useApp } from '../store';

export default function HomeScreen({ onNavigate }) {
  const { members, setMembers } = useApp();
  const [selected, setSelected] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [showAdd, setShowAdd] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [renderTick, setRenderTick] = useState(0);

  const svgRef = useRef(null);

  // Physics refs — mutated directly, trigger re-render via renderTick
  const posRef = useRef(null);   // {id: {x, y}}
  const velRef = useRef({});     // {id: {vx, vy}}
  const dragRef = useRef(null);  // {nodeId, origPositions, origPointer, origNodePos}
  const rafRef = useRef(null);

  // Canvas pan/zoom refs (also stored in state for render)
  const panRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const canvasDragRef = useRef(null); // {startPointer, startPan}

  const edgesRef = useRef([]);
  edgesRef.current = getEdges(members);

  // Initialize / sync positions when members list changes
  useEffect(() => {
    const layout = getNodePositions(members);
    if (!posRef.current) {
      posRef.current = {};
      velRef.current = {};
    }
    members.forEach(m => {
      if (!posRef.current[m.id]) {
        posRef.current[m.id] = layout[m.id] || { x: 0, y: 0 };
        velRef.current[m.id] = { vx: 0, vy: 0 };
      }
    });
    const ids = new Set(members.map(m => m.id));
    Object.keys(posRef.current).forEach(id => {
      if (!ids.has(id)) {
        delete posRef.current[id];
        delete velRef.current[id];
      }
    });
    setRenderTick(t => t + 1);
  }, [members]);

  // ── Physics loop ──────────────────────────────────────────────
  const runPhysics = useCallback(() => {
    const drag = dragRef.current;
    const pos = posRef.current;
    const vel = velRef.current;
    const edges = edgesRef.current;

    if (drag) {
      // Pull connected nodes toward (dragNodePos + original offset)
      const dragPos = pos[drag.nodeId];
      edges.forEach(edge => {
        const connectedId =
          edge.from === drag.nodeId ? edge.to :
          edge.to === drag.nodeId ? edge.from : null;
        if (!connectedId || !pos[connectedId]) return;

        const offX = drag.origPositions[connectedId].x - drag.origPositions[drag.nodeId].x;
        const offY = drag.origPositions[connectedId].y - drag.origPositions[drag.nodeId].y;
        const targetX = dragPos.x + offX;
        const targetY = dragPos.y + offY;

        const cur = pos[connectedId];
        const v = vel[connectedId] || { vx: 0, vy: 0 };
        const k = 0.10, damp = 0.72;
        v.vx = v.vx * damp + (targetX - cur.x) * k;
        v.vy = v.vy * damp + (targetY - cur.y) * k;
        pos[connectedId] = { x: cur.x + v.vx, y: cur.y + v.vy };
        vel[connectedId] = v;
      });

      setRenderTick(t => t + 1);
      rafRef.current = requestAnimationFrame(runPhysics);
    } else {
      // No drag — coast to a stop
      let moving = false;
      Object.keys(vel).forEach(id => {
        const v = vel[id];
        if (Math.abs(v.vx) < 0.05 && Math.abs(v.vy) < 0.05) {
          v.vx = 0; v.vy = 0;
          return;
        }
        moving = true;
        v.vx *= 0.80;
        v.vy *= 0.80;
        if (pos[id]) pos[id] = { x: pos[id].x + v.vx, y: pos[id].y + v.vy };
      });
      if (moving) {
        setRenderTick(t => t + 1);
        rafRef.current = requestAnimationFrame(runPhysics);
      }
    }
  }, []);

  // ── Convert client → SVG canvas coords ───────────────────────
  function clientToCanvas(clientX, clientY) {
    const rect = svgRef.current.getBoundingClientRect();
    const cx = panRef.current.x + rect.width / 2;
    const cy = panRef.current.y + rect.height / 2;
    return {
      x: (clientX - rect.left - cx) / scaleRef.current,
      y: (clientY - rect.top - cy) / scaleRef.current,
    };
  }

  // ── Pointer handlers ─────────────────────────────────────────
  function handleSVGPointerDown(e) {
    // Hit-test: is it over a node?
    const hit = e.target.closest('[data-node-id]');
    if (hit) {
      e.stopPropagation();
      const nodeId = hit.dataset.nodeId;
      const origPositions = {};
      Object.keys(posRef.current).forEach(id => {
        origPositions[id] = { ...posRef.current[id] };
      });
      dragRef.current = { nodeId, origPositions };
      Object.keys(velRef.current).forEach(id => {
        velRef.current[id] = { vx: 0, vy: 0 };
      });
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(runPhysics);
      svgRef.current.setPointerCapture(e.pointerId);
    } else {
      // Canvas pan
      canvasDragRef.current = {
        startPointer: { x: e.clientX, y: e.clientY },
        startPan: { ...panRef.current },
      };
      svgRef.current.setPointerCapture(e.pointerId);
    }
  }

  function handleSVGPointerMove(e) {
    if (dragRef.current) {
      const { x, y } = clientToCanvas(e.clientX, e.clientY);
      posRef.current[dragRef.current.nodeId] = { x, y };
      // physics loop already running
    } else if (canvasDragRef.current) {
      const dx = e.clientX - canvasDragRef.current.startPointer.x;
      const dy = e.clientY - canvasDragRef.current.startPointer.y;
      const newPan = {
        x: canvasDragRef.current.startPan.x + dx,
        y: canvasDragRef.current.startPan.y + dy,
      };
      panRef.current = newPan;
      scaleRef.current = scaleRef.current; // unchanged
      setPan(newPan);
    }
  }

  function handleSVGPointerUp(e) {
    if (dragRef.current) {
      dragRef.current = null;
      // physics loop continues for coast-out
    }
    canvasDragRef.current = null;
  }

  function handleSVGClick(e) {
    // Only fire click if pointer didn't move much (not a drag)
    const hit = e.target.closest('[data-node-id]');
    if (hit) {
      const nodeId = hit.dataset.nodeId;
      const member = members.find(m => m.id === nodeId);
      if (member) {
        setSelected(member);
        setModalMode('view');
        setFabOpen(false);
      }
    }
  }

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const next = Math.min(2, Math.max(0.4, scaleRef.current - e.deltaY * 0.001));
      scaleRef.current = next;
      setScale(next);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  function handleSave(updated) {
    if (showAdd) {
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

  const positions = posRef.current || {};
  const edges = edgesRef.current;
  const cx = pan.x + (svgRef.current?.getBoundingClientRect().width ?? 390) / 2;
  const cy = pan.y + (svgRef.current?.getBoundingClientRect().height ?? 520) / 2;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '52px 20px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#c4a88a', fontWeight: 600, letterSpacing: 1.2 }}>MY FAMILY</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#5a3e2b', marginTop: 2 }}>가족 트리</div>
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#fff', boxShadow: '0 2px 8px rgba(90,62,43,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>
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
          style={{ touchAction: 'none', cursor: 'grab', display: 'block' }}
          onPointerDown={handleSVGPointerDown}
          onPointerMove={handleSVGPointerMove}
          onPointerUp={handleSVGPointerUp}
          onClick={handleSVGClick}
        >
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8f4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fdf6f0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bgGrad)" />

          <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
            {/* Edges */}
            {edges.map(edge => {
              const fp = positions[edge.from];
              const tp = positions[edge.to];
              if (!fp || !tp) return null;
              return (
                <FamilyEdge
                  key={`${edge.from}-${edge.to}`}
                  x1={fp.x} y1={fp.y}
                  x2={tp.x} y2={tp.y}
                  relation={edge.relation}
                />
              );
            })}

            {/* Nodes */}
            {members.map(member => {
              const pos = positions[member.id];
              if (!pos) return null;
              const isDragging = dragRef.current?.nodeId === member.id;
              return (
                <g
                  key={member.id}
                  data-node-id={member.id}
                  style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
                >
                  <FamilyNode
                    member={member}
                    x={pos.x}
                    y={pos.y}
                    isMe={member.relation === 'me'}
                    isDragging={isDragging}
                    onClick={() => {}}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        <div style={{
          position: 'absolute', bottom: 110, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(90,62,43,0.13)', borderRadius: 20,
          padding: '5px 12px', fontSize: 11, color: '#a08c7a',
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          노드 드래그 · 배경 드래그로 이동 · 휠로 확대
        </div>
      </div>

      {/* FAB */}
      <div style={{
        position: 'absolute', bottom: 32, right: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10,
        zIndex: 20,
      }}>
        {fabOpen && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <FABAction
              label="새 가족 추가"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}
              bg="#e96443"
              onClick={() => { setShowAdd(true); setFabOpen(false); }}
            />
            <FABAction
              label="다른 패밀리와 링크"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>}
              bg="#d4a5c9"
              onClick={() => { onNavigate('link'); setFabOpen(false); }}
            />
          </div>
        )}
        <button
          onClick={() => setFabOpen(o => !o)}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#e96443', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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

      {selected && (
        <MemberModal
          member={selected}
          mode={modalMode}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
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
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', cursor: 'pointer', background: 'transparent', padding: 0 }}>
      <span style={{ background: '#fff8f4', color: '#5a3e2b', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 20, boxShadow: '0 2px 8px rgba(90,62,43,0.15)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px rgba(0,0,0,0.15)', flexShrink: 0 }}>{icon}</div>
    </button>
  );
}
