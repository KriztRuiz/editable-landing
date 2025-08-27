import { CSV, Field, Row, Textarea, Input } from "../ui";
import type { SiteContent } from "../../../types";

export default function SeoTab({ data, setData }: { data: SiteContent; setData:(d:SiteContent)=>void }) {
  return (
    <section className="card p-4">
      <h2 className="text-xl font-semibold mb-3">SEO</h2>
      <Row>
        <Field label="Title">
          <Input value={data.seo.title} onChange={e=>setData({...data, seo:{...data.seo, title:e.target.value}})} />
        </Field>
        <Field label="Keywords de ciudad (CSV)">
          <CSV value={data.seo.cityKeywords||[]} onChange={(arr)=>setData({...data, seo:{...data.seo, cityKeywords:arr}})} />
        </Field>
      </Row>
      <Field label="Description">
        <Textarea value={data.seo.description} onChange={e=>setData({...data, seo:{...data.seo, description:e.target.value}})} />
      </Field>
    </section>
  );
}
