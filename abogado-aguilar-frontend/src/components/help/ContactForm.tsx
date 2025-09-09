// abogado-aguilar-frontend/src/components/help/ContactForm.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';

interface ContactFormProps {
  submitTicket: (data: { name: string; email: string; message: string }) => Promise<any>;
}

export default function ContactForm({ submitTicket }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Por favor rellena todos los campos.');
      return;
    }

    try {
      await submitTicket({ name, email, message });
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setError('Hubo un problema al enviar tu solicitud. Intenta de nuevo más tarde.');
    }
  };

  if (success) {
    return (
      <div className="p-4">
        <p className="text-green-600">¡Gracias! Tu mensaje se ha enviado correctamente.</p>
        <button className="mt-4 underline text-blue-600" onClick={() => setSuccess(false)}>
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-2 space-y-3">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-semibold">Nombre</label>
        <input
          id="name"
          type="text"
          className="w-full border p-1 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold">Email</label>
        <input
          id="email"
          type="email"
          className="w-full border p-1 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold">Mensaje</label>
        <textarea
          id="message"
          className="w-full border p-1 rounded h-20"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="bg-blue-600 text-white py-2 rounded w-full">
        Enviar
      </button>
    </form>
  );
}
