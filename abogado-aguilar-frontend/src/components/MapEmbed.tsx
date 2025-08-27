import { useEffect, useMemo, useState } from "react";

// Extrae lat/lon de una URL de Google Maps Embed
function parseLatLngFromGoogleEmbed(src: string) {
  try {
    const m1 = src.match(/!3d([-\d.]+)!4d([-\d.]+)/); // ...!3dLAT!4dLON...
    if (m1) return { lat: parseFloat(m1[1]), lon: parseFloat(m1[2]) };
    const m2 = src.match(/@([-\d.]+),([-\d.]+),/);     // ...@LAT,LON,ZOOM...
    if (m2) return { lat: parseFloat(m2[1]), lon: parseFloat(m2[2]) };
  } catch {}
  return null;
}

function buildOsmEmbed(lat: number, lon: number) {
  const bbox = [lon - 0.01, lat - 0.006, lon + 0.01, lat + 0.006].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
}
function buildOsmStatic(lat: number, lon: number) {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=16&size=800x450&markers=${lat},${lon},red-pushpin`;
}
function buildOsmLink(lat: number, lon: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
}

type Prefer = "auto" | "google" | "osm" | "static";

export default function MapEmbed({
  src,
  link,
  prefer = "auto",
  timeoutMs = 1800
}: {
  src: string;
  link: string;
  prefer?: Prefer;
  timeoutMs?: number;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "fallback">("loading");
  const coords = useMemo(() => parseLatLngFromGoogleEmbed(src), [src]);

  // Si el usuario fuerza OSM/STATIC, no intentes Google
  if (prefer === "osm" && coords) {
    return (
      <>
        <div className="map-embed mt-2"><iframe src={buildOsmEmbed(coords.lat, coords.lon)} loading="lazy" /></div>
        <a className="underline block mt-2" href={buildOsmLink(coords.lat, coords.lon)} target="_blank" rel="noreferrer">
          Abrir en OpenStreetMap
        </a>
      </>
    );
  }
  if (prefer === "static" && coords) {
    return (
      <>
        <div className="map-embed mt-2"><img src={buildOsmStatic(coords.lat, coords.lon)} alt="Mapa" /></div>
        <a className="underline block mt-2" href={buildOsmLink(coords.lat, coords.lon)} target="_blank" rel="noreferrer">
          Abrir en OpenStreetMap
        </a>
      </>
    );
  }

  // AUTO/GOOGLE: intenta Google y, si no carga a tiempo, cae a OSM (si hay coords)
  useEffect(() => {
    setState("loading");
    const t = setTimeout(() => {
      setState((prev) => (prev === "loading" ? "fallback" : prev));
    }, timeoutMs);
    return () => clearTimeout(t);
  }, [src, timeoutMs]);

  return (
    <div className="map-embed mt-2 relative">
      {state !== "fallback" && (
        <iframe
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          onLoad={() => setState("loaded")}
        />
      )}

      {state === "fallback" && coords && (
        <>
          <iframe src={buildOsmEmbed(coords.lat, coords.lon)} loading="lazy" />
          <a className="underline block mt-2" href={buildOsmLink(coords.lat, coords.lon)} target="_blank" rel="noreferrer">
            Abrir en OpenStreetMap
          </a>
        </>
      )}

      {state === "fallback" && !coords && (
        <div className="absolute inset-0 grid place-items-center bg-white/85 text-center p-4 text-sm">
          <div>
            <p>Tu navegador bloqueó el mapa.</p>
            <a className="underline font-medium" href={link} target="_blank" rel="noreferrer">
              Abrir en Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
