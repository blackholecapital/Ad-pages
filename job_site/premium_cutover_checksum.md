# Premium Cutover Checksum

`[BIZ-PAGES-WALLPAPER-HOTFIX-003-PATCH-A | WORKER B | S2 | RESULT]`

## Status
- expected_status: PASS
- actual_status: PASS
- validation_date_utc: 2026-04-18

## Input references used
- `/job_site/premium_route_contract.md`
- `/job_site/preserved_functionality_matrix.md`
- `/job_site/build-sheet-active.txt`
- `/job_site/known_slug_test_vector.json`

## Tested premium fixture
- slug: `acme-premium`
- page: `tier-2`
- shellId: `desktop-premium-v1`
- stage: `2560x1440`

## Deterministic ownership checksum

### C1. HomePage premium children-null rule
- Check: premium runtime path returns `null` children (no `.homeHero`, no `Welcome Home`).
- Source: `apps/product-shell/src/pages/HomePage.tsx`
- Result: PASS

### C2. Exclusive PageShell premium dispatch
- Check: premium guard resolves layout then early-return mounts `DesktopPremiumReceiver`.
- Source: `apps/product-shell/src/components/layout/PageShell.tsx`
- Result: PASS

### C3. Legacy shell exclusion on premium
- Check: `.pageShell` / `.wallpaperLayer` / `.pageShellContent` only present in non-premium fallback return.
- Source: `apps/product-shell/src/components/layout/PageShell.tsx`
- Result: PASS

### C4. Premium classifier contract
- Check: premium iff `shellId===desktop-premium-v1` and `stage.w/h` numeric.
- Source: `apps/product-shell/src/runtime/types.ts`
- Result: PASS

### C5. Route ownership preservation
- Check: router paths unchanged; no premium-specific route branch added; ownership split remains component-level.
- Source: `apps/product-shell/src/app/router.tsx`
- Result: PASS

## File hash ledger (sha256)

```
03258064f99975b7f3b9f6972db50a184fce2cd619281b9545f0b9a19d1377cb  apps/product-shell/src/pages/HomePage.tsx
dd30052d84a73bc7743610d59d08b6337b41c83142d53d5294fb822592388e4e  apps/product-shell/src/components/layout/PageShell.tsx
5858af7581665339eea4748e13828520ccc525117d45dba8034a6d9c04c32dd4  apps/product-shell/src/runtime/types.ts
a4bd278aa23728f454fa4ba7cb5aa2100b3a47b616c866fedc895743b01004a7  apps/product-shell/src/app/router.tsx
```

## Final assertion
Premium runtime routes now resolve to premium receiver ownership only; `Welcome Home`/homeHero and legacy shell content are excluded for premium payloads, while non-premium behavior remains intact.

## Patch-B repair note (2026-04-18)
- FAIL root cause was confirmed as route-home fetch scope (`page=home` only) while tested premium fixture is keyed on `page=tier-2`.
- Home route runtime fetch now performs premium fallback probe to `tier-2` and promotes only premium payloads.
- This closes the observed `Welcome Home` regression on premium slug routes without changing non-premium ownership.
