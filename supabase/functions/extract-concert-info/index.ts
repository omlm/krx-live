import "@supabase/functions-js/edge-runtime.d.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ExtractedConcertInfo {
  artist_name: string;
  venue: string;
  date: string;
  time: string;
  image_url: string;
  description: string;
  organizer: string;
  genre: string;
  original_url: string;
}

// --- Date/Time helpers ---

const norwegianMonths: Record<string, string> = {
  januar: "01", februar: "02", mars: "03", april: "04",
  mai: "05", juni: "06", juli: "07", august: "08",
  september: "09", oktober: "10", november: "11", desember: "12",
};

function parseDateTime(input: string): { date: string; time: string } {
  if (!input) return { date: "", time: "" };

  // Try ISO 8601 first
  try {
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const date = d.toISOString().split("T")[0];
      const time = d.toTimeString().slice(0, 5);
      return { date, time };
    }
  } catch { /* fall through */ }

  // Try Norwegian format: "15. mars 2025"
  const norMatch = input.match(
    /(\d{1,2})\.\s*(januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember)\s*(\d{4})/i
  );
  if (norMatch) {
    const day = norMatch[1].padStart(2, "0");
    const month = norwegianMonths[norMatch[2].toLowerCase()];
    const year = norMatch[3];
    const date = `${year}-${month}-${day}`;

    const timeMatch = input.match(/(\d{1,2})[:.:](\d{2})/);
    const time = timeMatch
      ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`
      : "";
    return { date, time };
  }

  // Try "DD.MM.YYYY"
  const dotMatch = input.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (dotMatch) {
    const date = `${dotMatch[3]}-${dotMatch[2]}-${dotMatch[1]}`;
    const timeMatch = input.match(/(\d{1,2})[:.:](\d{2})/);
    const time = timeMatch
      ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`
      : "";
    return { date, time };
  }

  return { date: "", time: "" };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen).trim() + "...";
}

// --- Extraction strategies ---

function extractFromJsonLd(
  doc: ReturnType<DOMParser["parseFromString"]>,
): Partial<ExtractedConcertInfo> {
  const result: Partial<ExtractedConcertInfo> = {};
  if (!doc) return result;

  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      let data = JSON.parse(script.textContent || "");

      if (data["@graph"]) {
        data = data["@graph"];
      }

      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        const type = item["@type"];
        if (!type) continue;

        const typeStr = Array.isArray(type) ? type.join(",") : String(type);
        if (!/Event|MusicEvent|Concert|Festival/i.test(typeStr)) continue;

        // Artist/performer
        if (item.performer) {
          const performer = Array.isArray(item.performer)
            ? item.performer[0]
            : item.performer;
          if (typeof performer === "string") {
            result.artist_name = performer;
          } else if (performer?.name) {
            result.artist_name = performer.name;
          }
        }
        if (!result.artist_name && item.name) {
          result.artist_name = item.name;
        }

        // Venue
        if (item.location) {
          const location = Array.isArray(item.location)
            ? item.location[0]
            : item.location;
          if (typeof location === "string") {
            result.venue = location;
          } else if (location?.name) {
            result.venue = location.name;
          }
        }

        // Date/time
        if (item.startDate) {
          const { date, time } = parseDateTime(item.startDate);
          if (date) result.date = date;
          if (time) result.time = time;
        }

        // Image
        if (item.image) {
          if (typeof item.image === "string") {
            result.image_url = item.image;
          } else if (Array.isArray(item.image)) {
            result.image_url = typeof item.image[0] === "string"
              ? item.image[0]
              : item.image[0]?.url || "";
          } else if (item.image.url) {
            result.image_url = item.image.url;
          }
        }

        // Description
        if (item.description) {
          result.description = truncate(stripHtml(item.description), 500);
        }

        // Organizer
        if (item.organizer) {
          const org = Array.isArray(item.organizer)
            ? item.organizer[0]
            : item.organizer;
          if (typeof org === "string") {
            result.organizer = org;
          } else if (org?.name) {
            result.organizer = org.name;
          }
        }

        // Genre
        if (item.genre) {
          result.genre = Array.isArray(item.genre)
            ? item.genre[0]
            : item.genre;
        }

        break; // Use first matching event
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  return result;
}

function extractFromOpenGraph(
  doc: ReturnType<DOMParser["parseFromString"]>,
): Partial<ExtractedConcertInfo> {
  const result: Partial<ExtractedConcertInfo> = {};
  if (!doc) return result;

  function getOg(property: string): string | null {
    const el = doc!.querySelector(`meta[property="${property}"]`);
    return el?.getAttribute("content") || null;
  }

  const title = getOg("og:title");
  if (title) result.artist_name = title;

  const description = getOg("og:description");
  if (description) result.description = truncate(stripHtml(description), 500);

  const image = getOg("og:image");
  if (image) result.image_url = image;

  const siteName = getOg("og:site_name");
  if (siteName) result.venue = siteName;

  // Facebook event tags
  const startTime =
    getOg("event:start_time") || getOg("og:event:start_time");
  if (startTime) {
    const { date, time } = parseDateTime(startTime);
    if (date) result.date = date;
    if (time) result.time = time;
  }

  return result;
}

function extractFromMetaTags(
  doc: ReturnType<DOMParser["parseFromString"]>,
): Partial<ExtractedConcertInfo> {
  const result: Partial<ExtractedConcertInfo> = {};
  if (!doc) return result;

  const titleEl = doc.querySelector("title");
  if (titleEl?.textContent) {
    result.artist_name = titleEl.textContent.trim();
  }

  const descEl = doc.querySelector('meta[name="description"]');
  if (descEl) {
    const content = descEl.getAttribute("content");
    if (content) result.description = truncate(stripHtml(content), 500);
  }

  // Look for <time> elements with datetime
  const timeEls = doc.querySelectorAll("time[datetime]");
  for (const timeEl of timeEls) {
    const dt = timeEl.getAttribute("datetime");
    if (dt) {
      const { date, time } = parseDateTime(dt);
      if (date) {
        result.date = date;
        if (time) result.time = time;
        break;
      }
    }
  }

  return result;
}

// --- Merge results ---

function mergeResults(
  ...sources: Partial<ExtractedConcertInfo>[]
): ExtractedConcertInfo {
  const merged: ExtractedConcertInfo = {
    artist_name: "",
    venue: "",
    date: "",
    time: "",
    image_url: "",
    description: "",
    organizer: "",
    genre: "",
    original_url: "",
  };

  for (const source of sources) {
    for (const key of Object.keys(merged) as (keyof ExtractedConcertInfo)[]) {
      if (!merged[key] && source[key]) {
        merged[key] = source[key]!;
      }
    }
  }

  return merged;
}

// --- Main handler ---

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "Ugyldig URL" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Ugyldig URL-format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Fetch the page
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "nb-NO,nb;q=0.9,no;q=0.8,en;q=0.7",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: `Kunne ikke hente siden (${response.status})`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml")
    ) {
      return new Response(
        JSON.stringify({ error: "URL-en peker ikke til en nettside" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const html = await response.text();

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Run extraction strategies in priority order
    const jsonLdResult = extractFromJsonLd(doc);
    const ogResult = extractFromOpenGraph(doc);
    const metaResult = extractFromMetaTags(doc);

    // Merge results (first non-empty value wins)
    const result = mergeResults(jsonLdResult, ogResult, metaResult);
    result.original_url = url;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ukjent feil";
    return new Response(
      JSON.stringify({ error: `Feil ved parsing: ${message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
