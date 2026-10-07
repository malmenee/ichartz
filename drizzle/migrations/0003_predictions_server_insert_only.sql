DROP POLICY IF EXISTS own_insert ON public.predictions;
REVOKE INSERT ON public.predictions FROM authenticated, anon;
GRANT ALL ON public.predictions TO service_role;