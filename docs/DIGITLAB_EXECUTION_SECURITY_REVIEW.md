# DigitLab DDBot: execution security verification

**Status:** NOT VERIFIED FOR DEPLOYMENT. No automated build or integration-test result is available for this review.

## Observed source entry points

- `src/external/bot-skeleton/services/tradeEngine/trade/Purchase.js`: bot purchase method has two submission branches: proposal ID purchase and direct contract purchase. Both now call the deliberately fail-closed policy before initial submission and each retry.
- `src/external/bot-skeleton/services/api/appId.js`: creates shared Deriv WebSocket; branch intercepts outgoing `send()` and rejects recognised purchase-shaped JSON. Authentication-bearing WebSocket URLs must never be logged.
- `src/external/bot-skeleton/services/api/api-middleware.js`: middleware measures API requests, **not** an authorisation boundary.
- `src/external/bot-skeleton/services/tradeEngine/Interface/BotInterface.js`: exposes purchase call to bot logic.

## Remaining risks and mandatory tests

1. **SDK compatibility:** Verify DerivAPIBasic uses the patched socket instance for every purchase, including direct API calls and retries. Inspect all `new WebSocket`, `DerivAPIBasic`, `send`, `buy` and contract-execution paths. Other independently instantiated clients may bypass the wrapper.
2. **No server enforcement:** All guards are browser-side. They cannot control other clients with their own Deriv credentials. Do not describe them as absolute prevention of real trading.
3. **Demo authorisation:** Current bot purchases are intentionally blocked for *all* account types. Before allowing demo purchases, bind explicit user confirmation to an authenticated, verified Deriv demo account, and invalidate confirmation whenever account identity changes or the socket reconnects.
4. **Opaque messages:** Wrapper rejects non-JSON frames from JavaScript. Validate this does not block required SDK protocols or application heartbeats; keep fail closed until confirmed.
5. **Retries:** Simulate reconnect, account switch, stale session, account mismatch, pending retry and failed OAuth/token refresh. Assert **zero outbound buys**.
6. **UI and imported strategy controls:** Test Blockly/XML bot imports, quick strategies, manual terminals and other execution clients. The imported strategy must not bypass trade gates.
7. **Secrets:** Confirm no access/refresh tokens, OTPs, authentication-bearing URLs or personal account data are included in client logs, analytics, error telemetry or persistent databases.
8. **Toolchain:** Run `npm ci`, `npm run type-check`, `npm test -- --ci`, `npm run build` under Node 22 and 24. Review lockfile and vulnerable dependencies. Existing Node compatibility workflow should run on PRs but no run was confirmed for PR #3 during this review.
9. **Deployment:** No production deployment until explicit approval, independent review, functioning OAuth/PKCE configuration and passing checks.
10. **Safety defaults:** Production deployment must never infer consent from localStorage, URL parameters, client-written account type or merely a demo-looking prefix.

## Release decision

**BLOCKED** — do not merge or deploy this experimental bot for trading based solely on the branch-level checks. Use preview-only after test and security review; no demo or real buys until the verified demo-only workflow is implemented.
