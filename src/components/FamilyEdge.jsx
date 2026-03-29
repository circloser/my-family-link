const edgeColors = {
  parent: '#f5a877',
  child: '#fbd5b5',
  sibling: '#f9c784',
  spouse: '#d4a5c9',
  grandparent: '#c5b9a8',
  grandchild: '#ffe0b2',
  other: '#cfd8dc',
};

export default function FamilyEdge({ x1, y1, x2, y2, relation }) {
  const color = edgeColors[relation] || edgeColors.other;

  // Curved path
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular offset for gentle curve
  const offset = len * 0.12;
  const cx = mx - (dy / len) * offset;
  const cy = my + (dx / len) * offset;

  return (
    <path
      d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      opacity={0.75}
    />
  );
}
