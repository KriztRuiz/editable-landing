import { useState } from "react";
import { H2, Textarea } from "../ui";
import type { SiteContent } from "../../../types";

export default function JsonTab({ data, setData }: { data: SiteContent; setData:(d:SiteContent)=>void }) {
  const [err, setErr] = useState<string|null>(null);
  return (
    <section className="card p-4">
      <H2>JSON (avanzado)</H2>
      <Textarea
        className="font-mono min-h-[300px]"
        value={JSON.stringify(data, null, 2)}
        onChange={(e)=>{
          try {
            const parsed = JSON.parse(e.target.value) as SiteContent;
            setData(parsed); setErr(null);
          } catch { setErr("JSON inválido (sin guardar)"); }
        }}
      />
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
    </section>
  );
}
