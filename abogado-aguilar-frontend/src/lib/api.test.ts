// src/lib/api.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchContent } from "./api";

// Pequeño helper para crear un Response simulado
function mockResponse({
  ok,
  status,
  statusText,
  url = "http://example.test/api",
  json,
  text,
}: {
  ok: boolean;
  status: number;
  statusText: string;
  url?: string;
  json?: any;
  text?: string;
}) {
  return {
    ok,
    status,
    statusText,
    url,
    json: async () => json,
    text: async () => text ?? "",
  } as unknown as Response;
}

describe("fetchContent()", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("devuelve JSON en 200 OK", async () => {
    const payload = { profile: { fullName: "Lic. Test" } } as any;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      mockResponse({ ok: true, status: 200, statusText: "OK", json: payload })
    ));

    const data = await fetchContent("bufete-ejemplo");
    expect(data).toEqual(payload);
  });

  it("lanza error enriquecido en 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      mockResponse({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: "No existe el contenido solicitado",
        url: "http://api.local/api/content/public/nope"
      })
    ));

    await expect(fetchContent("nope")).rejects.toThrowError(
      /fetchContent 404 Not Found -> http:\/\/api\.local\/api\/content\/public\/nope/
    );
  });

  it("lanza error enriquecido en 500", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      mockResponse({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: "Stacktrace o mensaje del servidor",
        url: "http://api.local/api/content/public/falla"
      })
    ));

    await expect(fetchContent("falla")).rejects.toThrowError(
      /fetchContent 500 Internal Server Error -> http:\/\/api\.local\/api\/content\/public\/falla/
    );
  });
});
