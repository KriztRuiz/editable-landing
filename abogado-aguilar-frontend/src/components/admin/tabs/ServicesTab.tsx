import { ArrayEditor, Field, Input, Row } from "../ui";
import type { SiteContent, Service } from "../../../types";

export default function ServicesTab({ data, setData }: { data: SiteContent; setData:(d:SiteContent)=>void }) {
  return (
    <ArrayEditor<Service>
      title="Servicios"
      items={data.services}
      onChange={(arr)=>setData({...data, services:arr})}
      emptyItem={{ name:"", description:"", priceMin:undefined, priceMax:undefined }}
      render={(item,_i,update)=>(
        <div className="space-y-2">
          <Row>
            <Field label="Nombre"><Input value={item.name} onChange={e=>update({name:e.target.value})} /></Field>
            <Field label="Tarifa mínima"><Input type="number" value={(item.priceMin as any) ?? ""} onChange={e=>update({priceMin: e.target.value===""?undefined:Number(e.target.value)})} /></Field>
          </Row>
          <Row>
            <Field label="Descripción"><Input value={item.description||""} onChange={e=>update({description:e.target.value})} /></Field>
            <Field label="Tarifa máxima"><Input type="number" value={(item.priceMax as any) ?? ""} onChange={e=>update({priceMax: e.target.value===""?undefined:Number(e.target.value)})} /></Field>
          </Row>
        </div>
      )}
    />
  );
}
