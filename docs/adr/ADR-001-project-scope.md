# ADR-001: Project Scope — Visual Database, Not Ecommerce

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |

## Context

Table tennis equipment websites often optimize for selling: carts, deals, stock, and conversion funnels. Early product docs for TTSetupBuilder already describe a photography-first equipment knowledge base, but implementers and AI agents need a hard scope boundary so UI, data model, and copy cannot drift into retail patterns.

## Decision

TTSetupBuilder is a **visual database** for exploring table tennis equipment — **not** an ecommerce platform.

| We are | We are not |
|--------|------------|
| A catalog for discovery, comparison, and setup composition | A storefront that sells products |
| Photography-first exploration of blades, rubbers, and related gear | Cart, checkout, inventory, payments, or “Buy now” as primary UX |
| Products explored via media, attributes, players, and builds | SKUs optimized for conversion |

**Photography is primary content.** Large product images, galleries, and media provenance are first-class product features — not decoration around a purchase flow.

Stores may appear only as **reference context** (links, where something is sold historically). They must never imply that TTSetupBuilder sells or fulfills orders.

## Consequences

### Positive

- Clear anti-patterns for UI chrome (no cart, no promo ribbons, no deal badges as primary affordances).
- Aligns data model, navigation, and design system around exploration verbs: search, compare, build.
- Reduces scope: no payment, inventory, or order lifecycle.

### Negative

- Users looking for a shop must leave the app for purchases (by design).
- Monetization via commerce is out of scope unless a future ADR explicitly revisits this.

## Related docs

- [`docs/PRODUCT_VISION.md`](../PRODUCT_VISION.md)
- [`docs/FUNCTIONAL_REQUIREMENTS.md`](../FUNCTIONAL_REQUIREMENTS.md)
- [`docs/DATA_MODEL.md`](../DATA_MODEL.md)
- [`docs/ui/DESIGN_SYSTEM.md`](../ui/DESIGN_SYSTEM.md)
- [ADR-014](./ADR-014-offline-first-data-ownership.md) — data ownership complements this scope
