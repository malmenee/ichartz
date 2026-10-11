ALTER TABLE public.entitlements
  ADD COLUMN IF NOT EXISTS product text NOT NULL DEFAULT 'ict_pulse',
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS entitlements_user_product_idx ON public.entitlements(user_id, product);

CREATE TABLE public.stripe_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.stripe_events TO service_role;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;