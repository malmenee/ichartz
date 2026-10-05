CREATE TABLE public.trade_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prediction_id UUID NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
  style TEXT NOT NULL CHECK (style IN ('scalp', 'intraday', 'swing')),
  plan JSONB NOT NULL,
  news_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.trade_ideas TO authenticated;
GRANT ALL ON public.trade_ideas TO service_role;
ALTER TABLE public.trade_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select_trade_ideas" ON public.trade_ideas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_insert_trade_ideas" ON public.trade_ideas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_delete_trade_ideas" ON public.trade_ideas FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX trade_ideas_user_created_idx ON public.trade_ideas(user_id, created_at DESC);
CREATE INDEX trade_ideas_prediction_idx ON public.trade_ideas(prediction_id);