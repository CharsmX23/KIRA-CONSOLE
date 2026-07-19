import { useRef, useEffect, useCallback, useState } from 'react';
import { Mic, MicOff, Shield, Volume2, VolumeX, Paperclip, X } from 'lucide-react';
import { Lang, t } from '../i18n/translations';
import { uploadDocument, listDocuments, deleteDocument } from '../services/kiraApi';

function scaledFontSize(baseSize: number, lang: string): number {
  return lang === 'kn' ? baseSize + 3 : baseSize;
}

const kn = (lang: string) => lang === 'kn';

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
  listening: boolean;
  interimTranscript: string;
  browserSupportsSpeechRecognition: boolean;
  activeAgents: AgentStatus[];
  showAgentList: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

interface Document {
  id: string;
  name: string;
  chunk_count: number;
}

export function RightPanel({
  lang, setLang, chat, input, setInput, onAnalyze, onVoice,
  voiceState, listening, interimTranscript, browserSupportsSpeechRecognition,
  activeAgents, showAgentList, isMuted, onToggleMute,
}: RightPanelProps) {
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    listDocuments()
      .then(r => setDocuments(r.documents || []))
      .catch(() => {});
  }, []);

  const handleUpload = async (file: File) => {
    setUploadState('uploading');
    setUploadError(null);
    try {
      const doc = await uploadDocument(file);
      setDocuments(prev => [{ id: doc.id, name: doc.name, chunk_count: doc.chunk_count }, ...prev]);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadState('idle');
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch {
      // silent — doc list will be inconsistent until refresh, acceptable
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat, interimTranscript]);

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

  const agentStatusColor = (status: AgentStatus['status']) => {
    if (status === 'complete') return 'var(--accent-green, #2ECC71)';
    if (status === 'running') return 'var(--accent-blue, #4D9EF5)';
    return 'var(--text-muted, #8B9EB5)';
  };

  return (
    <div style={{
      width: '30%',
      minWidth: 280,
      background: 'var(--bg-surface, #0D1117)',
      borderLeft: '1px solid var(--border-default, #243447)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: '1px solid var(--border-default, #243447)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontSize: 14, fontWeight: 800,
              color: 'var(--accent-blue, #4D9EF5)',
              letterSpacing: '0.08em',
            }}>
              KIRA <span style={{ fontWeight: 400, color: 'var(--text-secondary, #94A3B8)' }}>— {t('conversationalAI', lang)}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary, #64748B)', marginTop: 2, letterSpacing: '0.04em' }}>
              {t('policeIntelligence', lang)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#2ECC71', display: 'inline-block', boxShadow: '0 0 6px rgba(46,204,113,0.6)' }} />
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2ECC71', fontWeight: 600, letterSpacing: '0.08em' }}>{t('online', lang)}</span>
              {isMuted && (
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#D9827E', fontWeight: 700, letterSpacing: '0.1em', background: 'rgba(220,38,38,0.12)', padding: '2px 5px', borderRadius: 3 }}>
                  🔇 MUTED
                </span>
              )}
            </div>
            {/* Language toggle + mute button */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                onClick={onToggleMute}
                title={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
                style={{
                  background: isMuted ? 'rgba(220,38,38,0.15)' : 'transparent',
                  border: `1px solid ${isMuted ? '#C24A4A' : 'var(--border-default, #243447)'}`,
                  borderRadius: 4, padding: '3px 7px', cursor: 'pointer',
                  color: isMuted ? '#D9827E' : 'var(--text-tertiary, #64748B)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
              {(['en', 'kn'] as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    background: lang === l ? 'var(--accent-blue, #4D9EF5)' : 'transparent',
                    color: lang === l ? '#fff' : 'var(--text-tertiary, #64748B)',
                    border: `1px solid ${lang === l ? 'var(--accent-blue, #4D9EF5)' : 'var(--border-default, #243447)'}`,
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

      {/* Browser unsupported banner */}
      {!browserSupportsSpeechRecognition && (
        <div style={{
          background: 'rgba(245, 166, 35, 0.08)',
          borderBottom: '1px solid rgba(245, 166, 35, 0.25)',
          padding: '6px 14px',
          fontSize: 11,
          color: 'var(--risk-medium-text, #FCD34D)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}>
          <MicOff size={12} />
          Voice input requires Chrome or Edge
        </div>
      )}

      {/* Chat area */}
      <div
        ref={chatRef}
        className="chat-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--bg-base, #080C14)',
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {chat.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'officer' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 6 }}>
            {msg.role === 'ai' && (
              <Shield size={14} color="var(--accent-blue, #4D9EF5)" style={{ flexShrink: 0, marginTop: 3 }} />
            )}
            <div style={{
              maxWidth: '82%',
              background: msg.role === 'officer' ? 'var(--bg-overlay, #111827)' : 'transparent',
              borderLeft: msg.role === 'officer' ? '2px solid var(--border-default, #243447)' : undefined,
              color: msg.role === 'officer' ? 'var(--text-primary, #E8EDF2)' : '#93C5FD',
              fontSize: scaledFontSize(13, lang),
              lineHeight: kn(lang) ? 1.9 : 1.7,
              fontFamily: kn(lang) ? "'Noto Sans Kannada', 'Inter', sans-serif" : undefined,
              padding: msg.role === 'officer' ? '10px 14px' : '4px 0',
              borderRadius: msg.role === 'officer' ? '0 6px 6px 0' : 0,
            }}>
              {msg.text}
              {msg.isVoice && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 6, fontSize: 10, color: 'var(--text-tertiary, #64748B)' }}>
                  <Mic size={9} />
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Interim transcript — shows what's being heard in real-time */}
        {listening && interimTranscript && (
          <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 6 }}>
            <div style={{
              maxWidth: '82%',
              background: 'rgba(240, 78, 78, 0.06)',
              borderLeft: '2px solid rgba(240, 78, 78, 0.4)',
              color: 'var(--text-secondary, #94A3B8)',
              fontSize: scaledFontSize(13, lang),
              lineHeight: kn(lang) ? 1.9 : 1.7,
              fontFamily: kn(lang) ? "'Noto Sans Kannada', 'Inter', sans-serif" : undefined,
              padding: '10px 14px',
              borderRadius: '0 6px 6px 0',
              fontStyle: 'italic',
            }}>
              {interimTranscript}
            </div>
          </div>
        )}

        {/* Listening strip */}
        {listening && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '8px 12px', marginTop: 4,
            background: 'rgba(240, 78, 78, 0.06)',
            border: '1px solid rgba(240, 78, 78, 0.2)',
            borderRadius: 6,
          }}>
            <span className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#F04E4E', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--risk-high-text, #FCA5A5)', fontWeight: 600, letterSpacing: '0.12em' }}>
              {lang === 'kn' ? 'ಕೇಳುತ್ತಿದ್ದೇನೆ' : 'LISTENING'} · {t('tapToStop', lang)}
            </span>
          </div>
        )}

        {voiceState === 'processing' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue, #4D9EF5)', fontWeight: 600, letterSpacing: '0.08em' }}>
              {t('processing', lang)}
            </span>
          </div>
        )}
      </div>

      {/* Agent status or quick prompts */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-subtle, #1E2D3D)', flexShrink: 0 }}>
        {showAgentList && activeAgents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {activeAgents.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  className={a.status === 'running' ? 'agent-spin' : undefined}
                  style={{
                    fontSize: 10,
                    color: agentStatusColor(a.status),
                    fontFamily: 'var(--font-mono)',
                    display: 'inline-block',
                    width: 14,
                    textAlign: 'center',
                    lineHeight: 1,
                  }}
                >
                  {a.status === 'complete' ? '✓' : a.status === 'running' ? '⟳' : '○'}
                </span>
                <span style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: agentStatusColor(a.status),
                  letterSpacing: '0.02em',
                }}>
                  {a.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{ fontSize: 9, color: 'var(--text-tertiary, #64748B)', fontWeight: 600, letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
              {t('quickPrompts', lang)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setInput(p)}
                  style={{
                    background: 'var(--bg-raised, #131920)',
                    border: '1px solid var(--border-subtle, #1E2D3D)',
                    borderRadius: 9999,
                    padding: '6px 10px',
                    fontSize: scaledFontSize(12, lang),
                    fontFamily: kn(lang) ? "'Noto Sans Kannada', 'Inter', sans-serif" : undefined,
                    color: 'var(--text-tertiary, #64748B)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    height: kn(lang) ? 46 : 40,
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: 1,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-blue, #4D9EF5)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-blue, #4D9EF5)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle, #1E2D3D)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary, #64748B)';
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Document RAG strip */}
      <div style={{
        padding: '6px 12px 8px',
        borderTop: '1px solid var(--border-subtle, #1E2D3D)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: documents.length > 0 ? 5 : 0 }}>
          <span style={{ fontSize: 9, color: 'var(--text-tertiary, #64748B)', fontWeight: 600, letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
            DOCS · RAG
          </span>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadState === 'uploading'}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle, #1E2D3D)',
              borderRadius: 4,
              padding: '2px 8px',
              cursor: uploadState === 'uploading' ? 'wait' : 'pointer',
              fontSize: 10,
              color: 'var(--text-tertiary, #64748B)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              opacity: uploadState === 'uploading' ? 0.6 : 1,
            }}
          >
            <Paperclip size={10} />
            {uploadState === 'uploading' ? 'Indexing…' : 'Upload PDF'}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = '';
          }}
        />
        {uploadError && (
          <div style={{ fontSize: 10, color: '#F04E4E', marginTop: 3 }}>{uploadError}</div>
        )}
        {documents.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {documents.map(doc => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'var(--bg-raised, #131920)',
                border: '1px solid var(--border-subtle, #1E2D3D)',
                borderRadius: 9999,
                padding: '3px 6px 3px 8px',
                fontSize: 10,
                color: 'var(--text-secondary, #94A3B8)',
                maxWidth: 160,
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>
                  {doc.name.replace(/\.pdf$/i, '')}
                </span>
                <span style={{ fontSize: 9, color: 'var(--text-tertiary, #64748B)', flexShrink: 0 }}>
                  {doc.chunk_count}c
                </span>
                <button
                  onClick={() => handleDeleteDoc(doc.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0 0 0 2px', color: 'var(--text-tertiary, #64748B)',
                    display: 'flex', alignItems: 'center', flexShrink: 0,
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={{
        padding: '10px 12px 12px',
        borderTop: '1px solid var(--border-default, #243447)',
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
            background: 'var(--bg-base, #080C14)',
            border: '1px solid var(--border-default, #243447)',
            borderRadius: 8,
            color: 'var(--text-primary, #E8EDF2)',
            fontSize: scaledFontSize(14, lang),
            padding: '10px 12px',
            resize: 'none',
            outline: 'none',
            fontFamily: kn(lang) ? "'Noto Sans Kannada', 'Inter', sans-serif" : 'inherit',
            lineHeight: kn(lang) ? 1.8 : 1.5,
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          {/* Voice button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <button
              onClick={onVoice}
              disabled={!browserSupportsSpeechRecognition}
              className={listening ? 'mic-listening' : undefined}
              style={{
                width: 48, height: 48,
                borderRadius: '50%',
                background: listening ? 'rgba(240, 78, 78, 0.15)' : 'var(--bg-raised, #243447)',
                border: listening ? '1px solid rgba(240, 78, 78, 0.5)' : '1px solid var(--border-default, #4A5C70)',
                cursor: browserSupportsSpeechRecognition ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s, border-color 0.2s',
                opacity: browserSupportsSpeechRecognition ? 1 : 0.4,
              }}
            >
              <Mic size={18} color={listening ? '#F04E4E' : 'var(--accent-blue, #4D9EF5)'} />
            </button>
            <span style={{ fontSize: 9, color: 'var(--text-tertiary, #64748B)', fontFamily: 'var(--font-mono)' }}>
              {listening ? (lang === 'kn' ? 'ನಿಲ್ಲಿಸಿ' : 'STOP') : t('voice', lang)}
            </span>
          </div>
          {/* Analyze button */}
          <button
            onClick={onAnalyze}
            style={{
              flex: 1,
              height: 48,
              background: '#1D4ED8',
              color: '#fff',
              fontSize: scaledFontSize(14, lang),
              fontFamily: kn(lang) ? "'Noto Sans Kannada', 'Inter', sans-serif" : undefined,
              fontWeight: 600,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background 0.15s',
              letterSpacing: kn(lang) ? '0' : '0.02em',
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
