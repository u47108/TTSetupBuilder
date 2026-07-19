# ADR-004: Data Model — Multiplicity First

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |

## Context

Naive product UIs and schemas often assume **one hero image**, one store link, or one review. That assumption collapses for a visual database: real equipment has galleries, multiple retailers as references, many reviews, videos, and associations to multiple players/setups. [`docs/DATA_MODEL.md`](../DATA_MODEL.md) already models media and relationships as first-class and many-to-many; this ADR locks the **frontend and product assumptions** to the same multiplicity.

## Decision

Every product is modeled and presented as having **collections**, never a single-asset mental model:

| Relation | Cardinality assumption |
|----------|------------------------|
| Images | **Multiple** (gallery; primary is a selection, not “the only image”) |
| Stores | **Multiple** (reference links only — ADR-001) |
| Reviews | **Multiple** |
| Videos | **Multiple** |
| Players | **Multiple** (via setups / usage associations) |

**Never** treat “a product has one image” as the default model in types, UI, API shapes, or loaders. Optional empty collections are fine; singleton-only fields for these relations are not.

Conceptually align with [`docs/DATA_MODEL.md`](../DATA_MODEL.md) (media links, store links, reviews, videos, player setups). If a simplified view needs one “cover” image, it is a **derived selection** from the image set, not the storage model.

## Consequences

### Positive

- UI (galleries, player chips, review lists) matches real data.
- Avoids migrations from “single image URL” to galleries later.
- Reinforces photography-first and honesty about sparse media (empty galleries are valid states).

### Negative

- Slightly more complex types and empty-state UX from day one.
- Agents must not invent `imageUrl: string` as the product’s media model without an explicit cover + `images[]` split.

## Related docs

- [`docs/DATA_MODEL.md`](../DATA_MODEL.md)
- [`docs/PRODUCT_VISION.md`](../PRODUCT_VISION.md)
- [ADR-001](./ADR-001-project-scope.md)
- [ADR-008](./ADR-008-image-strategy.md)
- [ADR-011](./ADR-011-builder.md)
