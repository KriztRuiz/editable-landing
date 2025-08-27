import { Field, Input, Row, Textarea } from "../ui";
import type { SiteContent } from "../../../types";

export default function ProfileTab({ data, setData }: { data: SiteContent; setData: (d:SiteContent)=>void }) {
  return (
    <section className="card p-4">
      <h2 className="text-xl font-semibold mb-3">Perfil</h2>
      <Row>
        <Field label="Nombre completo">
          <Input value={data.profile.fullName} onChange={e=>setData({...data, profile:{...data.profile, fullName:e.target.value}})} />
        </Field>
        <Field label="Cédula">
          <Input value={data.profile.licenseId||""} onChange={e=>setData({...data, profile:{...data.profile, licenseId:e.target.value}})} />
        </Field>
      </Row>
      <Row>
        <Field label="Titular (headline)">
          <Input value={data.profile.headline||""} onChange={e=>setData({...data, profile:{...data.profile, headline:e.target.value}})} />
        </Field>
        <Field label="Foto (URL)">
          <Input type="url" value={data.profile.photoUrl||""} onChange={e=>setData({...data, profile:{...data.profile, photoUrl:e.target.value||undefined}})} />
        </Field>
      </Row>
      <Field label="Intro">
        <Textarea value={data.profile.intro||""} onChange={e=>setData({...data, profile:{...data.profile, intro:e.target.value}})} />
      </Field>
    </section>
  );
}
