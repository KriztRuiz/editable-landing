// abogado-aguilar-frontend/src/components/help/ChatComponent.tsx
import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';

interface ChatComponentProps {
  createSession: () => Promise<{ sessionId: string }>;
  sendMessage: (sessionId: string, userMsg: string) => Promise<{ reply: string }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatComponent({ createSession, sendMessage }: ChatComponentProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    createSession()
      .then(({ sessionId }) => setSessionId(sessionId))
      .catch(() => setError('No se pudo iniciar la sesión de chat.'));
  }, [createSession]);

  const handleSend = async () => {
    if (!sessionId || !userInput.trim()) return;

    const userMsg = userInput.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setUserInput('');
    setLoading(true);

    try {
      const { reply } = await sendMessage(sessionId, userMsg);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Lo siento, ocurrió un error.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-2 flex flex-col h-[calc(60vh-4rem)]">
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 border-b pb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <span
              className={
                msg.role === 'user'
                  ? 'inline-block bg-blue-600 text-white rounded-lg px-2 py-1 max-w-[70%]'
                  : 'inline-block bg-gray-200 rounded-lg px-2 py-1 max-w-[70%]'
              }
            >
              {msg.content}
            </span>
          </div>
        ))}

        {loading && (
          <div className="text-left">
            <span className="inline-block bg-gray-200 rounded-lg px-2 py-1 max-w-[70%] italic text-sm">
              Pensando…
            </span>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <div className="mt-auto flex flex-col">
        <textarea
          className="border rounded p-2 resize-none h-20 mb-2"
          placeholder="Escribe tu pregunta..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          onClick={handleSend}
          disabled={loading || !userInput.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
