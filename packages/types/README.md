# @ttsetupbuilder/types

Shared TypeScript types for equipment, players, setups, and API contracts.

## Usage

```ts
import type { Product, Player, Brand } from '@ttsetupbuilder/types';
```

Minimal stubs for Milestone 1. Expand toward [`docs/DATA_MODEL.md`](../../docs/DATA_MODEL.md) as catalog features land.

**Constraints:** products expose `images[]` (ADR-004), never a single-image-only model.
