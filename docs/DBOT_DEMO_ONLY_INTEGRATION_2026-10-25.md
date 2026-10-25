# DBot demo-only integration — isolated review (25 October 2026)

## Scope
- Base: `feature/digitlab-integration-plan` at `ce84ebfb93233c6525984c1b09235bf31ac85c78`.
- Source reference: `deriv-com/bot` (archived upstream, default branch `master`). Preserve upstream copyright and licence notices when reusing code.
- Application repository: `erichamisi/trading-bot-template`; separate application: `erichamisi/deriv-digit-lab`.
- Existing Vercel project: `digitlab-ddbot-preview`, connected to `trading-bot-template`.
- This branch is **not** approved for production. No custom-domain changes, production merges, broker real-account execution, or paid collectors.

## Integration order
1. Assess the current bot editor, Blockly XML import/export, account startup and Deriv connection. Record gaps and dependency vulnerabilities.
2. Pin and audit dependencies; compare upstream code with existing template before selective reuse. Do not copy the entire archived application over the template.
3. Keep market data read-only until account type and demo execution boundaries are verified. Enforce virtual/demo-only status at the purchase gateway and all alternate order paths.
4. For actual demo purchases, require confirmed demo account identity; reject unrecognised, real, or indeterminate accounts closed. Never rely solely on UI button state or client-side feature flags.
5. Add input validation and sanitisation for XML; bound file size, reject external entities, do not evaluate imported user code or allow unsafe dynamic execution.
6. Add server-side or broker-side entitlement checks where applicable, and tests for direct API bypass, stale account state, OAuth callback failure and reconnect.
7. Integrate the existing loss caps, strategy stop conditions, and manual reset at the execution gate. Stop must prevent new purchases; pausing must not promise to cancel already-open contracts.
8. Verify in a separate preview only; collect build, unit-test, and manual acceptance evidence before any PR is considered for merge.

## Acceptance matrix (all unverified until tested)
- [ ] CI install and build pass with supported Node version.
- [ ] Type check and tests pass.
- [ ] Visual editor can open, edit, save and reload XML strategy.
- [ ] Invalid/oversized/malicious XML is safely rejected.
- [ ] Live market ticks are displayed without placing trades.
- [ ] A verified demo account can connect through configured OAuth.
- [ ] Real or unknown accounts cannot execute buy requests via UI or direct transport.
- [ ] Stop and risk limits are enforced in the actual execution gate.
- [ ] Preview URL functions and remains protected.
- [ ] Production project and primary domain remain unchanged.

## Deployment guardrails
- Do not merge to `master` or `main`.
- Use a non-production Git branch and Vercel preview target only; verify Vercel project-to-repository mapping before deployment.
- Do not copy production credentials into preview. Use separate OAuth registration and callback allowlist where available.
- Confirm preview settings cannot promote preview builds automatically to production.
- Stop work if the deployment pipeline appears to target production or enable live trading.

## Current evidence
- The archived upstream project specifies Node 20, React 18, Blockly 10 and Rsbuild.
- The existing integration branch uses Node 22/24, React 18 and Blockly 10.
- Vercel reported existing preview deployments in READY build state; functional behaviour was not established.
