import { Field, Input, Row } from "../ui";
import type { SiteContent } from "../../../types";

export default function CtaTab({ data, setData }: { data: SiteContent; setData:(d:SiteContent)=>void }) {
  return (
    <section className="card p-4">
      <h2 className="text-xl font-semibold mb-3">CTA</h2>
      <Row>
        <Field label="Preferida">
          <select
            value={data.cta.preferred}
            onChange={e=>setData({...data, cta:{...data.cta, preferred:e.target.value as "whatsapp"|"call"|"agenda"}})}
            className="w-full rounded-lg border border-black/20 px-3 py-2"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="call">Llamar</option>
            <option value="agenda">Agenda</option>
          </select>
        </Field>
        <Field label="Booking URL (si usas 'agenda')">
          <Input type="url" value={data.cta.bookingUrl||""} onChange={e=>setData({...data, cta:{...data.cta, bookingUrl:e.target.value||undefined}})} />
        </Field>
      </Row>
      <Field label="Mensaje prellenado de WhatsApp">
        <Input value={data.cta.whatsappMessage||""} onChange={e=>setData({...data, cta:{...data.cta, whatsappMessage:e.target.value}})} />
      </Field>
    </section>
  );
}
