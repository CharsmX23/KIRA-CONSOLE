import { useState, useEffect } from 'react';
import { Lang } from '../i18n/translations';

interface NetworkWorkspaceProps {
  lang: Lang;
  onNodeClick: (name: string) => void;
}

interface Cluster {
  cluster_id: string;
  members: string[];
  size: number;
}

interface Communities {
  clusters: Cluster[];
  modularity: number;
  node_count: number;
  edge_count: number;
}

interface AnalysisData {
  communities: Communities;
  centrality: Record<string, number>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/network/analysis`)
      .then(r => r.json())
      .then(d => { setAnalysis(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));
  const centrality = analysis?.centrality ?? {};
  const topBroker = Object.entries(centrality)[0];
  const communities = analysis?.communities;

  return (
    <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base, #080C14)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontWeight: 600, letterSpacing: '0.12em' }}>
        NETWORK WORKSPACE · Criminal Association Graph · Louvain Analysis
      </div>

      {/* Network SVG */}
      <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 8, overflow: 'hidden' }}>
        <svg width="100%" viewBox="0 0 500 430" style={{ display: 'block' }}>
          {EDGES.map(([a, b], i) => {
            const n1 = nodeMap[a], n2 = nodeMap[b];
            return (
              <line key={i}
                x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                stroke="rgba(220,38,38,0.3)" strokeWidth={1.5} strokeDasharray="5 3"
              />
            );
          })}
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

      {/* Graph stats header */}
      {!loading && communities && (
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'NODES', value: String(communities.node_count) },
            { label: 'EDGES', value: String(communities.edge_count) },
            { label: 'CLUSTERS', value: String(communities.clusters.length) },
            { label: 'MODULARITY', value: String(communities.modularity), color: communities.modularity > 0.3 ? '#2ECC71' : '#F5A623' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 6, padding: '8px 12px', flex: 1 }}>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: s.color ?? '#E8EDF2' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Community detection results */}
      {!loading && communities && communities.clusters.length > 0 && (
        <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontWeight: 600, letterSpacing: '0.12em', marginBottom: 10 }}>
            LOUVAIN COMMUNITY DETECTION
          </div>
          <div style={{ fontSize: 11, color: '#4A5C70', fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
            Modularity {communities.modularity} — {communities.modularity > 0.3 ? 'strong community structure detected' : 'weak community structure (expected with small graph)'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {communities.clusters.map((c, i) => (
              <div key={i} style={{ background: 'var(--bg-surface, #0D1117)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 6, padding: '8px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#4D9EF5', fontWeight: 700 }}>
                    CLUSTER {c.cluster_id}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#64748B' }}>
                    {c.size} {c.size === 1 ? 'node' : 'nodes'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {c.members.map((m, j) => (
                    <span key={j} style={{
                      fontSize: 11, color: '#94A3B8',
                      background: 'rgba(77,158,245,0.08)', border: '1px solid rgba(77,158,245,0.2)',
                      borderRadius: 4, padding: '2px 7px',
                    }}>{m}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Betweenness centrality */}
      {!loading && Object.keys(centrality).length > 0 && (
        <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontWeight: 600, letterSpacing: '0.12em', marginBottom: 4 }}>
            NETWORK BROKER SCORE — Betweenness Centrality
          </div>
          {topBroker && (
            <div style={{ fontSize: 11, color: '#F04E4E', fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
              ⚠ {topBroker[0]} has highest broker score ({topBroker[1]}) — removal would most disrupt this network
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {Object.entries(centrality).map(([name, score], i) => {
              const pct = topBroker && topBroker[1] > 0 ? (score / topBroker[1]) * 100 : 0;
              const color = i === 0 ? '#F04E4E' : i === 1 ? '#F5A623' : '#4D9EF5';
              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 12, color: '#E8EDF2', width: 80, flexShrink: 0 }}>{name}</div>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color, width: 36, textAlign: 'right' }}>{score.toFixed(3)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 8, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#4A5C70' }}>
            Running Louvain community detection…
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: '#4A5C70', textAlign: 'center', paddingBottom: 12 }}>
        Click nodes to open intelligence files · Graph built from live case/evidence/gang data
      </div>
    </div>
  );
}
