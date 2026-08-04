import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import founderPhoto from "@/assets/founder-charan.jpg";

export type TimelineEntry = { year: string; title: string; detail: string };

export type FounderProfile = {
  name: string;
  designation: string;
  company: string;
  founded: string;
  location: string;
  bio: string;
  mission: string;
  vision: string;
  photo_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  timeline: TimelineEntry[];
};

export const FOUNDER_FALLBACK: FounderProfile = {
  name: "Charan L. S.",
  designation: "Founder & Head Chef",
  company: "C & It's Magic",
  founded: "2024",
  location: "Lakkur, Malur, Karnataka",
  bio: "Charan L. S. founded C & It's Magic with a single conviction: a cloud kitchen should never feel disposable. Trained through years behind the pass and thousands of hand-finished desserts, he built a kitchen where every cake is designed like a collection piece — sourced, sketched, tasted and refined before it earns a place on the menu.",
  mission:
    "To bring patisserie-grade craft to every doorstep within our delivery radius — no shortcuts, no compromise on ingredients, and no box that leaves the kitchen unsigned.",
  vision:
    "To become South Karnataka's most loved luxury dessert house, known as much for its warmth as for its precision.",
  photo_url: null,
  instagram_url: "https://www.instagram.com/canditsmagic",
  linkedin_url: null,
  timeline: [
    { year: "2019", title: "The first kitchen", detail: "Charan begins baking for family celebrations across Malur." },
    { year: "2022", title: "Learning the craft", detail: "Years spent refining French patisserie technique and Indian fusion flavours." },
    { year: "2024", title: "C & It's Magic is born", detail: "A luxury cloud kitchen launches from Lakkur with a signature cake collection." },
    { year: "2026", title: "A full maison", detail: "Cakes, cookies, ice cream, and gourmet plates delivered within 20 km." },
  ],
};

export const FOUNDER_PHOTO = founderPhoto;

/** Loads the admin-managed founder profile, falling back to the built-in copy. */
export function useFounder() {
  const [profile, setProfile] = useState<FounderProfile>(FOUNDER_FALLBACK);

  useEffect(() => {
    let alive = true;
    supabase
      .from("founder_profile")
      .select("*")
      .maybeSingle()
      .then(({ data }) => {
        if (!alive || !data) return;
        setProfile({
          ...FOUNDER_FALLBACK,
          ...data,
          timeline: Array.isArray(data.timeline) && data.timeline.length
            ? (data.timeline as unknown as TimelineEntry[])
            : FOUNDER_FALLBACK.timeline,
        });
      });
    return () => {
      alive = false;
    };
  }, []);

  return profile;
}
