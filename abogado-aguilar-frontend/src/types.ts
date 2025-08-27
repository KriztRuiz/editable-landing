export type Specialty = { name: string; description?: string; icon?: string };
export type Service = { name: string; description?: string; priceMin?: number; priceMax?: number };
export type FAQ = { q: string; a: string };
export type Testimonial = { author: string; text: string; rating?: number };
export type Schedule = { days: string; open: string; close: string };

export type SiteContent = {
  siteId?: string;
  profile: { fullName: string; licenseId?: string; headline?: string; intro?: string; photoUrl?: string };
  contact: { phone: string; whatsapp: string; email: string; address?: string; mapUrl?: string };
  specialties: Specialty[];
  services: Service[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  schedule: Schedule[];
  cta: { preferred: "whatsapp" | "call" | "agenda"; bookingUrl?: string; whatsappMessage?: string };
  seo: { title: string; description: string; cityKeywords: string[] };
  theme: { colors: { primary: string; secondary: string; background: string; text: string }; logoUrl?: string; coverUrl?: string };
  legal: { privacyPolicy: string; disclaimers: string };
  settings: { layoutOption: 1|2|3|4|5|6; mainArea: string; targetCity: string };
  sections: { showAreas: boolean; showServices: boolean; showFaqs: boolean; showTestimonials: boolean; showMap: boolean };
};
