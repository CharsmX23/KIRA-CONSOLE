import { useState, useRef, useCallback, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Header } from './components/Header';
import { RightPanel } from './components/RightPanel';
import { Toast } from './components/Toast';
import { SupervisionWorkspace } from './workspaces/SupervisionWorkspace';
import { InvestigationWorkspace } from './workspaces/InvestigationWorkspace';
import { CaseWorkspace } from './workspaces/CaseWorkspace';
import { EvidenceReviewWorkspace } from './workspaces/EvidenceReviewWorkspace';
import { NetworkWorkspace } from './workspaces/NetworkWorkspace';
import { TrendWorkspace } from './workspaces/TrendWorkspace';
import { ArrestsWorkspace } from './workspaces/ArrestsWorkspace';
import { TodayCasesWorkspace } from './workspaces/TodayCasesWorkspace';
import { AuditWorkspace } from './workspaces/AuditWorkspace';
import { EntityDrawer } from './components/drawers/EntityDrawer';
import { EvidenceDrawer } from './components/drawers/EvidenceDrawer';
import { Lang, t } from './i18n/translations';
import { INITIAL_CHAT, RECENT_ARRESTS } from './data';
import { sendChat } from './services/kiraApi';

// --------------- types ---------------
type WorkspaceType = 'supervision' | 'suspect' | 'case' | 'evidence_review' | 'network' | 'trend' | 'arrests' | 'today_cases' | 'audit';

interface ChatMessage { role: 'officer' | 'ai'; text: string; isVoice?: boolean; }
interface AgentStatus { name: string; status: 'pending' | 'running' | 'complete'; }
interface MapAction { lat: number; lng: number; zoom: number; label?: string; }
interface InvestigationProgress {
  modeActivated: boolean; profileLoaded: boolean; casesLoaded: boolean;
  evidenceLoaded: boolean; evidenceNodesShown: number;
  networkLoaded: boolean; recommendationLoaded: boolean;
}

// --------------- module-level constants ---------------
const SESSION_ID = crypto.randomUUID();

const WORKSPACE_LABELS: Record<string, string> = {
  supervision: 'Supervision',
  suspect: 'Suspect',
  case: 'Case',
  network: 'Network',
  evidence: 'Evidence Review',
  evidence_review: 'Evidence Review',
  trend: 'Trend Analysis',
  arrests: 'Recent Arrests',
  today_cases: 'Cases Filed Today',
};

