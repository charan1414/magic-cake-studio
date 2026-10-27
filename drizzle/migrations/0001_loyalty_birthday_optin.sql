ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birthday date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.profiles.birthday IS 'Optional customer birthday for member birthday offers (C & It''s Magic Rewards)';
COMMENT ON COLUMN public.profiles.marketing_opt_in IS 'Explicit opt-in for promotional updates; marketing messages are never sent when false';
GRANT UPDATE (birthday, marketing_opt_in) ON public.profiles TO authenticated;
GRANT UPDATE (full_name, phone) ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;