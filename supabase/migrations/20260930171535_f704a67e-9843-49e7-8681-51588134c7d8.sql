DROP POLICY "Anyone can view active addons" ON public.addons;
CREATE POLICY "Public view active addons" ON public.addons FOR SELECT TO anon, authenticated USING (active);