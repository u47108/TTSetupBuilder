# ADR-011: Builder — Compose Blade + FH + BH Dynamically

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |

## Context

A racket setup is a composition of parts. Storing or shipping pre-baked images of every blade + forehand rubber + backhand rubber combination is combinatorial and fights photography ownership (ADR-008). The builder UX must reflect the real mental model of assembling equipment.

## Decision

| Decision | Detail |
|----------|--------|
| **Model** | **Racket = Blade + FH (forehand rubber) + BH (backhand rubber)** |
| **No assembled racket image inventory** | The UI **never** stores (as catalog assets) images of pre-assembled rackets for every combination. |
| **Dynamic composition** | The builder **composes** the visual representation from the selected parts’ owned images (layers/overlay or equivalent UI composition). |

Builder state is client UI / URL-shareable draft state (ADR-005 / ADR-006); product media remains per-part (ADR-004 / ADR-008).

Route: `/builder`.

## Consequences

### Positive

- Avoids explosion of generated composite assets.
- Matches how players think about setups.
- Reuses owned part photography.

### Negative

- Composition UX (layering, alignment, empty slots) needs careful design.
- Some users may expect a single “final racket photo”; we communicate composition instead.

## Related docs

- [ADR-004](./ADR-004-data-model.md)
- [ADR-006](./ADR-006-routing.md)
- [ADR-008](./ADR-008-image-strategy.md)
- [`docs/PRODUCT_VISION.md`](../PRODUCT_VISION.md)
- [`docs/DATA_MODEL.md`](../DATA_MODEL.md)
- [`docs/NAVIGATION.md`](../NAVIGATION.md)
