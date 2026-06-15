import { useState, useRef, useCallback } from 'react';
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
import { EntityDrawer } from './components/drawers/EntityDrawer';
import { EvidenceDrawer } from './components/drawers/EvidenceDrawer';
import { Lang, t } from './i18n/translations';
import { INITIAL_CHAT, RECENT_ARRESTS } from './data';

// --------------- types ---------------
type WorkspaceType = 'supervision' | 'suspect' | 'case' | 'evidence_review' | 'network' | 'trend' | 'arrests' | 'today_cases';

interface ChatMessage { role: 'officer' | 'ai'; text: string; isVoice?: boolean; }
interface AgentStatus { name: string; status: 'pending' | 'running' | 'complete'; }
interface InvestigationProgress {
  modeActivated: boolean; profileLoaded: boolean; casesLoaded: boolean;
  evidenceLoaded: boolean; evidenceNodesShown: number;
  networkLoaded: boolean; recommendationLoaded: boolean;
}

// --------------- stage sequence ---------------
const buildStages = (lang: Lang) => [
  { agent: 'Router Agent', narration: { en: 'Query received. Activating investigation mode.', kn: 'ಪ್ರಶ್ನೆ ಸ್ವೀಕೃತ. ತನಿಖಾ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗುತ್ತಿದೆ.' }, duration: 600, apply: (p: InvestigationProgress) => ({ ...p, modeActivated: true }) },
  { agent: 'Suspect Agent', narration: { en: 'R. Mehta is a repeat offender linked to Cluster K-7. Risk: HIGH.', kn: 'R. ಮೆಹ್ತಾ ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿ, Cluster K-7ಗೆ ಸಂಬಂಧಿಸಿದ. ಅಪಾಯ: ಹೆಚ್ಚು.' }, duration: 1400, apply: (p: InvestigationProgress) => ({ ...p, profileLoaded: true }) },
  { agent: 'Case Agent', narration: { en: 'Cross-referencing case records. Two active investigations found — KS1207, KS1189.', kn: 'ಪ್ರಕರಣ ದಾಖಲೆಗಳ ಹೋಲಿಕೆ. ಎರಡು ಸಕ್ರಿಯ ತನಿಖೆಗಳು — KS1207, KS1189.' }, duration: 1400, apply: (p: InvestigationProgress) => ({ ...p, casesLoaded: true }) },
  { agent: 'Evidence Agent', narration: { en: 'Reconstructing evidence chain from CCTV, vehicle, phone, and financial records.', kn: 'CCTV, ವಾಹನ, ಫೋನ್ ಮತ್ತು ಹಣಕಾಸು ದಾಖಲೆಗಳಿಂದ ಸಾಕ್ಷ್ಯ ಸರಣಿ ಮರುನಿರ್ಮಾಣ.' }, duration: 2200, apply: (p: InvestigationProgress) => ({ ...p, evidenceLoaded: true }) },
  { agent: 'Network Agent', narration: { en: 'Mapping criminal associations. 7-member structure detected — Cluster K-7.', kn: 'ಅಪರಾಧ ಸಂಬಂಧಗಳ ಮ್ಯಾಪಿಂಗ್. 7-ಸದಸ್ಯ ರಚನೆ ಪತ್ತೆ — Cluster K-7.' }, duration: 1400, apply: (p: InvestigationProgress) => ({ ...p, networkLoaded: true }) },
  { agent: 'Recommendation Agent', narration: { en: 'Analysis complete. Recommendation: monitor financial transactions, coordinate with cybercrime cell.', kn: 'ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣ. ಶಿಫಾರಸು: ಹಣಕಾಸು ವಹಿವಾಟು ಮೇಲ್ವಿಚಾರಣೆ, ಸೈಬರ್ ಕೋಶದೊಂದಿಗೆ ಸಮನ್ವಯ.' }, duration: 1400, apply: (p: InvestigationProgress) => ({ ...p, recommendationLoaded: true }) },
];

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const RESET_PROGRESS: InvestigationProgress = {
  modeActivated: false, profileLoaded: false, casesLoaded: false,
  evidenceLoaded: false, evidenceNodesShown: 0, networkLoaded: false, recommendationLoaded: false,
};

