export function getAge(birth) {
  if (!birth) return '';
  const today = new Date();
  const b = new Date(birth);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

export function formatBirth(birth) {
  if (!birth) return '';
  const [y, m, d] = birth.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}

export const relationLabels = {
  me: '나',
  parent: '부모',
  child: '자녀',
  sibling: '형제/자매',
  spouse: '배우자',
  grandparent: '조부모',
  grandchild: '손자녀',
  other: '기타',
};

export const genderLabels = {
  male: '남성',
  female: '여성',
  none: '선택 안 함',
};

export const avatarColors = {
  me: { bg: '#e96443', text: '#fff' },
  parent: { bg: '#f5a877', text: '#7c3a10' },
  child: { bg: '#fbd5b5', text: '#a0522d' },
  sibling: { bg: '#f9c784', text: '#7c5200' },
  spouse: { bg: '#d4a5c9', text: '#5a2d6e' },
  grandparent: { bg: '#c5b9a8', text: '#4a3728' },
  grandchild: { bg: '#ffe0b2', text: '#8d4e15' },
  other: { bg: '#cfd8dc', text: '#37474f' },
};

export function getInitials(name) {
  if (!name) return '?';
  return name.charAt(0);
}

// Node layout positions for the family tree (relative to center)
export function getNodePositions(members) {
  const me = members.find(m => m.relation === 'me');
  const parents = members.filter(m => m.relation === 'parent');
  const children = members.filter(m => m.relation === 'child');
  const siblings = members.filter(m => m.relation === 'sibling');
  const spouses = members.filter(m => m.relation === 'spouse');
  const grandparents = members.filter(m => m.relation === 'grandparent');

  const positions = {};
  const CX = 0, CY = 0;

  // Me at center
  if (me) positions[me.id] = { x: CX, y: CY };

  // Parents above
  const pw = 160;
  parents.forEach((p, i) => {
    const total = parents.length;
    const offset = (i - (total - 1) / 2) * pw;
    positions[p.id] = { x: CX + offset, y: CY - 160 };
  });

  // Grandparents above parents
  grandparents.forEach((gp, i) => {
    const total = grandparents.length;
    const offset = (i - (total - 1) / 2) * 150;
    positions[gp.id] = { x: CX + offset, y: CY - 300 };
  });

  // Children below
  const cw = 140;
  children.forEach((c, i) => {
    const total = children.length;
    const offset = (i - (total - 1) / 2) * cw;
    positions[c.id] = { x: CX + offset, y: CY + 160 };
  });

  // Siblings to the right
  const sw = 140;
  siblings.forEach((s, i) => {
    positions[s.id] = { x: CX + 200, y: CY + (i - (siblings.length - 1) / 2) * sw };
  });

  // Spouses to the left
  spouses.forEach((sp, i) => {
    positions[sp.id] = { x: CX - 200, y: CY + i * 140 };
  });

  return positions;
}

export function getEdges(members) {
  const me = members.find(m => m.relation === 'me');
  if (!me) return [];

  const edges = [];
  members.forEach(m => {
    if (m.id !== me.id) {
      edges.push({ from: me.id, to: m.id, relation: m.relation });
    }
  });
  return edges;
}
