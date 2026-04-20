# Cloudflare Rebuild Runbook — BIZ-PAGES-PROD-DETANGLE-002

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S5.1
worker: Worker B
scope: minimal step-by-step rebuild sequence

required_references:
- /job_site/cloudflare_runtime_notes.md
- /job_site/deploy_cutover_spec.md

---

## Steps

1. Create new Cloudflare Pages/Worker project.
2. Define `wrangler.toml` as the source of truth for deploy config.
3. Bind `TENANTS_BUCKET` to the R2 bucket in the new project.
4. Deploy from repo root.
5. Verify the `/` route responds.
6. Confirm no dependency on the old Pages project.
