import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Settings = {
  business_address: string;
  delivery_radius_km: number;
  min_order_amount: number;
  base_delivery_fee: number;
  per_km_fee: number;
  free_delivery_threshold: number;
  delivery_enabled: boolean;
};

export type PincodeRow = {
  pincode: string;
  distance_km: number;
  district: string;
  state: string;
  sample_areas: string;
  active: boolean;
  delivery_fee_override: number | null;
};

export type ServiceabilityInput = {
  pincode: string;
  subtotal?: number;
};

export type ServiceabilityResult = {
  ok: boolean;
  reason?: string;
  pincode?: string;
  distance_km?: number;
  district?: string;
  state?: string;
  areas?: string[];
  delivery_fee?: number;
  eta_label?: string;
  settings: {
    min_order_amount: number;
    free_delivery_threshold: number;
    delivery_radius_km: number;
    delivery_enabled: boolean;
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

export async function loadDeliverySettings(): Promise<Settings> {
  const sb = makePublicClient();
  const { data, error } = await sb
    .from("delivery_settings")
    .select("business_address,delivery_radius_km,min_order_amount,base_delivery_fee,per_km_fee,free_delivery_threshold,delivery_enabled")
    .limit(1)
    .maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "Delivery settings unavailable");
  return {
    business_address: data.business_address,
    delivery_radius_km: Number(data.delivery_radius_km),
    min_order_amount: Number(data.min_order_amount),
    base_delivery_fee: Number(data.base_delivery_fee),
    per_km_fee: Number(data.per_km_fee),
    free_delivery_threshold: Number(data.free_delivery_threshold),
    delivery_enabled: data.delivery_enabled,
  };
}

export async function loadServiceablePincodes(): Promise<PincodeRow[]> {
  const sb = makePublicClient();
  const { data, error } = await sb
    .from("serviceable_pincodes")
    .select("pincode,distance_km,district,state,sample_areas,active,delivery_fee_override")
    .order("distance_km", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    pincode: r.pincode,
    distance_km: Number(r.distance_km),
    district: r.district,
    state: r.state,
    sample_areas: r.sample_areas,
    active: r.active,
    delivery_fee_override: r.delivery_fee_override === null ? null : Number(r.delivery_fee_override),
  }));
}

export async function calculateServiceability(data: ServiceabilityInput): Promise<ServiceabilityResult> {
  const settings = await loadDeliverySettings();
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

  const sb = makePublicClient();
  const { data: row, error } = await sb
    .from("serviceable_pincodes")
    .select("pincode,distance_km,district,state,sample_areas,active,delivery_fee_override")
    .eq("pincode", pin)
    .maybeSingle();

  if (error) return { ok: false, reason: "We couldn't check that pincode right now. Please try again.", settings: meta };

  if (!row || !row.active) {
    return {
      ok: false,
      pincode: pin,
      reason: `Sorry — we don't deliver to ${pin} yet. We currently serve areas within ${settings.delivery_radius_km} km of Lakkur, Malur.`,
      settings: meta,
    };
  }

  const distance_km = Number(row.distance_km);
  const subtotal = Number(data.subtotal ?? 0);
  const override = row.delivery_fee_override === null ? null : Number(row.delivery_fee_override);
  const rawFee = override ?? settings.base_delivery_fee + settings.per_km_fee * distance_km;
  const fee = subtotal > 0 && subtotal >= settings.free_delivery_threshold ? 0 : Math.round(rawFee);

  return {
    ok: true,
    pincode: pin,
    distance_km: Math.round(distance_km * 10) / 10,
    district: row.district,
    state: row.state,
    areas: (row.sample_areas ?? "").split(";").map((s) => s.trim()).filter(Boolean),
    delivery_fee: fee,
    eta_label: distance_km <= 10 ? "Same-day delivery" : "Delivered within 3 hours",
    settings: meta,
  };
}
