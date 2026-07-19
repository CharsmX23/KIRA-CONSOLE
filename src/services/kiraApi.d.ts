export interface MapAction {
  lat: number;
  lng: number;
  zoom: number;
  label?: string;
}

export interface WorkspaceSignal {
  workspace: string;
  action: string;
  entity: string | null;
  agentsRunning: string[];
  confidence: number;
  lang: string;
}

export interface KiraDocument {
  id: string;
  name: string;
  chunk_count: number;
}

export function sendChat(
  query: string,
  sessionId: string,
  lang: string,
  onSignal: (signal: WorkspaceSignal) => void,
  onNarration: (text: string, lang?: string, mapAction?: MapAction | null) => void,
  onDone: (sessionId: string) => void,
): Promise<void>;

export function uploadDocument(file: File): Promise<KiraDocument>;

export function listDocuments(): Promise<{ documents: KiraDocument[] }>;

export function deleteDocument(documentId: string): Promise<{ deleted: string }>;
