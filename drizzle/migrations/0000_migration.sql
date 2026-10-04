CREATE TABLE public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT,
  images JSONB,
  asset TEXT,
  timeframe TEXT,
  prediction TEXT,
  prediction_long TEXT,
  prediction_short TEXT,
  confidence INTEGER,
  confidence_long INTEGER,
  confidence_short INTEGER,
  reasoning TEXT,
  reasoning_long TEXT,
  reasoning_short TEXT,
  rules_applied JSONB,
  outcome TEXT,
  notes TEXT,
  price_provider TEXT,
  price_symbol TEXT,
  price_at_prediction NUMERIC,
  price_at_resolution NUMERIC,
  resolve_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.predictions TO authenticated;
GRANT ALL ON public.predictions TO service_role;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select" ON public.predictions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.predictions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.predictions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.predictions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX predictions_user_created_idx ON public.predictions(user_id, created_at DESC);
CREATE INDEX predictions_pending_resolution_idx ON public.predictions (resolve_at) WHERE price_provider IS NOT NULL AND outcome IS NULL;

CREATE TABLE public.entitlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  paid BOOLEAN NOT NULL DEFAULT false,
  stripe_session_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.entitlements TO authenticated;
GRANT ALL ON public.entitlements TO service_role;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select_entitlements" ON public.entitlements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_insert_entitlements" ON public.entitlements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "charts_read_own" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'charts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "charts_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'charts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "charts_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'charts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE OR REPLACE FUNCTION public.get_pattern_stats()
RETURNS TABLE (tag text, wins bigint, losses bigint, total bigint, win_rate numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT t.tag::text, count(*) FILTER (WHERE p.outcome = 'correct'), count(*) FILTER (WHERE p.outcome = 'wrong'), count(*),
    round(100.0 * count(*) FILTER (WHERE p.outcome = 'correct') / NULLIF(count(*) FILTER (WHERE p.outcome IN ('correct','wrong')), 0), 1)
  FROM public.predictions p
  CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(p.rules_applied) = 'array' THEN p.rules_applied ELSE '[]'::jsonb END) AS t(tag)
  WHERE p.outcome IN ('correct','wrong')
  GROUP BY t.tag HAVING count(*) > 0 ORDER BY count(*) DESC LIMIT 25;
$$;
GRANT EXECUTE ON FUNCTION public.get_pattern_stats() TO authenticated, anon, service_role;