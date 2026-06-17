# Project Rules for Codex

## Validation

- Do not run visual checks in the in-app browser, Playwright, screenshots, DOM measurements, or browser-based audits unless the user explicitly asks for a browser/visual check in the current request.
- After code or layout changes, use `npm run build` as the default validation step when validation is needed.
- If the user says "не проводи визуальный аудит" or "только билд", only run the build and report the result.
