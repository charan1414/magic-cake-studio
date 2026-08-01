CREATE TABLE public.serviceable_pincodes (
  pincode text PRIMARY KEY,
  distance_km numeric NOT NULL DEFAULT 0,
  district text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT 'KARNATAKA',
  sample_areas text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  delivery_fee_override numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.serviceable_pincodes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.serviceable_pincodes TO authenticated;
GRANT ALL ON public.serviceable_pincodes TO service_role;

ALTER TABLE public.serviceable_pincodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read serviceable pincodes"
  ON public.serviceable_pincodes FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Staff insert pincodes"
  ON public.serviceable_pincodes FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff update pincodes"
  ON public.serviceable_pincodes FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admins delete pincodes"
  ON public.serviceable_pincodes FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER serviceable_pincodes_touch
  BEFORE UPDATE ON public.serviceable_pincodes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.serviceable_pincodes (pincode, distance_km, district, state, sample_areas, active) VALUES
('560117', 5.04, 'BENGALURU RURAL', 'KARNATAKA', 'Devanagundi; Doddadunnasandra; Kalkunte; Medimallasandra; Samethanahalli', true),
('563130', 7.95, 'KOLAR', 'KARNATAKA', 'Araleri; Bavanahalli; Doddakadathur; H.Hosakote; Hongenahalli; Hurulagere', true),
('562125', 8.58, 'BENGALURU URBAN', 'KARNATAKA', 'Dommasandra; Handenahalli; Kugur; Neriga; Sarjapura', true),
('563139', 9.23, 'KOLAR', 'KARNATAKA', 'Baliganahalli; Dadinayakanadoddi; Dinnahalli; Hassandahalli; Masthi; Suggondahalli', true),
('560087', 10.07, 'BENGALURU URBAN', 'KARNATAKA', 'Muthsandra; Panathur; Vartur', true),
('562114', 10.17, 'BENGALURU RURAL', 'KARNATAKA', 'Doddagattiganabbe; Doddanallala; Hoskote; Jadigenahalli; Jodidasarahalli; Kattigenahalli', true),
('563160', 10.27, 'KOLAR', 'KARNATAKA', 'Malur Railway Station', true),
('563163', 10.27, 'KOLAR', 'KARNATAKA', 'Alambadi; Chikkathirupathi; Jayamangala; Lakkur', true),
('560067', 12.93, 'BENGALURU RURAL', 'KARNATAKA', 'Naduvathi', true),
('563137', 16.19, 'KOLAR', 'KARNATAKA', 'Huladenahalli; Kondasettihalli; Nidaramangala', true),
('562107', 17.13, 'BENGALURU URBAN', 'KARNATAKA', 'Bidaraguppe', true),
('560066', 17.97, 'BENGALURU URBAN', 'KARNATAKA', 'E P I P', true),
('560037', 18.80, 'BENGALURU URBAN', 'KARNATAKA', 'Kundalahalli', true),
('560048', 19.81, 'BENGALURU URBAN', 'KARNATAKA', 'Hoodi', true),
('560035', 20.84, 'BENGALURU URBAN', 'KARNATAKA', 'Carmelram, Mullur (Sarjapur corridor - just outside 20km)', false);