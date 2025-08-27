import { ArrayEditor, Field, Input, Row, Textarea } from "../ui";
import type { SiteContent, Testimonial } from "../../../types";

export default function TestimonialsTab({ data, setData }: { data: SiteContent; setData:(d:SiteContent)=>void }) {
  return (
    <ArrayEditor<Testimonial>
      title="Testimonios"
      items={data.testimonials}
      onChange={(arr)=>setData({...data, testimonials:arr})}
      emptyItem={{ author:"", text:"", rating:undefined }}
      render={(item,_i,update)=>(
        <div className="space-y-2">
          <Row>
            <Field label="Autor"><Input value={item.author} onChange={e=>update({author:e.target.value})} /></Field>
            <Field label="Calificación (1-5)"><Input type="number" min={1} max={5} value={(item.rating as any) ?? ""} onChange={e=>update({rating: e.target.value===""?undefined:Number(e.target.value)})} /></Field>
          </Row>
          <Field label="Texto"><Textarea value={item.text} onChange={e=>update({text:e.target.value})} /></Field>
        </div>
      )}
    />
  );
}
