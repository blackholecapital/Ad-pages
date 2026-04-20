# Cloudflare Cutover Checklist — BIZ-PAGES-PROD-DETANGLE-002

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S5.2
worker: Worker B

required_references:
- /job_site/cloudflare_rebuild_runbook.md
- /job_site/cloudflare_runtime_notes.md

- [ ] confirm wrangler.toml exists in repo
- [ ] confirm TENANTS_BUCKET binding present
- [ ] confirm deploy command runs successfully
- [ ] confirm / route responds publicly
- [ ] confirm no redirect loops
- [ ] confirm assets resolve via new resolver contract
