import { useRef, useEffect, useCallback } from 'react';
import { Mic, Shield } from 'lucide-react';
import { Lang, t } from '../i18n/translations';

interface ChatMessage {
  role: 'officer' | 'ai';
  text: string;
  isVoice?: boolean;
}

interface AgentStatus {
  name: string;
  status: 'pending' | 'running' | 'complete';
}

interface RightPanelProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  chat: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  onAnalyze: () => void;
  onVoice: () => void;
  voiceState: 'idle' | 'listening' | 'transcribing' | 'processing';
  activeAgents: AgentStatus[];
  showAgentList: boolean;
}

const STATIC_AGENTS = ['Router Agent', 'Suspect Agent', 'Case Agent', 'Evidence Agent', 'Network Agent', 'Recommendation Agent'];

export function RightPanel({
  lang, setLang, chat, input, setInput, onAnalyze, onVoice,
  voiceState, activeAgents, showAgentList,
}: RightPanelProps) {
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat]);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAnalyze();
    }
  }, [onAnalyze]);

  const quickPrompts = [
    t('showEmergingThreats', lang),
    t('activeCasesToday', lang),
    t('whitefieldHotspots', lang),
    t('recentArrests', lang),
  ];

  return (
    <div style={{
      width: '30%',
      minWidth: 280,
      background: '#0A1120',
      borderLeft: '1px solid #1E2D45',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: '1px solid #1E2D45',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#60A5FA', letterSpacing: '0.04em' }}>
              KIRA <span style={{ fontWeight: 400, color: '#94A3B8' }}>— {t('conversationalAI', lang)}</span>
            </div>
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
              {t('policeIntelligence', lang)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#22C55E', letterSpacing: '0.08em' }}>{t('online', lang)}</span>
            </div>
            {/* Language toggle */}
            <div style={{ display: 'flex', gap: 4 }}>
              {(['en', 'kn'] as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    background: lang === l ? '#60A5FA' : 'transparent',
                    color: lang === l ? '#fff' : '#64748B',
                    border: `1px solid ${lang === l ? '#60A5FA' : '#1E2D45'}`,
                    borderRadius: 9999,
                    padding: '2px 9px',
                    fontSize: 11,
                    fontWeight: lang === l ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {l === 'en' ? 'EN' : 'ಕನ್ನಡ'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={chatRef}
        className="chat-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#060A12',
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {chat.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'officer' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 6 }}>
            {msg.role === 'ai' && (
              <Shield size={14} color="#60A5FA" style={{ flexShrink: 0, marginTop: 2 }} />
            )}
            <div style={{
              maxWidth: '80%',
              background: msg.role === 'officer' ? '#162035' : 'transparent',
              color: msg.role === 'officer' ? '#E2E8F0' : '#93C5FD',
              fontSize: 14,
              lineHeight: 1.8,
              padding: msg.role === 'officer' ? '14px 18px' : '4px 0',
              borderRadius: 6,
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {voiceState === 'listening' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#22C55E' }}>
              {t('listeningStatus', lang)}
            </span>
          </div>
        )}
        {voiceState === 'transcribing' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#F59E0B' }}>
              {t('transcribing', lang)}
            </span>
          </div>
        )}
        {voiceState === 'processing' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#60A5FA' }}>
              {t('processing', lang)}
            </span>
          </div>
        )}
      </div>

      {/* Agent status or quick prompts */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #162035', flexShrink: 0 }}>
        {showAgentList && activeAgents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {activeAgents.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 11,
                  color: a.status === 'complete' ? '#22C55E' : a.status === 'running' ? '#60A5FA' : '#334155',
                  fontFamily: 'monospace',
                  display: 'inline-block',
                  animation: a.status === 'running' ? 'spin 1s linear infinite' : undefined,
                }}>
                  {a.status === 'complete' ? '✓' : a.status === 'running' ? '⟳' : '○'}
                </span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: a.status === 'complete' ? '#94A3B8' : a.status === 'running' ? '#93C5FD' : '#334155' }}>
                  {a.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{ fontSize: 9, color: '#64748B', letterSpacing: '0.1em', fontFamily: 'monospace', marginBottom: 6 }}>
              {t('quickPrompts', lang)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setInput(p)}
                  style={{
                    background: '#0D1828',
                    border: '1px solid #162035',
                    borderRadius: 9999,
                    padding: '6px 10px',
                    fontSize: 12,
                    color: '#64748B',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: 1,
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLButtonElement).style.borderColor = '#60A5FA';
                    (e.target as HTMLButtonElement).style.color = '#60A5FA';
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLButtonElement).style.borderColor = '#162035';
                    (e.target as HTMLButtonElement).style.color = '#64748B';
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Input area */}
      <div style={{
        padding: '10px 12px 12px',
        borderTop: '1px solid #1E2D45',
        flexShrink: 0,
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t('inputPlaceholder', lang)}
          rows={3}
          style={{
            width: '100%',
            background: '#060A12',
            border: '1px solid #1E2D45',
            borderRadius: 8,
            color: '#E2E8F0',
            fontSize: 14,
            padding: '10px 12px',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.5,
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          {/* Voice button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <button
              onClick={onVoice}
              className={voiceState === 'listening' ? 'glow-pulse-blue' : 'glow-pulse-blue'}
              style={{
                width: 48, height: 48,
                borderRadius: '50%',
                background: '#1E2D45',
                border: '1px solid #334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Mic size={18} color="#60A5FA" />
            </button>
            <span style={{ fontSize: 9, color: '#64748B' }}>{t('voice', lang)}</span>
          </div>
          {/* Analyze button */}
          <button
            onClick={onAnalyze}
            style={{
              flex: 1,
              height: 48,
              background: '#1D4ED8',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background 0.15s',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1E40AF')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1D4ED8')}
          >
            {t('analyze', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