// --------------- stage sequence (used by investigation animation) ---------------
const buildStages = () => [
  { agent: 'Router Agent', narration: { en: 'Query received. Activating investigation mode.', kn: 'ಪ್ರಶ್ನೆ ಸ್ವೀಕೃತ. ತನಿಖಾ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗುತ್ತಿದೆ.' }, duration: 600, apply: (p: InvestigationProgress) => ({ ...p, modeActivated: true }) },
  { agent: 'Suspect Agent', narration: { en: 'R. Mehta is a repeat offender linked to Cluster K-7. Risk: HIGH.', kn: 'R. ಮೆಹ್ತಾ ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿ, Cluster K-7ಗೆ ಸಂಬಂಧಿಸಿದ. ಅಪಾಯ: ಹೆಚ್ಚು.' }, duration: 1400, apply: (p: InvestigationProgress) => ({ ...p, profileLoaded: true }) },
  { agent: 'Case Agent', narration: { en: 'Cross-referencing case records. Two active investigations found — KS1207, KS1189.', kn: 'ಪ್ರಕರಣ ದಾಖಲೆಗಳ ಹೋಲಿಕೆ. ಎರಡು ಸಕ್ರಿಯ ತನಿಖೆಗಳು — KS1207, KS1189.' }, duration: 1400, apply: (p: InvestigationProgress) => ({ ...p, casesLoaded: true }) },
  { agent: 'Evidence Agent', narration: { en: 'Reconstructing evidence chain from CCTV, vehicle, phone, and financial records.', kn: 'CCTV, ವಾಹನ, ಫೋನ್ ಮತ್ತು ಹಣಕಾಸು ದಾಖಲೆಗಳಿಂದ ಸಾಕ್ಷ್ಯ ಸರಣಿ ಮರುನಿರ್ಮಾಣ.' }, duration: 2200, apply: (p: InvestigationProgress) => ({ ...p, evidenceLoaded: true }) },
  { agent: 'Network Agent', narration: { en: 'Mapping criminal associations. 7-member structure detected — Cluster K-7.', kn: 'ಅಪರಾಧ ಸಂಬಂಧಗಳ ಮ್ಯಾಪಿಂಗ್. 7-ಸದಸ್ಯ ರಚನೆ ಪತ್ತೆ — Cluster K-7.' }, duration: 1400, apply: (p: InvestigationProgress) => ({ ...p, networkLoaded: true }) },
  { agent: 'Recommendation Agent', narration: { en: 'Analysis complete. Recommendation: monitor financial transactions, coordinate with cybercrime cell.', kn: 'ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣ. ಶಿಫಾರಸು: ಹಣಕಾಸು ವಹಿವಾಟು ಮೇಲ್ವಿಚಾರಣೆ, ಸೈಬರ್ ಕೋಶದೊಂದಿಗೆ ಸಮನ್ವಯ.' }, duration: 1400, apply: (p: InvestigationProgress) => ({ ...p, recommendationLoaded: true }) },
];

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-•]\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const RESET_PROGRESS: InvestigationProgress = {
  modeActivated: false, profileLoaded: false, casesLoaded: false,
  evidenceLoaded: false, evidenceNodesShown: 0, networkLoaded: false, recommendationLoaded: false,
};

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [workspace, setWorkspace] = useState<WorkspaceType>('supervision');
  const [workspaceLabel, setWorkspaceLabel] = useState('Supervision');
  const [subjectName, setSubjectName] = useState<string | undefined>(undefined);
  const [caseId, setCaseId] = useState<string>('KS1207');
  const [chat, setChat] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [input, setInput] = useState('');
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'transcribing' | 'processing'>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(() => localStorage.getItem('kira_voice_muted') === 'true');
  const [mapAction, setMapAction] = useState<MapAction | null>(null);
  const [isVoice, setIsVoice] = useState(false);
  const [progress, setProgress] = useState<InvestigationProgress>(RESET_PROGRESS);
  const [activeAgents, setActiveAgents] = useState<AgentStatus[]>([]);
  const [showAgentList, setShowAgentList] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [evidenceDrawer, setEvidenceDrawer] = useState<string | null>(null);
  const [entityDrawer, setEntityDrawer] = useState<string | null>(null);

  const replayRef = useRef<boolean>(false);
  const lastSignalWorkspace = useRef<WorkspaceType | null>(null);

  const {
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Queued voice query — set when speech ends, consumed by submitQuery effect
  const pendingVoiceQuery = useRef<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    localStorage.setItem('kira_voice_muted', String(isMuted));
  }, [isMuted]);

  const handleToggleMute = useCallback(() => {
    setIsMuted(m => {
      if (!m && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      return !m;
    });
  }, []);

  // silent=true: run the visual animation (progress + agent pills) without
  // adding per-stage chat messages — used when the backend narration handles chat.
  const runInvestigationReplay = useCallback(async (voiceMode: boolean, silent = false) => {
    replayRef.current = true;
    setProgress(RESET_PROGRESS);
    const stages = buildStages();
    const agents = stages.map(s => ({ name: s.agent, status: 'pending' as const }));
    setActiveAgents(agents);
    setShowAgentList(true);

    for (let i = 0; i < stages.length; i++) {
      if (!replayRef.current) break;
      const stage = stages[i];

      setActiveAgents(prev => prev.map((a, idx) => idx === i ? { ...a, status: 'running' } : a));
      if (!silent) {
        setChat(prev => [...prev, { role: 'ai', text: stage.narration[lang], isVoice: voiceMode }]);
      }

      if (stage.agent === 'Evidence Agent') {
        for (let n = 1; n <= 6; n++) {
          await sleep(280);
          if (!replayRef.current) break;
          setProgress(p => ({ ...p, evidenceNodesShown: n }));
        }
      }

      await sleep(stage.duration);
      if (!replayRef.current) break;

      setProgress(p => stage.apply(p));
      setActiveAgents(prev => prev.map((a, idx) => idx === i ? { ...a, status: 'complete' } : a));
    }

    await sleep(2000);
    setShowAgentList(false);
  }, [lang]);

  // TTS — speak AI narration aloud after voice-initiated queries.
  // Cleans markdown from the text before speaking; the visual chat bubble
  // keeps the original formatted text unchanged. Respects the mute toggle.
  const speakNarration = useCallback((text: string, responseLang: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanedText = cleanTextForSpeech(text);
    const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText];
    sentences.forEach(sentence => {
      const utter = new SpeechSynthesisUtterance(sentence.trim());
      utter.lang = responseLang === 'kn' ? 'kn-IN' : 'en-IN';
      utter.rate = 1.05;
      window.speechSynthesis.speak(utter);
    });
  }, [isMuted]);

  // Core submit logic — shared between text input and voice
  const submitQuery = useCallback((query: string, isVoice = false) => {
    if (!query) return;
    replayRef.current = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setChat(prev => [...prev, { role: 'officer', text: query, isVoice }]);
    setInput('');
    sendChat(
      query,
      SESSION_ID,
      lang,
      (signal: { workspace: string; action: string; entity: string | null; agentsRunning: string[]; confidence: number; lang: string }) => {
        const ws = (signal.workspace === 'evidence' ? 'evidence_review' : signal.workspace) as WorkspaceType;
        lastSignalWorkspace.current = ws;
        setWorkspace(ws);
        setWorkspaceLabel(WORKSPACE_LABELS[ws] ?? ws);
        if (signal.entity) {
          setSubjectName(signal.entity);
          if (ws === 'case') setCaseId(signal.entity);
        }
        if (ws === 'suspect') {
          setIsVoice(isVoice);
          runInvestigationReplay(isVoice, true);
        } else {
          setActiveAgents((signal.agentsRunning ?? []).map((name: string) => ({ name, status: 'running' as const })));
          setShowAgentList(true);
        }
      },
      (text: string, responseLang?: string, mapAct?: MapAction | null) => {
        setChat(prev => [...prev, { role: 'ai', text }]);
        if (isVoice) speakNarration(text, responseLang ?? lang);
        if (mapAct) setMapAction(mapAct);
        if (lastSignalWorkspace.current !== 'suspect') {
          setActiveAgents(prev => prev.map(a => ({ ...a, status: 'complete' as const })));
          setTimeout(() => setShowAgentList(false), 2000);
        }
      },
      (_sessionId: string) => {},
    );
  }, [lang, runInvestigationReplay, speakNarration]);

  const handleAnalyze = useCallback(() => {
    const query = input.trim();
    if (!query) return;
    submitQuery(query, false);
  }, [input, submitQuery]);

  // Voice — push-to-talk toggle
  const handleVoice = useCallback(() => {
    if (!browserSupportsSpeechRecognition) return;
    if (listening) {
      SpeechRecognition.stopListening();
      const q = finalTranscript.trim();
      setVoiceState('idle');
      if (q) submitQuery(q, true);
    } else {
      resetTranscript();
      pendingVoiceQuery.current = null;
      setVoiceState('listening');
      SpeechRecognition.startListening({
        continuous: false,
        language: lang === 'kn' ? 'kn-IN' : 'en-IN',
      });
    }
  }, [listening, finalTranscript, lang, resetTranscript, browserSupportsSpeechRecognition, submitQuery]);

  // Auto-submit when speech stops naturally (continuous=false, browser auto-stops)
  useEffect(() => {
    if (!listening && voiceState === 'listening') {
      const q = finalTranscript.trim();
      setVoiceState('idle');
      if (q) submitQuery(q, true);
    }
  }, [listening]);

  const handleBack = useCallback(() => {
    replayRef.current = false;
    setWorkspace('supervision');
    setWorkspaceLabel('Supervision');
    setSubjectName(undefined);
    setProgress(RESET_PROGRESS);
    setShowAgentList(false);
    setActiveAgents([]);
    setEvidenceDrawer(null);
    setEntityDrawer(null);
  }, []);

  const handleEvidenceClick = useCallback((title: string) => {
    setEntityDrawer(null);
    setEvidenceDrawer(title);
  }, []);

  const handleGangMemberClick = useCallback((name: string) => {
    if (name === 'R. Mehta') return;
    setEvidenceDrawer(null);
    setEntityDrawer(name);
    showToast(`${name} — ${t('fileNotLoaded', lang)}`);
  }, [lang, showToast]);

  const handleEntitySuspectClick = useCallback((name: string) => {
    setEvidenceDrawer(null);
    setEntityDrawer(name);
  }, []);

  const handleCaseClick = useCallback((id: string) => {
    setCaseId(id);
    setWorkspace('case');
    setWorkspaceLabel('Case');
    setSubjectName(id);
    setEvidenceDrawer(null);
    setEntityDrawer(null);
  }, []);

  const handleNetworkNodeClick = useCallback((name: string) => {
    setEntityDrawer(name);
  }, []);

  const handleArrestOpen = useCallback((arrest: typeof RECENT_ARRESTS[0]) => {
    setEntityDrawer(arrest.name);
  }, []);

  const closeDrawers = useCallback(() => {
    setEvidenceDrawer(null);
    setEntityDrawer(null);
  }, []);

  const handleSetInput = useCallback((text: string) => {
    setInput(text);
  }, []);

  const handleExportReport = useCallback(() => {
    const now = new Date();
    const dateStr = now.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });

    const rows = chat.map(msg => {
      const role = msg.role === 'officer' ? 'OFFICER' : 'KIRA AI';
      const voiceTag = msg.isVoice ? ' [voice]' : '';
      const safeText = msg.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<div class="message ${msg.role}"><div class="role">${role}${voiceTag}</div><div class="text">${safeText}</div></div>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>KIRA Intelligence Report — ${dateStr}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Courier New',monospace;background:#fff;color:#111;padding:40px;font-size:13px;line-height:1.6}
.header{border-bottom:3px solid #1a365d;padding-bottom:20px;margin-bottom:28px}
.logo{font-size:20px;font-weight:900;letter-spacing:0.1em;color:#1a365d}
.meta{color:#555;margin-top:10px;line-height:1.9}
.meta span{font-weight:700;color:#222}
.section-title{font-size:10px;font-weight:700;letter-spacing:0.15em;color:#666;border-bottom:1px solid #ddd;padding-bottom:6px;margin:24px 0 16px;text-transform:uppercase}
.message{margin-bottom:18px}
.role{font-size:10px;font-weight:700;letter-spacing:0.12em;margin-bottom:4px}
.officer .role{color:#1a365d}.ai .role{color:#b91c1c}
.text{padding-left:12px;border-left:3px solid}
.officer .text{border-color:#1a365d;color:#222}.ai .text{border-color:#b91c1c;color:#333}
.footer{margin-top:40px;border-top:1px solid #ddd;padding-top:14px;font-size:11px;color:#888}
@media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div class="logo">KIRA CONSOLE — Intelligence Report</div>
  <div class="meta">
    Karnataka State Police · AI Criminal Intelligence System<br/>
    Generated: <span>${dateStr}</span><br/>
    Session: <span>${SESSION_ID}</span><br/>
    Workspace: <span>${workspaceLabel}</span>${subjectName ? `<br/>Subject: <span>${subjectName}</span>` : ''}
  </div>
</div>
<div class="section-title">Conversation Transcript</div>
${rows}
<div class="footer">
  KIRA Console — Karnataka Intelligence &amp; Records Analysis System<br/>
  This document contains sensitive law enforcement information. Handle per departmental guidelines.
</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  }, [chat, subjectName, workspaceLabel]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden',
      background: '#080C14',
    }}>
      <Header
        lang={lang}
        workspace={workspace}
        workspaceLabel={workspaceLabel}
        subjectName={subjectName}
        onBack={handleBack}
        onExportReport={handleExportReport}
        onAudit={() => { setWorkspace('audit'); setWorkspaceLabel('Audit Trail'); setSubjectName(undefined); }}
      />

      {/* Main split layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* LEFT PANEL — 70% */}
        <div style={{ flex: 7, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {workspace === 'supervision' && <SupervisionWorkspace lang={lang} mapAction={mapAction} />}

          {workspace === 'suspect' && (
            <InvestigationWorkspace
              lang={lang}
              progress={progress}
              isVoice={isVoice}
              onEvidenceClick={handleEvidenceClick}
              onGangMemberClick={handleGangMemberClick}
              onActionToast={showToast}
              onCaseClick={handleCaseClick}
            />
          )}

          {workspace === 'case' && <CaseWorkspace lang={lang} caseId={caseId} />}
          {workspace === 'evidence_review' && <EvidenceReviewWorkspace lang={lang} />}
          {workspace === 'network' && <NetworkWorkspace lang={lang} onNodeClick={handleNetworkNodeClick} />}
          {workspace === 'trend' && <TrendWorkspace lang={lang} />}
          {workspace === 'arrests' && <ArrestsWorkspace lang={lang} onOpenDrawer={handleArrestOpen} />}
          {workspace === 'today_cases' && <TodayCasesWorkspace lang={lang} />}
          {workspace === 'audit' && <AuditWorkspace lang={lang} />}

          {/* Evidence Drawer */}
          {evidenceDrawer && (
            <EvidenceDrawer
              evidenceTitle={evidenceDrawer}
              lang={lang}
              onClose={closeDrawers}
              onSuspectClick={handleEntitySuspectClick}
              onCaseClick={handleCaseClick}
              onActionToast={showToast}
            />
          )}

          {/* Entity Drawer */}
          {entityDrawer && !evidenceDrawer && (
            <EntityDrawer
              name={entityDrawer}
              lang={lang}
              onClose={closeDrawers}
              onCaseClick={handleCaseClick}
              onActionToast={showToast}
            />
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: '#243447', flexShrink: 0 }} />

        {/* RIGHT PANEL — 30% */}
        <RightPanel
          lang={lang}
          setLang={setLang}
          chat={chat}
          input={input}
          setInput={handleSetInput}
          onAnalyze={handleAnalyze}
          onVoice={handleVoice}
          voiceState={voiceState}
          listening={listening}
          interimTranscript={interimTranscript}
          browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
          activeAgents={activeAgents}
          showAgentList={showAgentList}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
