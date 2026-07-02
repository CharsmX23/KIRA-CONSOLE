const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Send a query to KIRA conversational AI.
 *
 * onSignal(signal)   → called immediately with workspace routing (~200ms)
 * onNarration(text)  → called with AI response text (~1-2s)
 * onDone(session_id) → called when stream is complete
 */
export function sendChat(query, sessionId, lang, onSignal, onNarration, onDone) {
  fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, session_id: sessionId, lang }),
  }).then(async (res) => {
    const reader = res.body.getReader();
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
            onNarration(msg.text, msg.lang);
          }

          if (msg.event === 'done') {
            onDone(msg.session_id);
          }
        } catch {
          // ignore parse errors on keepalive lines
        }
      }
    }
  });
}
