import { Field, Input, Row } from "../ui";
import type { SiteContent } from "../../../types";

export default function ContactTab({ data, setData }: { data: SiteContent; setData:(d:SiteContent)=>void }) {
  return (
    <section className="card p-4">
      <h2 className="text-xl font-semibold mb-3">Contacto</h2>
      <Row>
        <Field label="Teléfono">
          <Input value={data.contact.phone} onChange={e=>setData({...data, contact:{...data.contact, phone:e.target.value}})} />
        </Field>
        <Field label="WhatsApp (wa.me o número)">
          <Input value={data.contact.whatsapp} onChange={e=>setData({...data, contact:{...data.contact, whatsapp:e.target.value}})} />
        </Field>
      </Row>
      <Row>
        <Field label="Email">
          <Input type="email" value={data.contact.email} onChange={e=>setData({...data, contact:{...data.contact, email:e.target.value}})} />
        </Field>
        <Field label="Map URL (Google Maps embed o link)">
          <Input type="url" value={data.contact.mapUrl||""} onChange={e=>setData({...data, contact:{...data.contact, mapUrl:e.target.value||undefined}})} />
        </Field>
      </Row>
      <Field label="Dirección">
        <Input value={data.contact.address||""} onChange={e=>setData({...data, contact:{...data.contact, address:e.target.value}})} />
      </Field>
    </section>
  );
}
