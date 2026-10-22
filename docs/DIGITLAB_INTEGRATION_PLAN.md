# DigitLab integration: staged delivery and controls

Status: proposed integration plan only. This document does **not** enable trading or deploy code.

## Architecture and boundaries

- Existing DigitLab: `erichamisi/deriv-digit-lab` (private, React 19/Vite/Supabase), hosted on Vercel at `https://www.digitlabderivanalytics.online/`.
- Trading bot fork: `erichamisi/trading-bot-template` (React 18/RSBuild). Keep build and dependencies isolated; do not copy bot runtime into the DigitLab Vite app until tested.
- First deployment: a separately hosted bot app on a dedicated hostname (proposed `bot.digitlabderivanalytics.online`, DNS and Vercel project pending). Add a navigation link from DigitLab after review.
- Identity: Deriv OAuth 2.0 Authorization Code + PKCE for Deriv accounts; Supabase authentication for DigitLab app profiles and journal storage. Do not treat a Deriv access token as a Supabase session or store Deriv tokens in Supabase.
- Never commit OAuth tokens, refresh tokens, client secrets or credentials. Configure public OAuth client ID using approved deployment environment variables. Register the exact bot callback origin/path with Deriv. Restrict Vercel environment variables to their intended environments.

## Delivery milestones

1. Baseline: inspect bot dependencies, licence, provenance and upstream update policy. Run clean install, lint/test/build and dependency/security checks on a non-production preview.
2. Branding: configure `brand.config.json` for DigitLab black-and-gold, logos, menu and test hostname; keep the four Deriv OAuth/DerivWS endpoints unchanged. Regenerate styles using `npm run generate:brand-css`.
3. OAuth: configure Deriv CLIENT_ID and callback for preview and production separately. Verify PKCE S256, CSRF state validation, login, registration, logout, token expiry and account switching. Remove tokens, OTPs and sensitive URLs from logs.
4. Demo gate: **fail closed**, including on account switching, reconnect, import of Blockly/XML strategies and direct purchase/proposal endpoints. Enforce the demo-only decision at the shared trade execution service, not only via UI switches. Reject unknown account type. Test real account selection and all execution routes to prove rejection.
5. User experience: Beginner Mode = guided lessons + simulated/demo-only practice. Advanced Mode = SmartCharts, Blockly bot builder, research, backtests and journal. Clearly label hypothetical probabilities and unvalidated strategies.
6. Journal: keep personal trading records in Supabase under per-user RLS policies. Persist only minimum trade fields, avoid storing credentials, and prevent client-provided user IDs from bypassing ownership enforcement.
7. Preview: use isolated Vercel preview deployment and Deriv demo account. Validate mobile UI, WebSocket retries, rate limits, disconnections, accidental duplicate buys and high-frequency bot stop controls.
8. Controlled launch: security and trading-risk review, backups, monitoring, legal/compliance disclosures and documented rollback before connecting links to the primary DigitLab site.

## Trading protections

- Defaults: `REAL_TRADING_ENABLED=false`, `AUTO_TRADING_ENABLED=false`, `PAID_COLLECTOR_ENABLED=false`. These are proposed *policy defaults*, not yet implemented configuration keys. Do not assume environment toggles alone enforce safety.
- Explicit user approval required before any real-money trading or paid collector activation. Keep real account orders blocked at execution layer unless separately reviewed and authorised.
- Enforce demo stake cap at 2% of starting/current demo balance as defined by product policy, with independent daily and session loss guardrails; simulation target limits of +20% / -20% are not a guarantee of profitability.
- Historical probability estimates must not be displayed as certainty; remove arbitrary 99% confidence filters unless statistically validated on out-of-sample data.
- Limit order rate and concurrency, include deliberate start/stop control and idempotency/duplicate order prevention. Faster execution does not predict wins.
- Treat imported Blockly/XML strategy files as untrusted inputs; validate/sanitise, set size and complexity limits, and prevent dynamic script execution.
- Never enable or bypass real-money controls via query parameters, browser storage, bot import files or client-side toggles.

## Verification checklist

- [ ] Fork builds and tests on preview
- [ ] Licence and dependency/security review complete
- [ ] Branding changes reviewed
- [ ] Deriv app and exact callback origins registered
- [ ] PKCE and state validation tested
- [ ] Supabase RLS verified for profiles and journal
- [ ] All buy/execution paths reject real accounts by default
- [ ] Demo order placement, bot stop and account switches tested
- [ ] Rate limiting and duplicate orders tested
- [ ] No sensitive tokens in logs or storage beyond approved temporary session model
- [ ] No paid usage or trading features enabled
- [ ] No production deployment without explicit approval

## Repository workflow

Use feature branches and draft PRs. Protect `master`. Keep the existing DigitLab production repository unchanged until separate reviewed integration PRs are ready.