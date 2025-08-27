import { Field, Input, Row } from "../ui";
import type { SiteContent } from "../../../types";

export default function ThemeTab({ data, setData }: { data: SiteContent; setData:(d:SiteContent)=>void }) {
  const colors = data.theme.colors;
  return (
    <section className="card p-4">
      <h2 className="text-xl font-semibold mb-3">Tema</h2>
      <Row>
        <Field label="Primary"><Input type="color" value={colors.primary} onChange={e=>setData({...data, theme:{...data.theme, colors:{...colors, primary:e.target.value}}})} /></Field>
        <Field label="Secondary"><Input type="color" value={colors.secondary} onChange={e=>setData({...data, theme:{...data.theme, colors:{...colors, secondary:e.target.value}}})} /></Field>
      </Row>
      <Row>
        <Field label="Background"><Input type="color" value={colors.background} onChange={e=>setData({...data, theme:{...data.theme, colors:{...colors, background:e.target.value}}})} /></Field>
        <Field label="Text"><Input type="color" value={colors.text} onChange={e=>setData({...data, theme:{...data.theme, colors:{...colors, text:e.target.value}}})} /></Field>
      </Row>
      <Field label="Logo URL">
        <Input type="url" value={data.theme.logoUrl||""} onChange={e=>setData({...data, theme:{...data.theme, logoUrl:e.target.value||undefined}})} />
      </Field>
      <Field label="Imagen de portada (URL)">
        <Input
            type="url"
            value={data.theme.coverUrl || ""}
            onChange={(e) =>
            setData({
                ...data,
                theme: { ...data.theme, coverUrl: e.target.value || undefined },
            })
            }
        />
        </Field>
    </section>
  );
}
