import { Lang } from '../i18n/translations';
import { Avatar } from '../components/Avatar';

interface NetworkWorkspaceProps {
  lang: Lang;
  onNodeClick: (name: string) => void;
}

const NODES = [
  { id: 'dn', x: 250, y: 100, r: 36, color: '#EF4444', label: 'D. Nair', sublabel: 'Kingpin', name: 'D. Nair' },
  { id: 'rm', x: 130, y: 220, r: 30, color: '#F59E0B', label: 'R. Mehta', sublabel: 'Broker', name: 'R. Mehta', isTarget: true },
  { id: 'sk', x: 370, y: 220, r: 30, color: '#F59E0B', label: 'S. Khan', sublabel: 'Logistics', name: 'S. Khan' },
  { id: 'route', x: 100, y: 350, r: 22, color: '#475569', label: 'Supply Route', sublabel: 'Mumbai', name: '' },
  { id: 'hawala', x: 400, y: 350, r: 22, color: '#475569', label: 'Hawala', sublabel: 'Network', name: '' },
];

const EDGES = [
  ['dn', 'rm'], ['dn', 'sk'], ['rm', 'route'], ['sk', 'hawala'], ['rm', 'sk'],
];

export function NetworkWorkspace({ lang, onNodeClick }: NetworkWorkspaceProps) {
  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  const stats = [
    { label: 'Founded', value: '2019' },
    { label: 'Territory', value: 'Whitefield · Indiranagar' },
    { label: 'Members', value: '7' },
    { label: 'Est. Revenue', value: '₹42L/yr' },
    { label: 'Operations', value: 'Narcotics · Hawala' },
  ];

  return (
    <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', background: '#060A12', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.1em' }}>
        NETWORK WORKSPACE · Cluster K-7 · Narcotics Operation
      </div>

      {/* Network SVG */}
      <div style={{ background: '#0D1828', border: '1px solid #162035', borderRadius: 8, overflow: 'hidden' }}>
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
                <circle cx={n.x} cy={n.y} r={n.r + 5} fill="none" stroke="#F59E0B" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
              )}
              <text x={n.x} y={n.y - 2} textAnchor="middle" fill="#E2E8F0" fontSize={12} fontWeight={600}>{n.label}</text>
              <text x={n.x} y={n.y + 14} textAnchor="middle" fill="#64748B" fontSize={10}>{n.sublabel}</text>
              {n.isTarget && (
                <text x={n.x} y={n.y - n.r - 6} textAnchor="middle" fill="#F59E0B" fontSize={9} fontWeight={800}>TARGET</text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Gang stats */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: '#0D1828', border: '1px solid #162035', borderRadius: 6,
            padding: '10px 12px', flex: 1, minWidth: 100,
          }}>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em', marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#E2E8F0' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: '#334155', textAlign: 'center', paddingBottom: 12 }}>
        Cytoscape.js integration point — click nodes to open intelligence files
      </div>
    </div>
  );
}
