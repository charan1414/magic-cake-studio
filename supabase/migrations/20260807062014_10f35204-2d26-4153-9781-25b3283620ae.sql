CREATE TABLE public.signup_leads (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  user_id uuid references auth.users(id) on delete set null,
  discount_percent numeric not null default 10,
  created_at timestamptz not null default now()
);
GRANT INSERT ON public.signup_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.signup_leads TO authenticated;
GRANT ALL ON public.signup_leads TO service_role;
ALTER TABLE public.signup_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a signup lead" ON public.signup_leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can read signup leads" ON public.signup_leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_order_discount_percent numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_order_discount_used boolean NOT NULL DEFAULT false;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_label text;