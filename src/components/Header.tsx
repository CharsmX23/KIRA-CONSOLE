import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Lang, t } from '../i18n/translations';

interface HeaderProps {
  lang: Lang;
  workspace: string;
  workspaceLabel: string;
  subjectName?: string;
  onBack: () => void;
}

export function Header({ lang, workspace, workspaceLabel, subjectName, onBack }: HeaderProps) {
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
      background: '#0A1120',
      borderBottom: '1px solid #162035',
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
        <span style={{ fontSize: 16, fontWeight: 800, color: '#60A5FA', letterSpacing: '0.04em', fontFamily: 'sans-serif' }}>
          KIRA CONSOLE
        </span>

        {isSupervision ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 4,
            padding: '3px 8px',
          }}>
            <span className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#86EFAC', letterSpacing: '0.1em' }}>
              {t('supervisionMode', lang)}
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onBack}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'transparent', border: '1px solid #1E2D45',
                borderRadius: 4, padding: '3px 8px', cursor: 'pointer',
                color: '#64748B', fontSize: 11, fontFamily: 'monospace',
              }}
            >
              <ChevronLeft size={12} />
              {t('backToSupervision', lang)}
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 4, padding: '3px 8px',
            }}>
              <span className="blink-fast" style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#FCA5A5', letterSpacing: '0.1em' }}>
                {t('investigationMode', lang)}
              </span>
            </div>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B' }}>
              › {t('supervision', lang)} › {workspaceLabel}{subjectName ? ` › ${subjectName}` : ''}
            </span>
            <button style={{ background: 'transparent', border: '1px solid #1E2D45', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', color: '#64748B', fontSize: 11, fontFamily: 'monospace' }}>
              {t('fullFile', lang)}
            </button>
            <button style={{ background: 'transparent', border: '1px solid #1E2D45', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', color: '#64748B', fontSize: 11, fontFamily: 'monospace' }}>
              {t('exportReport', lang)}
            </button>
          </div>
        )}
      </div>

      {/* Right: time + org */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: 'monospace', color: '#64748B', fontSize: 11 }}>
          {dateStr} · {timeStr}
        </span>
        <span style={{ color: '#334155', fontSize: 11 }}>
          {t('karnatakaSP', lang)}
        </span>
      </div>
    </div>
  );
}
