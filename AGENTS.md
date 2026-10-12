<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep ICT Pulse's transcript-derived educational guide in a browser-safe typed module and live calendar fetching in a server function; this separates stable reference material from changing external data.
- Persist generated trade plans as user-owned records linked to their source prediction; this keeps the personal workspace durable and auditable.
- Credits are changed only through service-role SQL functions (spend_credit / add_credits) with a ledger row per change; this keeps balances atomic and auditable and makes Stripe top-ups idempotent by event ID.
- Premium ICT Pulse content lives in a server-only module returned by an entitlement-checked server function; gating in the UI alone would still ship the content to everyone.
