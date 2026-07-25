import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

type Settings = {
  business_lat: number;
  business_lng: number;
  business_address: string;
  delivery_radius_km: number;
  min_order_amount: number;
  base_delivery_fee: number;
  per_km_fee: number;
  free_delivery_threshold: number;
  delivery_enabled: boolean;
  serviceable_pincodes: string[];
};

export type ServiceabilityResult = {
  ok: boolean;
  reason?: string;
  distance_km?: number;
  delivery_fee?: number;
  lat?: number;
  lng?: number;
  matched_address?: string;
  settings: {
    min_order_amount: number;
    free_delivery_threshold: number;
    delivery_radius_km: number;
    delivery_enabled: boolean;
  };
};

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function makePublicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function loadSettings(): Promise<Settings> {
  const sb = makePublicClient();
  const { data, error } = await sb
    .from("delivery_settings")
    .select("business_lat,business_lng,business_address,delivery_radius_km,min_order_amount,base_delivery_fee,per_km_fee,free_delivery_threshold,delivery_enabled,serviceable_pincodes")
    .limit(1)
    .maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "Delivery settings unavailable");
  return {
    business_lat: Number(data.business_lat),
    business_lng: Number(data.business_lng),
    business_address: data.business_address,
    delivery_radius_km: Number(data.delivery_radius_km),
    min_order_amount: Number(data.min_order_amount),
    base_delivery_fee: Number(data.base_delivery_fee),
    per_km_fee: Number(data.per_km_fee),
    free_delivery_threshold: Number(data.free_delivery_threshold),
    delivery_enabled: data.delivery_enabled,
    serviceable_pincodes: data.serviceable_pincodes ?? [],
  };
}

async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; display: string } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "in");
  url.searchParams.set("addressdetails", "0");
  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "C-And-Its-Magic/1.0 (delivery-gating)", Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
}

export const getDeliverySettings = createServerFn({ method: "GET" }).handler(async () => {
  return await loadSettings();
});

export const checkServiceability = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { pincode: string; line1?: string; line2?: string; city?: string; state?: string; subtotal?: number }) => input,
  )
  .handler(async ({ data }): Promise<ServiceabilityResult> => {
    const settings = await loadSettings();
    const meta = {
      min_order_amount: settings.min_order_amount,
      free_delivery_threshold: settings.free_delivery_threshold,
      delivery_radius_km: settings.delivery_radius_km,
      delivery_enabled: settings.delivery_enabled,
    };

    if (!settings.delivery_enabled) {
      return { ok: false, reason: "Delivery is temporarily paused. Please check back soon.", settings: meta };
    }

    const pin = (data.pincode ?? "").trim();
    if (!/^\d{6}$/.test(pin)) {
      return { ok: false, reason: "Please enter a valid 6-digit pincode.", settings: meta };
    }

    if (settings.serviceable_pincodes.length > 0 && !settings.serviceable_pincodes.includes(pin)) {
      return { ok: false, reason: "Sorry, we don't deliver to this pincode yet.", settings: meta };
    }

    const query = [data.line1, data.line2, data.city, data.state, pin, "India"].filter(Boolean).join(", ");
    let geocoded = await geocodeAddress(query);
    if (!geocoded) geocoded = await geocodeAddress(`${pin}, India`);
    if (!geocoded) {
      return { ok: false, reason: "We couldn't locate that address. Please refine it.", settings: meta };
    }

    const distance = haversine(
      { lat: settings.business_lat, lng: settings.business_lng },
      { lat: geocoded.lat, lng: geocoded.lng },
    );
    const distance_km = Math.round(distance * 10) / 10;

    if (distance > settings.delivery_radius_km) {
      return {
        ok: false,
        reason: `Out of range — you're ${distance_km} km away. We deliver within ${settings.delivery_radius_km} km.`,
        distance_km,
        lat: geocoded.lat,
        lng: geocoded.lng,
        matched_address: geocoded.display,
        settings: meta,
      };
    }

    const subtotal = Number(data.subtotal ?? 0);
    const rawFee = settings.base_delivery_fee + settings.per_km_fee * distance_km;
    const fee =
      subtotal > 0 && subtotal >= settings.free_delivery_threshold ? 0 : Math.round(rawFee);

    return {
      ok: true,
      distance_km,
      delivery_fee: fee,
      lat: geocoded.lat,
      lng: geocoded.lng,
      matched_address: geocoded.display,
      settings: meta,
    };
  });
