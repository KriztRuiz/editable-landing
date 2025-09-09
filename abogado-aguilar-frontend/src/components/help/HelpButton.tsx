// abogado-aguilar-frontend/src/components/help/HelpButton.tsx
import { useState } from 'react';
import HelpPanel from './HelpPanel';

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
        onClick={() => setOpen(true)}
        aria-label="Ayuda"
      >
        ?
      </button>
      {open && <HelpPanel onClose={() => setOpen(false)} />}
    </>
  );
}
