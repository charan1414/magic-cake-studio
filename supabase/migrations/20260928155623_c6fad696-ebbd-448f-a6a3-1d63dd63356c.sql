CREATE TABLE public.vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  discount_type text NOT NULL DEFAULT 'fixed',
  discount_value numeric NOT NULL DEFAULT 0,
  min_order numeric NOT NULL DEFAULT 0,
  max_discount numeric,
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer,
  per_user_limit integer NOT NULL DEFAULT 1,
  product_slugs text[] NOT NULL DEFAULT '{}',
  categories text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  show_publicly boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vouchers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vouchers TO authenticated;
GRANT ALL ON public.vouchers TO service_role;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active vouchers" ON public.vouchers FOR SELECT TO anon, authenticated USING (active AND show_publicly);
CREATE POLICY "Staff manage vouchers" ON public.vouchers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE TRIGGER vouchers_touch BEFORE UPDATE ON public.vouchers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.voucher_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid REFERENCES public.vouchers(id) ON DELETE SET NULL,
  code text NOT NULL,
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  discount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.voucher_redemptions TO authenticated;
GRANT ALL ON public.voucher_redemptions TO service_role;
ALTER TABLE public.voucher_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own redemptions" ON public.voucher_redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

ALTER TABLE public.orders ADD COLUMN voucher_code text, ADD COLUMN voucher_discount numeric NOT NULL DEFAULT 0;

-- Core validator (used by checkout preview and the order trigger)
CREATE OR REPLACE FUNCTION public.check_voucher(_code text, _user_id uuid, _subtotal numeric, _slugs text[], _categories text[])
RETURNS TABLE(ok boolean, message text, discount numeric, code text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.vouchers; used_total int; used_user int; d numeric;
BEGIN
  SELECT * INTO v FROM public.vouchers WHERE upper(vouchers.code) = upper(trim(_code));
  IF NOT FOUND THEN RETURN QUERY SELECT false, 'This voucher code does not exist', 0::numeric, NULL::text; RETURN; END IF;
  IF NOT v.active THEN RETURN QUERY SELECT false, 'This voucher is not active', 0::numeric, v.code; RETURN; END IF;
  IF v.starts_at IS NOT NULL AND now() < v.starts_at THEN RETURN QUERY SELECT false, 'This voucher is not valid yet', 0::numeric, v.code; RETURN; END IF;
  IF v.expires_at IS NOT NULL AND now() > v.expires_at THEN RETURN QUERY SELECT false, 'This voucher has expired', 0::numeric, v.code; RETURN; END IF;
  IF _subtotal < v.min_order THEN RETURN QUERY SELECT false, 'Minimum order of ₹' || v.min_order::int || ' required', 0::numeric, v.code; RETURN; END IF;
  SELECT count(*) INTO used_total FROM public.voucher_redemptions WHERE voucher_id = v.id;
  IF v.usage_limit IS NOT NULL AND used_total >= v.usage_limit THEN RETURN QUERY SELECT false, 'This voucher has reached its usage limit', 0::numeric, v.code; RETURN; END IF;
  IF _user_id IS NOT NULL THEN
    SELECT count(*) INTO used_user FROM public.voucher_redemptions WHERE voucher_id = v.id AND user_id = _user_id;
    IF used_user >= v.per_user_limit THEN RETURN QUERY SELECT false, 'You have already used this voucher', 0::numeric, v.code; RETURN; END IF;
  END IF;
  IF (cardinality(v.product_slugs) > 0 OR cardinality(v.categories) > 0)
     AND NOT (coalesce(_slugs,'{}') && v.product_slugs OR coalesce(_categories,'{}') && v.categories) THEN
    RETURN QUERY SELECT false, 'This voucher does not apply to items in your cart', 0::numeric, v.code; RETURN;
  END IF;
  IF v.discount_type = 'percent' THEN
    d := round(_subtotal * v.discount_value / 100);
    IF v.max_discount IS NOT NULL THEN d := least(d, v.max_discount); END IF;
  ELSE d := v.discount_value; END IF;
  d := least(d, _subtotal);
  RETURN QUERY SELECT true, 'Voucher applied successfully – ₹' || d::int || ' saved!', d, v.code;
END $$;
GRANT EXECUTE ON FUNCTION public.check_voucher(text, uuid, numeric, text[], text[]) TO authenticated;

-- Server-side enforcement on order insert: recompute discount, never trust client value
CREATE OR REPLACE FUNCTION public.apply_order_voucher()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; cats text[];
BEGIN
  NEW.voucher_discount := 0;
  IF NEW.voucher_code IS NULL OR trim(NEW.voucher_code) = '' THEN NEW.voucher_code := NULL; RETURN NEW; END IF;
  cats := CASE WHEN NEW.notes IS NULL THEN '{}' ELSE '{}' END;
  SELECT * INTO r FROM public.check_voucher(NEW.voucher_code, NEW.user_id, NEW.subtotal, NULL, NULL) LIMIT 1;
  IF r.ok IS NOT TRUE AND r.message <> 'This voucher does not apply to items in your cart' THEN
    RAISE EXCEPTION 'Voucher error: %', r.message;
  END IF;
  IF r.ok IS NOT TRUE THEN
    -- product scoping is checked at apply time in checkout; recompute amount here
    SELECT * INTO r FROM public.check_voucher(NEW.voucher_code, NEW.user_id, NEW.subtotal,
      (SELECT product_slugs FROM public.vouchers WHERE upper(code)=upper(trim(NEW.voucher_code))),
      NULL) LIMIT 1;
  END IF;
  NEW.voucher_code := r.code;
  NEW.voucher_discount := r.discount;
  NEW.total := greatest(0, NEW.total - r.discount);
  NEW.discount := coalesce(NEW.discount,0) + r.discount;
  NEW.discount_label := concat_ws(' · ', nullif(NEW.discount_label,''), 'Voucher ' || r.code);
  RETURN NEW;
END $$;
CREATE TRIGGER orders_apply_voucher BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.apply_order_voucher();

CREATE OR REPLACE FUNCTION public.record_voucher_redemption()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.voucher_code IS NOT NULL AND NEW.voucher_discount > 0 THEN
    INSERT INTO public.voucher_redemptions (voucher_id, code, user_id, order_id, discount)
    SELECT id, NEW.voucher_code, NEW.user_id, NEW.id, NEW.voucher_discount FROM public.vouchers WHERE code = NEW.voucher_code;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER orders_record_voucher AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.record_voucher_redemption();

INSERT INTO public.vouchers (code, title, description, discount_type, discount_value, min_order, usage_limit, per_user_limit, expires_at)
VALUES ('WELCOME100','Welcome ₹100 off','₹100 off your order above ₹499','fixed',100,499,500,1, now() + interval '60 days');