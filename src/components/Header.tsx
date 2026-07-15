import { useEffect, useState } from 'react';
import { ChevronLeft, LogOut } from 'lucide-react';
import { Lang, t } from '../i18n/translations';
import { UserProfile } from '../lib/supabase';

interface HeaderProps {
  lang: Lang;
  workspace: string;
  workspaceLabel: string;
  subjectName?: string;
  profile: UserProfile | null;
  onBack: () => void;
  onExportReport?: () => void;
  onAudit?: () => void;
  onSignOut: () => void;
}

const ROLE_COLOR: Record<string, string> = {
  investigator: '#4D9EF5',
  analyst: '#8B6FD4',
  supervisor: '#F5A623',
  policymaker: '#2ECC71',
};

export function Header({ lang, workspace, workspaceLabel, subjectName, profile, onBack, onExportReport, onAudit, onSignOut }: HeaderProps) {
  const [now, setNow] = useState(new Date());
  const isSupervision = workspace === 'supervision';

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{
      background: 'var(--bg-surface, #0D1117)',
      borderBottom: '1px solid var(--border-subtle, #1E2D3D)',
      padding: '0 16px',
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      {/* Left: Logo + mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/ksp_emblem_transparent.png" alt="KSP" style={{ height: 32, width: 'auto', flexShrink: 0 }} />
        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-blue, #4D9EF5)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
          KIRA CONSOLE
        </span>

        {isSupervision ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(46,204,113,0.1)',
            border: '1px solid rgba(46,204,113,0.3)',
            borderRadius: 4,
            padding: '3px 8px',
          }}>
            <span className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ECC71', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#86EFAC', fontWeight: 600, letterSpacing: '0.12em' }}>
              {t('supervisionMode', lang)}
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onBack}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'transparent', border: '1px solid #243447',
                borderRadius: 4, padding: '3px 8px', cursor: 'pointer',
                color: '#64748B', fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <ChevronLeft size={12} />
              {t('backToSupervision', lang)}
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(240,78,78,0.1)',
              border: '1px solid rgba(240,78,78,0.3)',
              borderRadius: 4, padding: '3px 8px',
            }}>
              <span className="blink-fast" style={{ width: 6, height: 6, borderRadius: '50%', background: '#F04E4E', display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#FCA5A5', fontWeight: 600, letterSpacing: '0.12em' }}>
                {t('investigationMode', lang)}
              </span>
            </div>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#64748B' }}>
              › {t('supervision', lang)} › {workspaceLabel}{subjectName ? ` › ${subjectName}` : ''}
            </span>
            <button style={{ background: 'transparent', border: '1px solid #243447', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', color: '#64748B', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
              {t('fullFile', lang)}
            </button>
            <button
              onClick={onExportReport}
              style={{ background: 'transparent', border: '1px solid #243447', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', color: '#64748B', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {t('exportReport', lang)}
            </button>
          </div>
        )}
      </div>

      {/* Right: officer identity + audit + time + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onAudit}
          style={{
            background: workspace === 'audit' ? 'rgba(77,158,245,0.15)' : 'transparent',
            border: `1px solid ${workspace === 'audit' ? '#4D9EF5' : '#243447'}`,
            borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
            color: workspace === 'audit' ? '#4D9EF5' : '#64748B',
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: '0.08em',
          }}
        >
          AUDIT
        </button>

        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontSize: 11 }}>
          {dateStr} · {timeStr}
        </span>

        {/* Officer identity */}
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid #1E2D3D' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#E8EDF2', fontWeight: 600, lineHeight: 1.2 }}>
                {profile.full_name}
              </div>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', lineHeight: 1.2, marginTop: 1 }}>
                <span style={{ color: ROLE_COLOR[profile.role] ?? '#64748B', fontWeight: 700 }}>
                  {profile.role.toUpperCase()}
                </span>
                {profile.badge_number && (
                  <span style={{ color: '#4A5C70' }}> · {profile.badge_number}</span>
                )}
              </div>
            </div>
            <button
              onClick={onSignOut}
              title="Sign out"
              style={{
                background: 'transparent', border: '1px solid #243447',
                borderRadius: 4, padding: '4px 7px', cursor: 'pointer',
                color: '#64748B', display: 'flex', alignItems: 'center',
              }}
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
