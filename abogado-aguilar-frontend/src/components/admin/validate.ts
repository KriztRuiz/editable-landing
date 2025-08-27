import type { SiteContent } from "../../types";

const isUrl = (v?: string) => {
  if (!v) return true;
  try { new URL(v); return true; } catch { return false; }
};

export function validateContent(d: SiteContent) {
  const errs: string[] = [];
  if (!d.profile.fullName?.trim()) errs.push("Perfil: nombre completo requerido");
  if (!d.contact.email?.includes("@")) errs.push("Contacto: email inválido");
  if (!d.cta.preferred) errs.push("CTA: preferida requerida");
  if (!d.seo.title?.trim()) errs.push("SEO: title requerido");
  if (!d.seo.description?.trim()) errs.push("SEO: description requerida");

  // URLs opcionales
  if (!isUrl(d.profile.photoUrl)) errs.push("Foto: URL inválida");
  if (!isUrl(d.theme.logoUrl)) errs.push("Tema: logo URL inválida");
  if (!isUrl((d as any).theme.coverUrl)) errs.push("Tema: portada URL inválida");
  if (!isUrl(d.cta.bookingUrl)) errs.push("CTA: booking URL inválida");
  if (!isUrl(d.contact.mapUrl)) errs.push("Contacto: map URL inválida");

  return errs;
}
