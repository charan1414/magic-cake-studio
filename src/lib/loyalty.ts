import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LoyaltyReward = {
  /** which order number this reward belongs to (1-based) */
  orderNumber: number;
  amount: number;
  minSubtotal: number;
  label: string;
};

/** Flat-rupee reward ladder, applied automatically by order number. */
export const LOYALTY_LADDER: LoyaltyReward[] = [
  { orderNumber: 1, amount: 50, minSubtotal: 0, label: "1st order · ₹50 off" },
  { orderNumber: 2, amount: 50, minSubtotal: 0, label: "2nd order · ₹50 off" },
  { orderNumber: 3, amount: 100, minSubtotal: 0, label: "3rd order · ₹100 off" },
  { orderNumber: 5, amount: 150, minSubtotal: 599, label: "5th order · ₹150 off (above ₹599)" },
];

export const rewardForOrderNumber = (n: number) =>
  LOYALTY_LADDER.find((r) => r.orderNumber === n) ?? null;

export const nextMilestone = (completedOrders: number) =>
  LOYALTY_LADDER.find((r) => r.orderNumber > completedOrders) ?? null;

/** Reward actually applicable to the order being placed now. */
export function applicableReward(completedOrders: number, subtotal: number) {
  const reward = rewardForOrderNumber(completedOrders + 1);
  if (!reward) return null;
  if (subtotal < reward.minSubtotal) return null;
  return reward;
}

export type LoyaltyState = {
  loading: boolean;
  orderCount: number;
  /** total rupees saved through loyalty so far */
  earned: number;
  firstOrderPercent: number;
  firstOrderUsed: boolean;
};

export function useLoyalty(userId: string | undefined) {
  const [state, setState] = useState<LoyaltyState>({
    loading: true,
    orderCount: 0,
    earned: 0,
    firstOrderPercent: 0,
    firstOrderUsed: false,
  });

  useEffect(() => {
    if (!userId) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    let alive = true;
    (async () => {
      const [orders, profile] = await Promise.all([
        supabase.from("orders").select("id, discount").eq("user_id", userId),
        supabase
          .from("profiles")
          .select("first_order_discount_percent, first_order_discount_used")
          .eq("id", userId)
          .maybeSingle(),
      ]);
      if (!alive) return;
      const rows = (orders.data ?? []) as { discount: number | null }[];
      setState({
        loading: false,
        orderCount: rows.length,
        earned: rows.reduce((s, r) => s + Number(r.discount ?? 0), 0),
        firstOrderPercent: Number((profile.data as never as { first_order_discount_percent?: number })?.first_order_discount_percent ?? 0),
        firstOrderUsed: Boolean((profile.data as never as { first_order_discount_used?: boolean })?.first_order_discount_used),
      });
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  return state;
}