function routeQuery(query: string): { ws: WorkspaceType; label: string; subject?: string } {
  const q = query.toLowerCase();
  if (q.includes('arrest')) return { ws: 'arrests', label: 'Recent Arrests' };
  if (q.includes('cases today') || q.includes('active cases')) return { ws: 'today_cases', label: 'Cases Filed Today' };
  if (q.includes('network') || q.includes('cluster') || q.includes('gang') || q.includes('narcotics')) return { ws: 'network', label: 'Network' };
  if (q.includes('cyber fraud') || q.includes('trend') || q.includes('cybercrime')) return { ws: 'trend', label: 'Trend Analysis' };
  if (q.includes('evidence fail') || q.includes('why did evidence') || q.includes('evidence review')) return { ws: 'evidence_review', label: 'Evidence Review' };
  if (q.includes('whitefield') || q.includes('hotspot') || q.includes('emerging')) return { ws: 'supervision', label: 'Supervision' };
  // Default: suspect workspace for anything person-related
  return { ws: 'suspect', label: 'Suspect', subject: 'R. Mehta' };
}

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [workspace, setWorkspace] = useState<WorkspaceType>('supervision');
  const [workspaceLabel, setWorkspaceLabel] = useState('Supervision');
  const [subjectName, setSubjectName] = useState<string | undefined>(undefined);
  const [caseId, setCaseId] = useState<string>('KS1207');
  const [chat, setChat] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [input, setInput] = useState('');
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'transcribing' | 'processing'>('idle');
  const [isVoice, setIsVoice] = useState(false);
  const [progress, setProgress] = useState<InvestigationProgress>(RESET_PROGRESS);
  const [activeAgents, setActiveAgents] = useState<AgentStatus[]>([]);
  const [showAgentList, setShowAgentList] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [evidenceDrawer, setEvidenceDrawer] = useState<string | null>(null);
  const [entityDrawer, setEntityDrawer] = useState<string | null>(null);

  const replayRef = useRef<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  // TODO: Replace this client-side simulation with a FastAPI SSE stream.
  // Backend emits: {"event":"profile_complete","data":{...}}
  //                {"event":"cases_complete","data":{...}}
  //                {"event":"evidence_node","data":{index, ...}}  (x6)
  //                {"event":"network_complete","data":{...}}
  //                {"event":"recommendation_complete","data":{...}}
  const runInvestigationReplay = useCallback(async (voiceMode: boolean) => {
    replayRef.current = true;
    setProgress(RESET_PROGRESS);
    const stages = buildStages(lang);
    const agents = stages.map(s => ({ name: s.agent, status: 'pending' as const }));
    setActiveAgents(agents);
    setShowAgentList(true);

    for (let i = 0; i < stages.length; i++) {
      if (!replayRef.current) break;
      const stage = stages[i];

      setActiveAgents(prev => prev.map((a, idx) => idx === i ? { ...a, status: 'running' } : a));
      setChat(prev => [...prev, { role: 'ai', text: stage.narration[lang], isVoice: voiceMode }]);

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

  const handleAnalyze = useCallback(async () => {
    const query = input.trim();
    if (!query) return;

    replayRef.current = false;
    await sleep(50);

    setChat(prev => [...prev, { role: 'officer', text: query }]);
    setInput('');

    const route = routeQuery(query);
    setWorkspace(route.ws);
    setWorkspaceLabel(route.label);
    setSubjectName(route.subject);

    if (route.ws === 'supervision') {
      setChat(prev => [...prev, { role: 'ai', text: 'Displaying supervision overview with current hotspot analysis.' }]);
      return;
    }

    if (route.ws === 'suspect') {
      setIsVoice(false);
      await runInvestigationReplay(false);
    } else {
      const responses: Record<string, string> = {
        arrests: 'Displaying recent arrest log. 6 records retrieved.',
        today_cases: 'Loading cases filed today. 6 active cases found.',
        network: 'Mapping Cluster K-7 network. 7 members, 3 levels identified.',
        trend: 'Loading trend analysis. Cybercrime up 22%, financial fraud up 17% projected.',
        evidence_review: 'Loading evidence review for Case KS1176. 4 weaknesses identified.',
      };
      setChat(prev => [...prev, { role: 'ai', text: responses[route.ws] ?? 'Loading workspace...' }]);
    }
  }, [input, runInvestigationReplay]);

  const handleVoice = useCallback(async () => {
    if (voiceState !== 'idle') return;

    const greeting = lang === 'kn'
      ? 'ಹೌದು ಸರ್, ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ — ಮುಂದುವರಿಸಿ.'
      : "Yes, Officer. I'm listening — go ahead.";

    setChat(prev => [...prev, { role: 'ai', text: greeting }]);
    if (window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(greeting);
      utter.lang = lang === 'kn' ? 'kn-IN' : 'en-IN';
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    }

    setVoiceState('listening');

    await sleep(2000);
    setVoiceState('transcribing');
    await sleep(1000);
    setVoiceState('processing');

    // Simulate transcription → query about R. Mehta
    const voiceQuery = lang === 'kn' ? 'R. ಮೆಹ್ತಾ ಬಗ್ಗೆ ತಿಳಿಸಿ' : 'Tell me about R. Mehta';
    setInput(voiceQuery);
    setChat(prev => [...prev, { role: 'officer', text: voiceQuery, isVoice: true }]);

    setVoiceState('idle');
    setWorkspace('suspect');
    setWorkspaceLabel('Suspect');
    setSubjectName('R. Mehta');
    setIsVoice(true);

    replayRef.current = false;
    await sleep(50);
    await runInvestigationReplay(true);
    setInput('');
  }, [voiceState, lang, runInvestigationReplay]);

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

  // Quick prompt handler: map prompt text to query
  const handleSetInput = useCallback((text: string) => {
    setInput(text);
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden',
      background: '#060A12',
    }}>
      <Header
        lang={lang}
        workspace={workspace}
        workspaceLabel={workspaceLabel}
        subjectName={subjectName}
        onBack={handleBack}
      />

      {/* Main split layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* LEFT PANEL — 70% */}
        <div style={{ flex: 7, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {workspace === 'supervision' && <SupervisionWorkspace lang={lang} />}

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
        <div style={{ width: 1, background: '#1E2D45', flexShrink: 0 }} />

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
          activeAgents={activeAgents}
          showAgentList={showAgentList}
        />
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
