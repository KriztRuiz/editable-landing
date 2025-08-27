import { ArrayEditor, Field, Input, Row } from "../ui";
import type { SiteContent, FAQ } from "../../../types";

export default function FaqsTab({ data, setData }: { data: SiteContent; setData:(d:SiteContent)=>void }) {
  return (
    <ArrayEditor<FAQ>
      title="Preguntas frecuentes"
      items={data.faqs}
      onChange={(arr)=>setData({...data, faqs:arr})}
      emptyItem={{ q:"", a:"" }}
      render={(item,_i,update)=>(
        <Row>
          <Field label="Pregunta"><Input value={item.q} onChange={e=>update({q:e.target.value})} /></Field>
          <Field label="Respuesta"><Input value={item.a} onChange={e=>update({a:e.target.value})} /></Field>
        </Row>
      )}
    />
  );
}
