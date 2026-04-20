# Mobile overlay deployment namespace

These files are intentionally isolated so mobile layout can be tuned separately from desktop runtime rendering.

## Primary mobile edit surface
- `src/mobile/styles/mobile-overlay.css`

## Runtime contract
- Mobile cards are compiled by the worker into a dedicated mobile layout.
- Frontend renders the mobile layout through:
  - `src/components/tenant/MobilePublishedOverlayStage.tsx`

## Safe edit boundaries
- Typography
- Padding
- Border radius
- Card spacing visuals
- Mobile-only max widths
- Mobile-only body line spacing

## Do not change here
- API payload shape
- worker manifest logic
- slug/page routing
- desktop overlay coordinates
