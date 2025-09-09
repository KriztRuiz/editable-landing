export async function fetchFaqs(q = '') {
  const res = await fetch(`/api/help/faq?q=${encodeURIComponent(q)}`);
  return res.json();
}
export async function createTicket(data: { name: string; email: string; message: string; }) {
  const res = await fetch('/api/help/ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function createChatSession() {
  const res = await fetch('/api/help/chat/session', { method: 'POST' });
  return res.json();
}
export async function sendChatMessage(sessionId: string, userMsg: string) {
  const res = await fetch('/api/help/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, userMsg }),
  });
  return res.json();
}
