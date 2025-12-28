// src/components/admin/AdminApp.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { SiteContent } from "../../types";
import { apiGet, apiLogin, apiLogout, apiMe, apiPut, ApiError } from "./api";

type ViewState = "checking" | "login" | "panel";

type Props = {
  siteId: string;
};

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function parseJsonOrThrow<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("JSON inválido. Revisa comas, llaves y comillas.");
  }
}

export default function AdminApp({ siteId }: Props) {
  const [view, setView] = useState<ViewState>("checking");

  // auth
  const [userEmail, setUserEmail] = useState<string>("");

  // login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // content
  const [content, setContent] = useState<SiteContent | null>(null);
  const [draftJson, setDraftJson] = useState<string>("");

  // ui state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  const hasUnsavedChanges = useMemo(() => {
    if (!content) return false;
    return safeStringify(content) !== draftJson;
  }, [content, draftJson]);

  async function loadContent() {
    setError("");
    setNotice("");
    setBusy(true);

    try {
      const data = await apiGet(siteId);
      setContent(data);
      setDraftJson(safeStringify(data));
    } catch (e) {
      // Si expiró la cookie => vuelve a login
      if (e instanceof ApiError && e.status === 401) {
        setUserEmail("");
        setView("login");
        setError("Sesión expirada. Vuelve a iniciar sesión.");
        return;
      }
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function bootstrap() {
    setError("");
    setNotice("");
    setView("checking");

    try {
      const me = await apiMe();

      if (!me.ok) {
        // NO estás logueado: esto es lo normal cuando no hay cookie.
        setView("login");
        return;
      }

      setUserEmail(me.user.email);
      setView("panel");
      await loadContent();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setView("login");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      await apiLogin(email.trim(), password);
      setPassword("");
      await bootstrap();
    } catch (e2) {
      const msg =
        e2 instanceof ApiError && e2.status === 401
          ? "Correo o contraseña incorrectos."
          : e2 instanceof Error
          ? e2.message
          : String(e2);
      setError(msg);
      setView("login");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await apiLogout();
    } finally {
      setBusy(false);
      setUserEmail("");
      setContent(null);
      setDraftJson("");
      setView("login");
    }
  }

  async function handleSave() {
    if (!siteId) return;
    setError("");
    setNotice("");
    setBusy(true);

    try {
      const parsed = parseJsonOrThrow<SiteContent>(draftJson);

      // Asegura consistencia
      (parsed as any).siteId = (parsed as any).siteId ?? siteId;

      const saved = await apiPut(siteId, parsed);
      setContent(saved);
      setDraftJson(safeStringify(saved));
      setNotice("Guardado ✅");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setUserEmail("");
        setView("login");
        setError("Sesión expirada. Vuelve a iniciar sesión.");
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  if (view === "checking") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Panel</h1>
          <p style={styles.muted}>Comprobando sesión…</p>
        </div>
      </div>
    );
  }

  if (view === "login") {
    return (
      <div style={styles.page}>
        <form style={styles.card} onSubmit={handleLogin}>
          <h1 style={styles.title}>Entrar al panel</h1>
          <p style={styles.muted}>
            Site: <b>{siteId}</b>
          </p>

          <label style={styles.label}>Correo</label>
          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            required
          />

          <label style={styles.label}>Contraseña</label>
          <input
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            type="password"
            required
          />

          {error ? <div style={styles.error}>{error}</div> : null}
          {notice ? <div style={styles.notice}>{notice}</div> : null}

          <button style={styles.button} type="submit" disabled={busy}>
            {busy ? "Entrando…" : "Entrar"}
          </button>

          <p style={styles.small}>
            Ver un <code>401</code> en Network al cargar <code>/admin</code> es normal si no hay sesión. Lo
            importante es que la UI no se rompa y puedas iniciar sesión.
          </p>
        </form>
      </div>
    );
  }

  // view === "panel"
  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: 1000 }}>
        <div style={styles.topBar}>
          <div>
            <h1 style={{ ...styles.title, marginBottom: 2 }}>Panel</h1>
            <div style={styles.muted}>
              Site: <b>{siteId}</b> · Usuario: <b>{userEmail}</b>
            </div>
          </div>

          <div style={styles.actions}>
            <button style={styles.secondaryButton} onClick={loadContent} disabled={busy}>
              Recargar
            </button>
            <button style={styles.button} onClick={handleSave} disabled={busy || !draftJson}>
              {busy ? "Guardando…" : hasUnsavedChanges ? "Guardar cambios" : "Guardar"}
            </button>
            <button style={styles.dangerButton} onClick={handleLogout} disabled={busy}>
              Salir
            </button>
          </div>
        </div>

        {error ? <div style={styles.error}>{error}</div> : null}
        {notice ? <div style={styles.notice}>{notice}</div> : null}

        <div style={styles.split}>
          <div style={styles.col}>
            <h2 style={styles.h2}>Editar JSON</h2>
            <textarea
              style={styles.textarea}
              value={draftJson}
              onChange={(e) => setDraftJson(e.target.value)}
              spellCheck={false}
            />
            <div style={styles.muted}>{hasUnsavedChanges ? "Cambios pendientes…" : "Sin cambios pendientes."}</div>
          </div>

          <div style={styles.col}>
            <h2 style={styles.h2}>Resumen</h2>
            <div style={styles.previewBox}>
              {content ? (
                <pre style={styles.pre}>
                  {safeStringify(content).slice(0, 1200)}
                  {safeStringify(content).length > 1200 ? "\n… (recortado)" : ""}
                </pre>
              ) : (
                <div style={styles.muted}>No hay contenido cargado.</div>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <h2 style={styles.h2}>Tips</h2>
              <ul style={styles.ul}>
                <li>
                  Si el backend devuelve <code>401</code>, te regresará al login automáticamente.
                </li>
                <li>
                  Si guardas y no ves cambios en el sitio público, revisa que el frontend consuma{" "}
                  <code>/api/content/public/&lt;site&gt;</code> en runtime (sin prerender).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 24,
    background: "#f3f4f6",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "white",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  topBar: {
    display: "flex",
    gap: 12,
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  actions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: 28, fontWeight: 800, color: "#111827" },
  h2: { margin: "10px 0 8px", fontSize: 16, fontWeight: 700, color: "#111827" },
  muted: { color: "#6b7280", fontSize: 13 },
  small: { color: "#6b7280", fontSize: 12, marginTop: 12, lineHeight: 1.35 },
  label: { display: "block", marginTop: 12, marginBottom: 6, fontWeight: 600, fontSize: 13, color: "#111827" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.15)",
    outline: "none",
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    minHeight: 420,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    outline: "none",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 12,
    lineHeight: 1.35,
  },
  button: {
    marginTop: 16,
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "#111827",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    color: "#111827",
    fontWeight: 700,
    cursor: "pointer",
  },
  dangerButton: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "#b91c1c",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#991b1b",
    fontSize: 13,
  },
  notice: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "#065f46",
    fontSize: 13,
  },
  split: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 16,
  },
  col: { minWidth: 0 },
  previewBox: {
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 12,
    padding: 12,
    background: "#fafafa",
    minHeight: 240,
    overflow: "auto",
  },
  pre: {
    margin: 0,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 12,
    lineHeight: 1.35,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  ul: {
    margin: 0,
    paddingLeft: 18,
    color: "#111827",
    fontSize: 13,
    lineHeight: 1.5,
  },
};
