import { avatarColors, getInitials, getAge } from '../utils';

export default function FamilyNode({ member, x, y, onClick, isMe, isDragging }) {
  const color = avatarColors[member.relation] || avatarColors.other;
  const age = getAge(member.birth);

  return (
    <g
      transform={`translate(${x}, ${y}) scale(${isDragging ? 1.12 : 1})`}
      onClick={() => onClick(member)}
      style={{ cursor: isDragging ? 'grabbing' : 'pointer', transition: isDragging ? 'none' : 'transform 0.2s' }}
    >
      {/* Shadow — larger when dragging */}
      <circle
        cx={isDragging ? 2 : 1}
        cy={isDragging ? 6 : 3}
        r={isMe ? 34 : 26}
        fill={isDragging ? 'rgba(233,100,67,0.18)' : 'rgba(0,0,0,0.08)'}
      />
      {/* Outer ring for "me" */}
      {isMe && (
        <circle
          cx={0}
          cy={0}
          r={38}
          fill="none"
          stroke={color.bg}
          strokeWidth={2.5}
          strokeDasharray="6 3"
          opacity={0.6}
        />
      )}
      {/* Avatar circle */}
      <circle
        cx={0}
        cy={0}
        r={isMe ? 34 : 26}
        fill={member.alive ? color.bg : '#c7c0b8'}
        stroke={isMe ? '#e96443' : '#fff'}
        strokeWidth={isMe ? 3 : 2}
      />
      {/* Deceased overlay */}
      {!member.alive && (
        <circle
          cx={0}
          cy={0}
          r={isMe ? 34 : 26}
          fill="rgba(0,0,0,0.15)"
        />
      )}
      {/* Initials */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={isMe ? 18 : 14}
        fontWeight="600"
        fill={member.alive ? color.text : '#888'}
        fontFamily="'Apple SD Gothic Neo', sans-serif"
      >
        {getInitials(member.name)}
      </text>
      {/* Name label */}
      <text
        x={0}
        y={isMe ? 48 : 38}
        textAnchor="middle"
        fontSize={isMe ? 13 : 11}
        fontWeight={isMe ? '700' : '500'}
        fill="#5a3e2b"
        fontFamily="'Apple SD Gothic Neo', sans-serif"
      >
        {member.name.length > 5 ? member.name.slice(0, 5) + '…' : member.name}
      </text>
      {/* Age label */}
      {age !== '' && (
        <text
          x={0}
          y={isMe ? 62 : 51}
          textAnchor="middle"
          fontSize={10}
          fill="#a08c7a"
          fontFamily="'Apple SD Gothic Neo', sans-serif"
        >
          {age}세
        </text>
      )}
      {/* Deceased badge */}
      {!member.alive && (
        <g transform={`translate(${isMe ? 22 : 16}, ${isMe ? -24 : -18})`}>
          <circle r={8} fill="#888" />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fill="#fff"
          >†</text>
        </g>
      )}
    </g>
  );
}
