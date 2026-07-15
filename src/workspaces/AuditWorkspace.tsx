import { useState, useEffect, useCallback } from 'react';
import { Lang } from '../i18n/translations';
import { supabase } from '../lib/supabase';

interface AuditEntry {
  id: string;
  session_id: string;
  role: 'officer' | 'ai';
  content: string;
  workspace: string;
  entity: string | null;
  confidence: number | null;
  lang: string;
  created_at: string;
  officer_name: string | null;
  officer_role: string | null;
  officer_badge: string | null;
}

interface AuditWorkspaceProps {
  lang: Lang;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const WS_COLOR: Record<string, string> = {
  suspect: '#F04E4E',
  case: '#4D9EF5',
  evidence_review: '#8B6FD4',
  network: '#F5A623',
  trend: '#2ECC71',
  arrests: '#FCA5A5',
  today_cases: '#93C5FD',
  supervision: '#8B9EB5',
};

const ROLE_COLOR: Record<string, string> = {
  investigator: '#4D9EF5',
  analyst: '#8B6FD4',
  supervisor: '#F5A623',
  policymaker: '#2ECC71',
};

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  } catch {
    return iso;
  }
}

export function AuditWorkspace({ lang }: AuditWorkspaceProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'officer' | 'ai'>('all');
  const [search, setSearch] = useState('');

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${API_BASE}/api/audit?limit=100`, { headers })
      .then(r => r.json())
      .then(d => { setEntries(d.entries || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAudit(); }, [fetchAudit]);

  const visible = entries.filter(e => {
    if (filter !== 'all' && e.role !== filter) return false;
    if (search && !e.content.toLowerCase().includes(search.toLowerCase()) &&
        !(e.officer_name ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const officerCount = entries.filter(e => e.role === 'officer').length;
  const workspaceHits = entries.reduce<Record<string, number>>((acc, e) => {
    if (e.workspace && e.workspace !== '—') acc[e.workspace] = (acc[e.workspace] || 0) + 1;
    return acc;
  }, {});
  const topWorkspace = Object.entries(workspaceHits).sort((a, b) => b[1] - a[1])[0];

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      padding: '10px 14px', gap: 10, background: 'var(--bg-base, #080C14)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue, #4D9EF5)', fontWeight: 700, letterSpacing: '0.12em' }}>
            AUDIT TRAIL
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary, #64748B)', marginTop: 2 }}>
            {lang === 'kn' ? 'ಎಲ್ಲ ಅಧಿಕಾರಿ ಪ್ರಶ್ನೆಗಳ ದಾಖಲೆ' : 'Complete record of all officer queries and AI responses'}
          </div>
        </div>
        <button
          onClick={fetchAudit}
          style={{
            background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)',
            borderRadius: 6, padding: '6px 12px', color: 'var(--accent-blue, #4D9EF5)',
            fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer',
          }}
        >
          ↻ REFRESH
        </button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {[
          { label: 'TOTAL ENTRIES', value: entries.length, color: 'var(--text-primary, #E8EDF2)' },
          { label: 'OFFICER QUERIES', value: officerCount, color: '#4D9EF5' },
          { label: 'AI RESPONSES', value: entries.length - officerCount, color: '#2ECC71' },
          { label: 'TOP WORKSPACE', value: topWorkspace ? topWorkspace[0].replace('_', ' ').toUpperCase() : '—', color: topWorkspace ? (WS_COLOR[topWorkspace[0]] ?? '#8B9EB5') : '#8B9EB5' },
        ].map((k, i) => (
          <div key={i} style={{
            flex: i < 3 ? '0 0 auto' : 1,
            background: 'var(--bg-surface, #0D1117)',
            border: '1px solid var(--border-subtle, #1E2D3D)',
            borderRadius: 8, padding: '10px 16px',
          }}>
            <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary, #64748B)', fontWeight: 600, letterSpacing: '0.12em', marginTop: 3 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search content or officer name…"
          style={{
            flex: 1, background: 'var(--bg-surface, #0D1117)', border: '1px solid var(--border-default, #243447)',
            borderRadius: 6, padding: '7px 12px', color: 'var(--text-primary, #E8EDF2)',
            fontSize: 13, outline: 'none', fontFamily: 'inherit',
          }}
        />
        {(['all', 'officer', 'ai'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? 'rgba(77,158,245,0.15)' : 'var(--bg-surface, #0D1117)',
              border: `1px solid ${filter === f ? 'var(--accent-blue, #4D9EF5)' : 'var(--border-default, #243447)'}`,
              borderRadius: 6, padding: '7px 14px',
              color: filter === f ? 'var(--accent-blue, #4D9EF5)' : 'var(--text-tertiary, #64748B)',
              fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, cursor: 'pointer',
              letterSpacing: '0.08em',
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        flex: 1, overflowY: 'auto', background: 'var(--bg-surface, #0D1117)',
        border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 8,
      }} className="left-panel-scroll">
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '130px 150px 70px 100px 1fr 60px',
          padding: '8px 14px', borderBottom: '1px solid var(--border-subtle, #1E2D3D)',
          position: 'sticky', top: 0, background: 'var(--bg-raised, #131920)', zIndex: 2,
        }}>
          {['TIMESTAMP', 'OFFICER', 'ROLE', 'WORKSPACE', 'CONTENT', 'CONF'].map(h => (
            <div key={h} style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary, #64748B)', fontWeight: 600, letterSpacing: '0.12em' }}>{h}</div>
          ))}
        </div>

        {loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary, #64748B)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            Loading audit log…
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary, #64748B)', fontSize: 13 }}>
            No entries match the current filter.
          </div>
        )}

        {!loading && visible.map((e, i) => {
          const wsColor = WS_COLOR[e.workspace] ?? '#8B9EB5';
          return (
            <div
              key={e.id ?? i}
              style={{
                display: 'grid', gridTemplateColumns: '130px 150px 70px 100px 1fr 60px',
                padding: '9px 14px',
                borderBottom: '1px solid var(--border-subtle, #1E2D3D)',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                alignItems: 'start',
              }}
            >
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary, #64748B)', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(e.created_at)}
              </div>

              {/* Officer identity */}
              <div>
                {e.officer_name ? (
                  <>
                    <div style={{ fontSize: 12, color: '#E8EDF2', fontWeight: 600 }}>{e.officer_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      {e.officer_role && (
                        <span style={{
                          fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em',
                          color: ROLE_COLOR[e.officer_role] ?? '#64748B',
                        }}>
                          {e.officer_role.toUpperCase()}
                        </span>
                      )}
                      {e.officer_badge && (
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#4A5C70' }}>
                          · {e.officer_badge}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#4A5C70' }}>—</span>
                )}
              </div>

              <div>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em',
                  padding: '2px 7px', borderRadius: 3,
                  background: e.role === 'officer' ? 'rgba(77,158,245,0.12)' : 'rgba(46,204,113,0.12)',
                  color: e.role === 'officer' ? '#4D9EF5' : '#2ECC71',
                }}>
                  {e.role === 'officer' ? 'OFCR' : 'AI'}
                </span>
              </div>

              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: wsColor, fontWeight: 600, letterSpacing: '0.04em' }}>
                {e.workspace?.replace('_', ' ').toUpperCase() ?? '—'}
                {e.entity && <div style={{ color: 'var(--text-tertiary, #64748B)', fontWeight: 400, marginTop: 2 }}>{e.entity}</div>}
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-secondary, #94A3B8)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                {e.content.length > 120 ? e.content.slice(0, 120) + '…' : e.content}
              </div>

              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: e.confidence != null ? (e.confidence >= 0.85 ? '#2ECC71' : '#F5A623') : 'var(--text-tertiary, #64748B)' }}>
                {e.confidence != null ? `${Math.round(e.confidence * 100)}%` : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
