GRANT SELECT ON public.healthy_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.healthy_products TO authenticated;
GRANT ALL ON public.healthy_products TO service_role;