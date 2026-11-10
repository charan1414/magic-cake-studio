DROP POLICY IF EXISTS "Anyone can submit a valid signup lead" ON public.signup_leads;
CREATE POLICY "Anyone can submit a valid signup lead"
  ON public.signup_leads FOR INSERT TO anon, authenticated
  WITH CHECK (
    user_id IS NULL
    AND discount_percent BETWEEN 1 AND 10
    AND (
      (email IS NOT NULL AND length(email) <= 254
        AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$')
      OR
      (phone IS NOT NULL AND length(phone) <= 16
        AND phone ~ '^[+]?[0-9][0-9 -]{7,14}$')
    )
  );