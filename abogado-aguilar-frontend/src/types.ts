// src/types.ts

export type MongoId = string;
export type WithId = { _id?: MongoId };

// Subdocumentos (Mongo suele agregar _id en arrays)
export type Specialty = WithId & { name: string; description?: string; icon?: string };
export type Service = WithId & { name: string; description?: string; priceMin?: number; priceMax?: number };
export type FAQ = WithId & { q: string; a: string };
export type Testimonial = WithId & { author: string; text: string; rating?: number };
export type Schedule = WithId & { days: string; open: string; close: string };

export type CtaPreferred = "whatsapp" | "call" | "agenda";

export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
};

export type SiteContent = WithId & {
  // lo dejas opcional para no romper estados iniciales del front
  siteId?: string;

  profile: {
    fullName: string;
    licenseId?: string;
    headline?: string;
    intro?: string;
    photoUrl?: string;
  };

  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address?: string;
    mapUrl?: string;
  };

  specialties: Specialty[];
  services: Service[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  schedule: Schedule[];

  cta: {
    preferred: CtaPreferred;
    bookingUrl?: string;
    whatsappMessage?: string;
  };

  seo: {
    title: string;
    description: string;
    cityKeywords: string[];
  };

  theme: {
    colors: ThemeColors;
    logoUrl?: string;
    coverUrl?: string;
  };

  settings: {
    layoutOption: 1 | 2 | 3 | 4 | 5 | 6;
    mainArea: string;
    targetCity: string;
  };

  sections: {
    showAreas: boolean;
    showServices: boolean;
    showFaqs: boolean;
    showTestimonials: boolean;
    showMap: boolean;
  };

  // Metadatos típicos cuando el backend te devuelve el documento “tal cual” de Mongo
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

// (Opcional) Tipos genéricos de respuestas de API para admin/auth.
// No rompen nada si no los usas todavía.
export type ApiError = { ok: false; error: string; status?: number };
export type ApiOk<T> = { ok: true; data: T };
export type ApiResult<T> = ApiOk<T> | ApiError;

export type AuthUser = WithId & {
  email: string;
  role?: string;
  siteId?: string;
};

export type AuthMeResult = ApiResult<AuthUser>;
export type AuthLoginResult = ApiResult<AuthUser>;
