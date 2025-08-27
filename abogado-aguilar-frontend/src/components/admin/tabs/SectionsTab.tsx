import type { SiteContent } from "../../../types";

export default function SectionsTab({ data, setData }: { data: SiteContent; setData:(d:SiteContent)=>void }) {
  return (
    <section className="card p-4">
      <h2 className="text-xl font-semibold mb-3">Mostrar/Ocultar secciones</h2>
      <div className="grid md:grid-cols-3 gap-3">
        {Object.entries(data.sections).map(([key,val])=>(
          <label key={key} className="flex items-center gap-2 border border-black/10 rounded-lg p-2 bg-white">
            <input type="checkbox" checked={Boolean(val)} onChange={e=>setData({...data, sections:{...data.sections, [key]: e.target.checked} as SiteContent["sections"]})} />
            <span>{key}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
