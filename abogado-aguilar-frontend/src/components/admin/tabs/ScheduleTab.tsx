import { ArrayEditor, Field, Input, Row } from "../ui";
import type { SiteContent, Schedule } from "../../../types";

export default function ScheduleTab({ data, setData }: { data: SiteContent; setData:(d:SiteContent)=>void }) {
  return (
    <ArrayEditor<Schedule>
      title="Horario"
      items={data.schedule}
      onChange={(arr)=>setData({...data, schedule:arr})}
      emptyItem={{ days:"", open:"", close:"" }}
      render={(item,_i,update)=>(
        <Row>
          <Field label="Días"><Input value={item.days} onChange={e=>update({days:e.target.value})} /></Field>
          <Field label="Abre"><Input value={item.open} onChange={e=>update({open:e.target.value})} /></Field>
          <Field label="Cierra"><Input value={item.close} onChange={e=>update({close:e.target.value})} /></Field>
        </Row>
      )}
    />
  );
}
