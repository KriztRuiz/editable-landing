import { useState } from "react";
import { apiLogin } from "./api";
import { Btn, Field, Input } from "./ui";

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("CambiaEsto123");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token } = await apiLogin(email, password);
      onLogin(token);
    } catch (e: any) {
      // Si la API responde con 401 (credenciales incorrectas),
      // mostramos un mensaje específico en lugar de un texto genérico.
      if (e?.status === 401 || (typeof e?.message === 'string' && e.message.includes('401'))) {
        setError("Usuario o contraseña incorrecta");
      } else {
        setError(e?.message || "Error de autenticación");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-md card p-6">
        <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <div className="mt-3">
          <Field label="Contraseña">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>
        {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl font-semibold bg-black text-white"
            disabled={busy}
          >
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
