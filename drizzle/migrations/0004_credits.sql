CREATE TABLE public.credit_balances (
  user_id uuid PRIMARY KEY,
  credits integer NOT NULL DEFAULT 2 CHECK (credits >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_balances TO authenticated;
GRANT ALL ON public.credit_balances TO service_role;
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_select_credits ON public.credit_balances FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delta integer NOT NULL,
  reason text NOT NULL,
  stripe_event_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX credit_ledger_user_idx ON public.credit_ledger(user_id, created_at DESC);
GRANT SELECT ON public.credit_ledger TO authenticated;
GRANT ALL ON public.credit_ledger TO service_role;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_select_ledger ON public.credit_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Returns remaining credits after deduction, or NULL when the user has none.
CREATE OR REPLACE FUNCTION public.spend_credit(_user_id uuid, _reason text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _c integer;
BEGIN
  INSERT INTO public.credit_balances(user_id) VALUES (_user_id) ON CONFLICT DO NOTHING;
  UPDATE public.credit_balances SET credits = credits - 1, updated_at = now()
   WHERE user_id = _user_id AND credits > 0 RETURNING credits INTO _c;
  IF _c IS NULL THEN RETURN NULL; END IF;
  INSERT INTO public.credit_ledger(user_id, delta, reason) VALUES (_user_id, -1, _reason);
  RETURN _c;
END $$;

-- Adds credits; idempotent when _event_id is given. Returns new balance (NULL if event already applied).
CREATE OR REPLACE FUNCTION public.add_credits(_user_id uuid, _delta integer, _reason text, _event_id text DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _c integer;
BEGIN
  BEGIN
    INSERT INTO public.credit_ledger(user_id, delta, reason, stripe_event_id) VALUES (_user_id, _delta, _reason, _event_id);
  EXCEPTION WHEN unique_violation THEN RETURN NULL;
  END;
  INSERT INTO public.credit_balances(user_id) VALUES (_user_id) ON CONFLICT DO NOTHING;
  UPDATE public.credit_balances SET credits = credits + _delta, updated_at = now()
   WHERE user_id = _user_id RETURNING credits INTO _c;
  RETURN _c;
END $$;

REVOKE EXECUTE ON FUNCTION public.spend_credit(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_credits(uuid, integer, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_credit(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.add_credits(uuid, integer, text, text) TO service_role;