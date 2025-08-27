import { ArrayEditor, Field, Input, Textarea } from "../ui";
import type { SiteContent, Specialty } from "../../../types";

export default function SpecialtiesTab({ data, setData }: { data: SiteContent; setData:(d:SiteContent)=>void }) {
  return (
    <ArrayEditor<Specialty>
      title="Especialidades"
      items={data.specialties}
      onChange={(arr)=>setData({...data, specialties:arr})}
      emptyItem={{ name:"", description:"" }}
      render={(item,_i,update)=>(
        <div className="space-y-2">
          <Field label="Nombre"><Input value={item.name} onChange={e=>update({name:e.target.value})} /></Field>
          <Field label="Descripción"><Textarea value={item.description||""} onChange={e=>update({description:e.target.value})} /></Field>
        </div>
      )}
    />
  );
}
