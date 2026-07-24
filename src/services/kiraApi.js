import { supabase } from '../lib/supabase';

const BASE = import.meta.env.VITE_API_URL || 'https://kiraconsole.development.catalystappsail.in';

async function _authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function uploadDocument(file) {
  const headers = await _authHeaders();
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${BASE}/api/documents`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed (${response.status}): ${text}`);
  }
  return response.json();
}

export async function listDocuments() {
  const response = await fetch(`${BASE}/api/documents`);
  if (!response.ok) throw new Error('Failed to list documents');
  return response.json();
}

export async function deleteDocument(documentId) {
  const headers = await _authHeaders();
  const response = await fetch(`${BASE}/api/documents/${documentId}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) throw new Error('Delete failed');
  return response.json();
}

/**
 * Send a query to KIRA conversational AI.
 *
 * onSignal(signal)                    → called immediately with workspace routing (~200ms)
 * onNarration(text, lang, mapAction)  → called with AI response text (~1-2s)
 * onDone(session_id)                  → called when stream is complete
 */
export async function sendChat(query, sessionId, lang, onSignal, onNarration, onDone) {
  console.log('[KIRA chat] Sending query:', query);

  // Always fetch a fresh session — never use a cached reference from outer scope
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  console.log(
    '[KIRA chat] Session at time of send:', session ? 'EXISTS' : 'MISSING',
    '| error:', sessionError?.message ?? 'none',
    '| token prefix:', session?.access_token ? session.access_token.slice(0, 20) + '…' : 'NONE',
  );

  if (!session) {
    console.error('[KIRA chat] No active session — user needs to re-login');
    onNarration('Session expired. Please sign in again.', lang, null);
    return;
  }

  try {
    console.log('[KIRA step 8] Sending fetch to /api/chat');
    // Sent as a "simple" CORS request (text/plain, no Authorization header) so the browser
    // issues no OPTIONS preflight — the ZGS gateway answers preflights itself and never
    // forwards them to the app, which blocks the request cross-origin. The Supabase token
    // travels in the body and is verified server-side exactly as a header token would be.
    const response = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        query,
        session_id: sessionId,
        lang,
        access_token: session.access_token,
      }),
    });

    console.log('[KIRA step 9] Response status:', response.status);

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[KIRA chat] Request failed:', response.status, errBody);
      onNarration(`Request failed (${response.status}). Please try again.`, lang, null);
      return;
    }

    console.log('[KIRA chat] Starting to read stream');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const msg = JSON.parse(line.slice(6));

          if (msg.event === 'workspace_signal') {
            onSignal({
              workspace: msg.workspace,
              action: msg.action,
              entity: msg.entity,
              agentsRunning: msg.agents_running,
              confidence: msg.confidence,
              lang: msg.lang,
            });
          }

          if (msg.event === 'narration') {
            onNarration(msg.text, msg.lang, msg.map_action || null);
          }

          if (msg.event === 'done') {
            console.log('[KIRA chat] Stream complete — session_id:', msg.session_id);
            onDone(msg.session_id);
          }
        } catch {
          // ignore parse errors on keepalive lines
        }
      }
    }

  } catch (err) {
    console.error('[KIRA chat] Unexpected error during fetch/stream:', err);
    onNarration('Connection error. Please try again.', lang, null);
  }
}
