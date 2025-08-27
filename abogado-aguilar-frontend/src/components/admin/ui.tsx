import {
  type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes
} from "react";

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-semibold mb-3">{children}</h2>;
}
export function Row({ children }: { children: ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-3">{children}</div>;
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-black/70">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-lg border border-black/20 px-3 py-2 ${props.className||""}`} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-lg border border-black/20 px-3 py-2 min-h-[96px] ${props.className||""}`} />;
}
export function Btn(
  { children, kind="default", ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: "default"|"primary"|"danger" }
) {
  const styles = kind==="primary" ? "bg-black text-white hover:opacity-90"
    : kind==="danger" ? "bg-red-600 text-white hover:opacity-90"
    : "bg-black/5 hover:bg-black/10";
  return <button type="button" {...rest} className={`px-4 py-2 rounded-xl font-semibold ${styles} disabled:opacity-50`}>{children}</button>;
}
export function Badge({ children }: { children: ReactNode }) {
  return <span className="text-xs px-2 py-1 rounded-full bg-black/5">{children}</span>;
}
export function CSV(
  { value, onChange, placeholder }:
  { value: string[]; onChange: (arr: string[])=>void; placeholder?: string }
) {
  return (
    <Input
      placeholder={placeholder || "separa por comas"}
      value={value.join(", ")}
      onChange={(e)=>onChange(e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}
    />
  );
}
export function ArrayEditor<T extends Record<string, any>>(
  { items, onChange, render, emptyItem, title }:
  { items: T[]; onChange: (arr:T[])=>void;
    render: (item:T, i:number, update:(patch:Partial<T>)=>void, remove:()=>void)=>ReactNode;
    emptyItem: T; title: string; }
) {
  const list = items || [];
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <H2>{title}</H2>
        <Btn onClick={()=>onChange([...list, JSON.parse(JSON.stringify(emptyItem))])}>+ Agregar</Btn>
      </div>
      <div className="space-y-4">
        {list.map((item, i)=>{
          const update = (patch: Partial<T>)=>{
            const clone = list.slice();
            clone[i] = { ...clone[i], ...patch };
            onChange(clone);
          };
          const remove = ()=>onChange(list.filter((_, idx)=>idx!==i));
          return (
            <div key={i} className="border border-black/10 rounded-xl p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <Badge>#{i+1}</Badge><Btn kind="danger" onClick={remove}>Eliminar</Btn>
              </div>
              {render(item, i, update, remove)}
            </div>
          );
        })}
        {!list.length && <p className="text-sm text-black/60">Sin elementos.</p>}
      </div>
    </section>
  );
}
