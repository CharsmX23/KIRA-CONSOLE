export interface WorkspaceSignal {
  workspace: string;
  action: string;
  entity: string | null;
  agentsRunning: string[];
  confidence: number;
  lang: string;
}

export function sendChat(
  query: string,
  sessionId: string,
  lang: string,
  onSignal: (signal: WorkspaceSignal) => void,
  onNarration: (text: string, lang: string) => void,
  onDone: (sessionId: string) => void,
): void;
