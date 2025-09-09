// abogado-aguilar-frontend/src/components/help/HelpPanel.tsx
import { useState, useEffect } from 'react';
import { fetchFaqs, createTicket, createChatSession, sendChatMessage } from '../../lib/helpApi';
import ChatComponent from './ChatComponent';
import ContactForm from './ContactForm';

export default function HelpPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'faq' | 'chat' | 'contact'>('faq');
  const [faqs, setFaqs] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (tab === 'faq') {
      fetchFaqs(query).then(setFaqs);
    }
  }, [query, tab]);

  return (
    <div className="fixed bottom-16 right-4 w-80 max-h-[80vh] overflow-y-auto bg-white border rounded-lg shadow-xl z-50">
      <div className="flex justify-between items-center border-b p-2">
        <div className="space-x-2">
          <button onClick={() => setTab('faq')}>FAQ</button>
          <button onClick={() => setTab('chat')}>Chat</button>
          <button onClick={() => setTab('contact')}>Contacto</button>
        </div>
        <button onClick={onClose}>×</button>
      </div>

      {tab === 'faq' && (
        <div className="p-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar…"
            className="w-full border p-1 mb-2 rounded"
          />
          <ul className="space-y-2">
            {faqs.map((faq: any) => (
              <li key={faq._id} className="border rounded p-2">
                <details>
                  <summary className="font-semibold cursor-pointer">{faq.question}</summary>
                  <p className="mt-1 text-sm">{faq.answer}</p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'chat' && (
        <ChatComponent
          createSession={createChatSession}
          sendMessage={sendChatMessage}
        />
      )}

      {tab === 'contact' && (
        <ContactForm submitTicket={createTicket} />
      )}
    </div>
  );
}
