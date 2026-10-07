DROP POLICY IF EXISTS own_insert_entitlements ON public.entitlements;
REVOKE INSERT, UPDATE, DELETE ON public.entitlements FROM authenticated, anon;
REVOKE ALL ON public.entitlements FROM anon;
GRANT SELECT ON public.entitlements TO authenticated;
GRANT ALL ON public.entitlements TO service_role;

REVOKE UPDATE ON public.predictions FROM authenticated, anon;
GRANT UPDATE (notes) ON public.predictions TO authenticated;
GRANT ALL ON public.predictions TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_pattern_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_pattern_stats() TO service_role;

CREATE TABLE public.analysis_usage (
  user_id uuid NOT NULL,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);
GRANT SELECT ON public.analysis_usage TO authenticated;
GRANT ALL ON public.analysis_usage TO service_role;
ALTER TABLE public.analysis_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_select_usage ON public.analysis_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.consume_analysis_quota(_user_id uuid, _limit integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _d date := (now() AT TIME ZONE 'utc')::date; _c integer;
BEGIN
  INSERT INTO public.analysis_usage(user_id, day, count) VALUES (_user_id, _d, 0)
  ON CONFLICT (user_id, day) DO NOTHING;
  UPDATE public.analysis_usage SET count = count + 1, updated_at = now()
   WHERE user_id = _user_id AND day = _d AND count < _limit
   RETURNING count INTO _c;
  RETURN _c; -- NULL when limit reached
END $$;

CREATE OR REPLACE FUNCTION public.refund_analysis_quota(_user_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.analysis_usage SET count = greatest(count - 1, 0), updated_at = now()
   WHERE user_id = _user_id AND day = (now() AT TIME ZONE 'utc')::date;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_analysis_quota(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refund_analysis_quota(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_analysis_quota(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_analysis_quota(uuid) TO service_role;