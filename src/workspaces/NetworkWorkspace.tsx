import { Lang } from '../i18n/translations';

interface NetworkWorkspaceProps {
  lang: Lang;
  onNodeClick: (name: string) => void;
}

const NODES = [
  { id: 'dn', x: 250, y: 100, r: 36, color: '#F04E4E', label: 'D. Nair', sublabel: 'Kingpin', name: 'D. Nair' },
  { id: 'rm', x: 130, y: 220, r: 30, color: '#F5A623', label: 'R. Mehta', sublabel: 'Broker', name: 'R. Mehta', isTarget: true },
  { id: 'sk', x: 370, y: 220, r: 30, color: '#F5A623', label: 'S. Khan', sublabel: 'Logistics', name: 'S. Khan' },
  { id: 'route', x: 100, y: 350, r: 22, color: '#8B9EB5', label: 'Supply Route', sublabel: 'Mumbai', name: '' },
  { id: 'hawala', x: 400, y: 350, r: 22, color: '#8B9EB5', label: 'Hawala', sublabel: 'Network', name: '' },
];

const EDGES = [
  ['dn', 'rm'], ['dn', 'sk'], ['rm', 'route'], ['sk', 'hawala'], ['rm', 'sk'],
];

export function NetworkWorkspace({ onNodeClick }: NetworkWorkspaceProps) {
  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  const stats = [
    { label: 'Founded', value: '2019' },
    { label: 'Territory', value: 'Whitefield · Indiranagar' },
    { label: 'Members', value: '7' },
    { label: 'Est. Revenue', value: '₹42L/yr' },
    { label: 'Operations', value: 'Narcotics · Hawala' },
  ];

  return (
    <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base, #080C14)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontWeight: 600, letterSpacing: '0.12em' }}>
        NETWORK WORKSPACE · Cluster K-7 · Narcotics Operation
      </div>

      {/* Network SVG */}
      <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 8, overflow: 'hidden' }}>
        <svg width="100%" viewBox="0 0 500 430" style={{ display: 'block' }}>
          {/* Edges */}
          {EDGES.map(([a, b], i) => {
            const n1 = nodeMap[a], n2 = nodeMap[b];
            return (
              <line key={i}
                x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                stroke="rgba(220,38,38,0.3)" strokeWidth={1.5} strokeDasharray="5 3"
              />
            );
          })}
          {/* Nodes */}
          {NODES.map(n => (
            <g key={n.id} style={{ cursor: n.name ? 'pointer' : 'default' }} onClick={() => n.name && onNodeClick(n.name)}>
              <circle cx={n.x} cy={n.y} r={n.r} fill={`${n.color}22`} stroke={n.color} strokeWidth={2} />
              {n.isTarget && (
                <circle cx={n.x} cy={n.y} r={n.r + 5} fill="none" stroke="#F5A623" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
              )}
              <text x={n.x} y={n.y - 2} textAnchor="middle" fill="#E8EDF2" fontSize={12} fontWeight={600}>{n.label}</text>
              <text x={n.x} y={n.y + 14} textAnchor="middle" fill="#64748B" fontSize={10}>{n.sublabel}</text>
              {n.isTarget && (
                <text x={n.x} y={n.y - n.r - 6} textAnchor="middle" fill="#F5A623" fontSize={9} fontWeight={800}>TARGET</text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Gang stats */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 6,
            padding: '10px 12px', flex: 1, minWidth: 100,
          }}>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#E8EDF2' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: '#4A5C70', textAlign: 'center', paddingBottom: 12 }}>
        Cytoscape.js integration point — click nodes to open intelligence files
      </div>
    </div>
  );
}
