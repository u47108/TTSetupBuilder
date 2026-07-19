# ADR-007: UI Design — Dark-Only, Photography First

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |

## Context

[`docs/ui/DESIGN_SYSTEM.md`](../ui/DESIGN_SYSTEM.md) specifies **dark-first** with a **future light theme** for parity. Shipping dual themes early risks half-finished light mode and diluted photography presentation. The product decision for the current phase is harder: **dark only**.

## Decision

| Decision | Detail |
|----------|--------|
| **Dark First / Dark only** | Ship and maintain **dark theme only**. No light theme for now. |
| **Glass** | Glass-like surfaces where they support hierarchy without obscuring photography. |
| **Cards** | Cards allowed when they are purposeful interaction/content containers — not retail card spam (align DESIGN_SYSTEM restraint). |
| **Rounded XL** | Large corner radii as the default for interactive/content shells. |
| **Motion** | Intentional motion (Framer Motion) for hierarchy and presence — not decorative noise. |
| **Photography First** | Large images; media leads layout; chrome stays quiet. |

**Override:** If DESIGN_SYSTEM §2 (“light theme future”) conflicts with this ADR, **ADR-007 wins**: light theme is **not** in scope until a future ADR explicitly accepts dual-theme parity. Do not implement `prefers-color-scheme` light switching or a theme toggle that implies light is available.

Visual language otherwise continues to follow [`docs/ui/DESIGN_SYSTEM.md`](../ui/DESIGN_SYSTEM.md) and [`docs/ui/COMPONENT_LIBRARY.md`](../ui/COMPONENT_LIBRARY.md) where they do not conflict.

## Consequences

### Positive

- One coherent cinematic look for galleries and product photography.
- No dual-theme maintenance cost during bootstrap.
- Clear agent rule: do not add light theme “for completeness.”

### Negative

- Daylight / print-adjacent users wait for a future ADR.
- DESIGN_SYSTEM light specs (§17 and related) are deferred, not deleted.

## Related docs

- [`docs/ui/DESIGN_SYSTEM.md`](../ui/DESIGN_SYSTEM.md)
- [`docs/ui/COMPONENT_LIBRARY.md`](../ui/COMPONENT_LIBRARY.md)
- [`docs/PRODUCT_VISION.md`](../PRODUCT_VISION.md)
- [ADR-001](./ADR-001-project-scope.md)
- [ADR-008](./ADR-008-image-strategy.md)
