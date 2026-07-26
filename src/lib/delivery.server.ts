import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Settings = {
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
  distance_mode: string;
  require_complete_address: boolean;
  allow_gps_checkout: boolean;
};

export type ServiceabilityInput = {
  pincode: string;
  line1?: string;
  line2?: string;
  locality?: string;
  city?: string;
  district?: string;
  state?: string;
  subtotal?: number;
  lat?: number;
  lng?: number;
};

export type ServiceabilityResult = {
  ok: boolean;
  reason?: string;
  distance_km?: number;
  road_distance_km?: number;
  distance_method?: string;
  delivery_fee?: number;
  lat?: number;
  lng?: number;
  matched_address?: string;
  settings: {
    min_order_amount: number;
    free_delivery_threshold: number;
    delivery_radius_km: number;
    delivery_enabled: boolean;
    require_complete_address: boolean;
    allow_gps_checkout: boolean;
    distance_mode: string;
  };
};

function makePublicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Delivery settings are not configured yet");
  return createClient<Database>(url, key, {
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

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function roundKm(value: number) {
  return Math.round(value * 10) / 10;
}

function validCoord(lat?: number, lng?: number) {
  return typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; display: string } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "in");
  url.searchParams.set("addressdetails", "1");
  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "C-And-Its-Magic/1.0 (delivery-gating)", Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
}

async function reverseGeocode(lat: number, lng: number) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");
  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "C-And-Its-Magic/1.0 (delivery-gating)", Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { display_name?: string };
  return data.display_name ?? null;
}

async function roadDistanceKm(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false&alternatives=false&steps=false`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as { routes?: Array<{ distance?: number }> };
  const meters = data.routes?.[0]?.distance;
  return typeof meters === "number" ? meters / 1000 : null;
}

export async function loadDeliverySettings(): Promise<Settings> {
  const sb = makePublicClient();
  const { data, error } = await sb
    .from("delivery_settings")
    .select("business_lat,business_lng,business_address,delivery_radius_km,min_order_amount,base_delivery_fee,per_km_fee,free_delivery_threshold,delivery_enabled,serviceable_pincodes,distance_mode,require_complete_address,allow_gps_checkout")
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
    distance_mode: data.distance_mode ?? "road",
    require_complete_address: data.require_complete_address ?? true,
    allow_gps_checkout: data.allow_gps_checkout ?? true,
  };
}

export async function calculateServiceability(data: ServiceabilityInput): Promise<ServiceabilityResult> {
  const settings = await loadDeliverySettings();
  const meta = {
    min_order_amount: settings.min_order_amount,
    free_delivery_threshold: settings.free_delivery_threshold,
    delivery_radius_km: settings.delivery_radius_km,
    delivery_enabled: settings.delivery_enabled,
    require_complete_address: settings.require_complete_address,
    allow_gps_checkout: settings.allow_gps_checkout,
    distance_mode: settings.distance_mode,
  };

  if (!settings.delivery_enabled) return { ok: false, reason: "Delivery is temporarily paused. Please check back soon.", settings: meta };

  const pin = (data.pincode ?? "").trim();
  if (!/^\d{6}$/.test(pin)) return { ok: false, reason: "Please enter a valid 6-digit pincode.", settings: meta };

  if (settings.require_complete_address) {
    const required = [data.line1, data.city, data.district, data.state].map((v) => (v ?? "").trim());
    if (required.some((v) => v.length < 2)) {
      return { ok: false, reason: "Please enter your complete address, city/town, district and state.", settings: meta };
    }
  }

  if (settings.serviceable_pincodes.length > 0 && !settings.serviceable_pincodes.includes(pin)) {
    return { ok: false, reason: "Sorry, we don't deliver to this pincode yet.", settings: meta };
  }

  let destination: { lat: number; lng: number; display: string } | null = null;
  if (validCoord(data.lat, data.lng)) {
    const lat = Number(data.lat);
    const lng = Number(data.lng);
    destination = { lat, lng, display: (await reverseGeocode(lat, lng)) ?? `GPS location (${lat.toFixed(5)}, ${lng.toFixed(5)})` };
  } else {
    const query = [data.line1, data.line2, data.locality, data.city, data.district, data.state, pin, "India"]
      .filter(Boolean)
      .join(", ");
    destination = await geocodeAddress(query);
  }

  if (!destination) return { ok: false, reason: "We couldn't locate that full address. Please refine it or use GPS.", settings: meta };

  const origin = { lat: settings.business_lat, lng: settings.business_lng };
  const straightDistance = haversine(origin, destination);
  const roadDistance = settings.distance_mode === "road" ? await roadDistanceKm(origin, destination) : null;
  const effective = roadDistance ?? straightDistance;
  const distance_km = roundKm(effective);
  const method = roadDistance ? "road" : settings.distance_mode === "road" ? "straight_fallback" : "straight";

  if (effective > settings.delivery_radius_km) {
    return {
      ok: false,
      reason: `Out of range — you're ${distance_km} km away. We deliver within ${settings.delivery_radius_km} km of Lakkur.`,
      distance_km,
      road_distance_km: roadDistance ? roundKm(roadDistance) : undefined,
      distance_method: method,
      lat: destination.lat,
      lng: destination.lng,
      matched_address: destination.display,
      settings: meta,
    };
  }

  const subtotal = Number(data.subtotal ?? 0);
  const rawFee = settings.base_delivery_fee + settings.per_km_fee * distance_km;
  const fee = subtotal > 0 && subtotal >= settings.free_delivery_threshold ? 0 : Math.round(rawFee);

  return {
    ok: true,
    distance_km,
    road_distance_km: roadDistance ? roundKm(roadDistance) : undefined,
    distance_method: method,
    delivery_fee: fee,
    lat: destination.lat,
    lng: destination.lng,
    matched_address: destination.display,
    settings: meta,
  };
}