import { useState } from "react";
import { apiLogin } from "./api";
import { Btn } from "./ui";

export default function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await apiLogin(email, password);
      onLoggedIn();
    } catch (e: any) {
      setErr(e?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-xl py-10 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Entrar al panel</h1>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        {err && <p className="text-sm text-red-600">{err}</p>}

        <Btn kind="primary" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </Btn>
      </form>
    </div>
  );
}
