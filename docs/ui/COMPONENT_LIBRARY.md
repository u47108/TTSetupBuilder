# Component Library — TTSetupBuilder

> Complete inventory specification for the intended React component library.
> **Documentation only** — no implementation contracts as code; prop names and types are conceptual.

**Status:** Living specification  
**Audience:** Design systems, frontend engineering, AI assistants generating UI  
**Package intent:** Shared primitives and domain composites in `packages/ui`; route shells, data wiring, and page compositions in `apps/web`  
**Aligns with:** `docs/PRODUCT_VISION.md` (and future `DESIGN_SYSTEM.md`, `NAVIGATION.md`, `FUNCTIONAL_REQUIREMENTS.md`, `DATA_MODEL.md`)

---

## 0. How to read this document

| Term | Meaning |
|------|---------|
| **Primitive** | Low-level, domain-agnostic building block (button, input, dialog shell). No product/player knowledge. |
| **Composite** | Assembles primitives + tokens into a reusable pattern with a clear job (product card, search typeahead). May know domain shape conceptually. |
| **Domain composite** | Composite whose API is framed in TTSetupBuilder entities (Product, Player, Setup, Build, Collection, Media). |
| **Page-level** | Route composition in `apps/web`: fetches data, owns URL state, assembles composites. Not exported from `packages/ui`. |
| **Chrome** | Persistent app shell pieces (nav, compare tray, AI dock) that span routes. |

**Prop tables** use prose types (`string`, `ReactNode`, `ProductSummary`, callbacks). Required props are marked **required**; others are optional unless noted.

**Anti-goals inherited from product vision:** no cart, no primary “Buy now”, no sale-ribbon chrome on photography, no dashboard-widget home.

---

## 1. Composition principles

### 1.1 Hierarchy

```text
tokens / theme
  → primitives (Button, Text, Input, Dialog, …)
    → pattern composites (MediaFrame, AttributeTable, FilterChipGroup, …)
      → domain composites (ProductCard, PlayerHero, BuilderCanvas, …)
        → feature regions (CompareWorkspace, SearchExperience, …)
          → page-level routes (apps/web only)
```

### 1.2 Rules

1. **One responsibility per component.** If a name needs “and”, split it.
2. **Photography owns the eye.** Media components never accept promotional overlay slots (sale badges, floating promo chips). Metadata chrome beside or below images is preferred; on-image chrome is limited to inspection affordances (zoom, angle, compare pin).
3. **Composites receive view-models, not raw API rows.** Pages map server/entity data → stable summary types (`ProductSummary`, `PlayerSummary`, etc.) before rendering cards/heroes.
4. **Selection is a first-class verb.** Cards, grids, and search results expose optional selection/compare hooks without forcing ecommerce “add to cart” metaphors.
5. **Unknown is a state.** Prefer `UnknownBadge` / empty attribute cells over inventing ratings.
6. **URL-friendly state lives in pages.** Composites may emit events (`onFilterChange`); pages own search params and shareable compare/build URLs.
7. **Motion clarifies hierarchy** (grid → detail, gallery → lightbox). Primitives may expose `reducedMotion` respect via design tokens; do not sprinkle decorative bounce on every card.
8. **Accessibility is part of the component contract**, not a page afterthought (see §3).

### 1.3 Package placement

| Layer | Location | Examples |
|-------|----------|----------|
| Primitives & pattern composites | `packages/ui` | `Button`, `Dialog`, `MediaFrame`, `Skeleton` |
| Domain composites | `packages/ui` (domain folder) | `ProductCard`, `PlayerSetupCard`, `BuilderSlot` |
| Feature regions that are still reusable | `packages/ui` if agnostic of Next.js; else `apps/web/features/*` | `CompareTray` (ui), `AiAssistantDock` (ui chrome), page data hooks (web) |
| Page shells & route layouts | `apps/web` | `ProductDetailPage`, `ExplorePage` |
| Admin-only composites | `packages/ui/admin` *or* `apps/web/admin/components` | Prefer web-only until admin design system stabilizes; document both |

**Default bias:** if it has no Next.js `useRouter` / RSC-only APIs and is used in more than one route, put it in `packages/ui`.

### 1.4 Photography-first constraints (library-wide)

- No default “discount”, “new”, “hot”, or affiliate badge slots on `ProductCard` / `ProductHeroGallery` image planes.
- Trust/confidence labels (`Verified`, `Unverified`, `Rumored`) are allowed as **text-adjacent** badges, not image stickers.
- Missing media must use `MediaMissingState` (visible data debt), never silent broken icons.
- Video is opt-in and secondary to still inspection (`VideoPlayer` does not autoplay with sound; stills remain default PDP focus).
- Compare and builder prioritize aligned photography before dense tables.

---

## 2. Primitive vs composite vs page-level (quick map)

| Kind | Count (approx.) | Role |
|------|-----------------|------|
| Primitives | ~35 | Accessibility shells, inputs, feedback |
| Pattern composites | ~25 | Media, filters, tables, states without entity names |
| Domain composites | ~70 | Product, player, builder, compare, gallery, review, AI chrome |
| Admin composites | ~15 | CMS / moderation / media QA |
| Page-level (documented for completeness, not in `packages/ui`) | ~12 | Route assemblies |

Exact inventory follows by category. Names listed are the **canonical React component names**.

---

## 3. Accessibility responsibilities (component-level)

Every interactive component owns:

| Concern | Owner expectation |
|---------|-------------------|
| **Name** | Accessible name via visible label, `aria-label`, or labelled-by relationship |
| **Role** | Correct landmark / widget role (`dialog`, `listbox`, `tablist`, `img`, etc.) |
| **Keyboard** | Full operation without pointer; documented focus order for composites |
| **Focus** | Visible focus ring from tokens; modals/drawers trap focus and restore on close |
| **State** | `aria-expanded`, `aria-selected`, `aria-busy`, `aria-invalid`, live regions for async results |
| **Media** | Meaningful `alt` (product/player context); decorative images marked empty alt; captions when alt cannot carry detail |
| **Motion** | Honor `prefers-reduced-motion` for non-essential transitions |
| **Contrast** | Text/icons meet token contrast; overlays on photos use scrim only when necessary for controls |
| **Errors** | Form errors linked via `aria-describedby`; announcements for toast/compare tray changes |

Domain components that display ratings or confidence must expose that information in text, not color alone.

---

## 4. Layout

### 4.1 `AppShell`

| Field | Detail |
|-------|--------|
| **Responsibility** | Top-level application chrome: header slot, main landmark, optional side nav, compare tray slot, AI dock slot, footer. |
| **Props** | `header` (ReactNode, required); `children` (ReactNode, required); `sideNav` (ReactNode); `compareTray` (ReactNode); `aiDock` (ReactNode); `footer` (ReactNode); `variant` (`default` \| `immersive` — immersive reduces chrome for gallery/builder). |
| **Relationships** | Composes `SiteHeader`, `MainContent`, slots for `CompareTray` / `AiAssistantDock`. Used by page-level layouts in `apps/web`. |
| **Do not use for** | Marketing landing one-offs that need a different first viewport composition — use a dedicated marketing layout. |
| **Package** | `packages/ui` (layout) |

### 4.2 `SiteHeader`

| Field | Detail |
|-------|--------|
| **Responsibility** | Persistent header: brand, primary nav, search trigger, compare indicator, account/saved entry. |
| **Props** | `brand` (ReactNode, required); `nav` (ReactNode, required); `search` (ReactNode); `compareIndicator` (ReactNode); `account` (ReactNode); `sticky` (boolean, default true). |
| **Relationships** | Uses `BrandMark`, `PrimaryNav`, may embed `SearchTrigger`. Used by `AppShell`. |
| **Do not use for** | In-page section headers — use `PageHeader`. |
| **Package** | `packages/ui` |

### 4.3 `BrandMark`

| Field | Detail |
|-------|--------|
| **Responsibility** | Wordmark / logo linking home; hero-capable size variants. |
| **Props** | `href` (string, required); `size` (`sm` \| `md` \| `lg` \| `hero`); `title` (string, accessible name). |
| **Relationships** | Used by `SiteHeader`, Explore hero regions. |
| **Do not use for** | Decorative watermarks over product photos. |
| **Package** | `packages/ui` |

### 4.4 `MainContent`

| Field | Detail |
|-------|--------|
| **Responsibility** | Landmark wrapper for primary page content with max-width and rhythm tokens. |
| **Props** | `children` (required); `width` (`narrow` \| `default` \| `wide` \| `fullBleed`); `padding` (`none` \| `default`). |
| **Relationships** | Used inside `AppShell`. |
| **Do not use for** | Modal body — use `Dialog` content. |
| **Package** | `packages/ui` |

### 4.5 `PageHeader`

| Field | Detail |
|-------|--------|
| **Responsibility** | In-page title region: title, optional eyebrow, short support text, actions. One job per page section. |
| **Props** | `title` (string \| ReactNode, required); `eyebrow` (string); `description` (string); `actions` (ReactNode); `align` (`start` \| `center`). |
| **Relationships** | Uses `Heading`, `Text`, `ButtonGroup`. Used by catalog, player, builder pages. |
| **Do not use for** | Card titles inside grids. |
| **Package** | `packages/ui` |

### 4.6 `Section`

| Field | Detail |
|-------|--------|
| **Responsibility** | Semantic section with one headline and optional support sentence; enforces single-purpose spacing. |
| **Props** | `id` (string); `title` (string); `description` (string); `children` (required); `actions` (ReactNode). |
| **Relationships** | Used on PDP, player pages, explore. |
| **Do not use for** | Nested “card stacks” of unrelated modules. |
| **Package** | `packages/ui` |

### 4.7 `Stack`

| Field | Detail |
|-------|--------|
| **Responsibility** | Vertical or horizontal spacing primitive. |
| **Props** | `direction` (`row` \| `column`); `gap` (token scale); `align`; `justify`; `wrap` (boolean); `children` (required). |
| **Relationships** | Primitive used everywhere. |
| **Package** | `packages/ui` |

### 4.8 `Grid`

| Field | Detail |
|-------|--------|
| **Responsibility** | Responsive grid for photo-first catalogs and collections. |
| **Props** | `columns` (responsive map); `gap`; `children` (required); `minItemWidth` (CSS length for auto-fill grids). |
| **Relationships** | Used by `ProductGrid`, `PlayerGrid`, gallery mosaics. |
| **Do not use for** | Form layouts — use `FormLayout`. |
| **Package** | `packages/ui` |

### 4.9 `SplitPane`

| Field | Detail |
|-------|--------|
| **Responsibility** | Two-pane layout (e.g., builder canvas + parts list; compare photos + matrix). |
| **Props** | `primary` (ReactNode, required); `secondary` (ReactNode, required); `ratio` (number); `collapseBelow` (breakpoint); `primaryLabel` / `secondaryLabel` (string, a11y). |
| **Relationships** | Used by Builder and Compare workspaces. |
| **Package** | `packages/ui` |

### 4.10 `StickyRegion`

| Field | Detail |
|-------|--------|
| **Responsibility** | Sticky filter bar or tool chrome that does not obscure photography unnecessarily. |
| **Props** | `children` (required); `offset` (number); `position` (`top` \| `bottom`); `elevation` (boolean). |
| **Relationships** | Used by `FilterBar`, `CompareTray` (when docked). |
| **Do not use for** | Floating promo banners. |
| **Package** | `packages/ui` |

### 4.11 `FullBleed`

| Field | Detail |
|-------|--------|
| **Responsibility** | Breaks out of content width for hero photography planes. |
| **Props** | `children` (required); `as` (element type). |
| **Relationships** | Used by Explore hero, PDP media when immersive. |
| **Package** | `packages/ui` |

### 4.12 `Container`

| Field | Detail |
|-------|--------|
| **Responsibility** | Width-constrained content box with horizontal padding tokens. |
| **Props** | `size` (`sm` \| `md` \| `lg` \| `xl`); `children` (required). |
| **Package** | `packages/ui` |

---

## 5. Navigation

### 5.1 `PrimaryNav`

| Field | Detail |
|-------|--------|
| **Responsibility** | Top-level IA links: Explore / Equipment / Players / Builder (and later Learn). |
| **Props** | `items` (array of `{ id, label, href, isActive }`, required); `orientation` (`horizontal` \| `vertical`); `onNavigate` (callback). |
| **Relationships** | Used by `SiteHeader`, mobile `NavDrawer`. |
| **Do not use for** | PDP in-page tabs — use `Tabs`. |
| **Package** | `packages/ui` |

### 5.2 `SecondaryNav`

| Field | Detail |
|-------|--------|
| **Responsibility** | Section-level links (category → brand breadcrumbs-adjacent nav). |
| **Props** | `items` (required); `ariaLabel` (string, required). |
| **Package** | `packages/ui` |

### 5.3 `Breadcrumbs`

| Field | Detail |
|-------|--------|
| **Responsibility** | Hierarchy trail for catalog and admin. |
| **Props** | `items` (array of `{ label, href? }`, required); `separator` (ReactNode). |
| **Relationships** | Uses `Link` primitive. |
| **Package** | `packages/ui` |

### 5.4 `Tabs`

| Field | Detail |
|-------|--------|
| **Responsibility** | In-page mutually exclusive panels (e.g., product attributes vs appearances). |
| **Props** | `items` (array of `{ id, label, panel }`, required); `value` / `defaultValue`; `onChange`; `orientation`. |
| **Do not use for** | Primary site navigation. |
| **Package** | `packages/ui` |

### 5.5 `Pagination`

| Field | Detail |
|-------|--------|
| **Responsibility** | Page-number or cursor controls when infinite scroll is not used. |
| **Props** | `page` (number, required); `pageCount` (number); `hasNext` / `hasPrevious` (boolean); `onPageChange` (required); `mode` (`numbered` \| `cursor`). |
| **Package** | `packages/ui` |

### 5.6 `InfiniteScrollSentinel`

| Field | Detail |
|-------|--------|
| **Responsibility** | Intersection observer sentinel announcing load-more for photo grids. |
| **Props** | `onVisible` (callback, required); `disabled` (boolean); `loadingLabel` (string). |
| **Relationships** | Used by `ProductGrid`, `GalleryGrid`. |
| **Package** | `packages/ui` |

### 5.7 `NavDrawer`

| Field | Detail |
|-------|--------|
| **Responsibility** | Mobile primary navigation drawer. |
| **Props** | `open` (boolean, required); `onOpenChange` (required); `children` (required); `title` (string). |
| **Relationships** | Composes `Drawer`. Used by `SiteHeader` mobile pattern. |
| **Package** | `packages/ui` |

### 5.8 `Link`

| Field | Detail |
|-------|--------|
| **Responsibility** | Styled anchor primitive; app may inject Next.js link via `asChild` / render prop. |
| **Props** | `href` (required); `children` (required); `external` (boolean); `asChild` (boolean). |
| **Package** | `packages/ui` (primitive); Next adapter in `apps/web` |

### 5.9 `SkipToContent`

| Field | Detail |
|-------|--------|
| **Responsibility** | Skip link to `#main` for keyboard users. |
| **Props** | `targetId` (string, default `main`); `label` (string). |
| **Package** | `packages/ui` |

### 5.10 `TocNav`

| Field | Detail |
|-------|--------|
| **Responsibility** | On-page table of contents for long learn / admin docs views. |
| **Props** | `items` (required); `activeId` (string). |
| **Package** | `packages/ui` |

---

## 6. Primitives — actions, typography, feedback

### 6.1 `Button`

| Field | Detail |
|-------|--------|
| **Responsibility** | Primary interactive action control. |
| **Props** | `children` (required); `variant` (`primary` \| `secondary` \| `ghost` \| `danger` \| `quiet`); `size`; `disabled`; `loading`; `type`; `onClick`; `leadingIcon` / `trailingIcon`; `aria-label` when icon-only. |
| **Do not use for** | Navigation that is purely a link — use `Link` or `Button` with `asChild` linking. Avoid “Buy” as primary variant. |
| **Package** | `packages/ui` |

### 6.2 `IconButton`

| Field | Detail |
|-------|--------|
| **Responsibility** | Compact icon-only control (compare, favorite, close, zoom). |
| **Props** | `label` (string, required — accessible name); `icon` (ReactNode, required); `variant`; `size`; `pressed` (boolean for toggles); `onClick`. |
| **Package** | `packages/ui` |

### 6.3 `ButtonGroup`

| Field | Detail |
|-------|--------|
| **Responsibility** | Groups related actions with consistent spacing and optional segmented look. |
| **Props** | `children` (required); `attached` (boolean); `orientation`. |
| **Package** | `packages/ui` |

### 6.4 `Heading`

| Field | Detail |
|-------|--------|
| **Responsibility** | Semantic heading levels with display/body scale tokens. |
| **Props** | `level` (1–6, required); `visualLevel` (optional override); `children` (required). |
| **Package** | `packages/ui` |

### 6.5 `Text`

| Field | Detail |
|-------|--------|
| **Responsibility** | Body / support / caption text styles. |
| **Props** | `variant` (`body` \| `support` \| `caption` \| `overline`); `as`; `tone` (`default` \| `muted` \| `danger`); `children` (required). |
| **Package** | `packages/ui` |

### 6.6 `VisuallyHidden`

| Field | Detail |
|-------|--------|
| **Responsibility** | Screen-reader-only text. |
| **Props** | `children` (required). |
| **Package** | `packages/ui` |

### 6.7 `Icon`

| Field | Detail |
|-------|--------|
| **Responsibility** | SVG icon wrapper with size tokens; decorative vs informative. |
| **Props** | `name` or `children`; `size`; `decorative` (boolean, default true). |
| **Package** | `packages/ui` |

### 6.8 `Spinner`

| Field | Detail |
|-------|--------|
| **Responsibility** | Indeterminate loading indicator. |
| **Props** | `size`; `label` (string, required for a11y when standalone). |
| **Package** | `packages/ui` |

### 6.9 `ProgressBar`

| Field | Detail |
|-------|--------|
| **Responsibility** | Determinate progress (uploads, scraper jobs in admin). |
| **Props** | `value` (0–100, required); `label` (string, required); `showValue` (boolean). |
| **Package** | `packages/ui` |

### 6.10 `Skeleton`

| Field | Detail |
|-------|--------|
| **Responsibility** | Placeholder shimmer for loading layouts. |
| **Props** | `width`; `height`; `radius`; `variant` (`text` \| `media` \| `avatar` \| `rect`). |
| **Package** | `packages/ui` |

### 6.11 `Toast` / `ToastViewport` / `ToastProvider`

| Field | Detail |
|-------|--------|
| **Responsibility** | Transient feedback (added to compare, build saved). |
| **Props** | Toast: `title` (required); `description`; `tone`; `action`; `duration`. Provider wraps app. |
| **Do not use for** | Persistent errors blocking a form — use inline `FormErrorSummary`. |
| **Package** | `packages/ui` |

### 6.12 `InlineAlert`

| Field | Detail |
|-------|--------|
| **Responsibility** | In-context alert (unverified setup claim, missing media debt). |
| **Props** | `tone` (`info` \| `warning` \| `danger` \| `success`); `title`; `children` (required); `icon`. |
| **Package** | `packages/ui` |

### 6.13 `Tooltip`

| Field | Detail |
|-------|--------|
| **Responsibility** | Short hover/focus hint for icon controls. |
| **Props** | `content` (required); `children` (required); `delay`. |
| **Do not use for** | Essential information — keep that visible. |
| **Package** | `packages/ui` |

### 6.14 `Kbd`

| Field | Detail |
|-------|--------|
| **Responsibility** | Keyboard shortcut glyph display. |
| **Props** | `keys` (string[], required). |
| **Package** | `packages/ui` |

### 6.15 `Divider`

| Field | Detail |
|-------|--------|
| **Responsibility** | Visual separator; optional labeled. |
| **Props** | `orientation`; `label`. |
| **Package** | `packages/ui` |

### 6.16 `Avatar`

| Field | Detail |
|-------|--------|
| **Responsibility** | Player or user face thumbnail (secondary to equipment photography). |
| **Props** | `src`; `alt` (required if src); `fallback` (string, required); `size`. |
| **Package** | `packages/ui` |

### 6.17 `Tag` (neutral chip)

| Field | Detail |
|-------|--------|
| **Responsibility** | Non-interactive taxonomy label (category, era, style). Interactive filters use `FilterChip`. |
| **Props** | `children` (required); `tone` (`neutral` \| `subtle`). |
| **Package** | `packages/ui` |

---

## 7. Forms & inputs

### 7.1 `Form`

| Field | Detail |
|-------|--------|
| **Responsibility** | Form element with optional native or headless validation wiring. |
| **Props** | `onSubmit` (required); `children` (required); `id`. |
| **Package** | `packages/ui` |

### 7.2 `FormField`

| Field | Detail |
|-------|--------|
| **Responsibility** | Label + control + hint + error assembly. |
| **Props** | `label` (string, required); `htmlFor` (required); `hint`; `error`; `required` (boolean); `children` (required). |
| **Package** | `packages/ui` |

### 7.3 `FormLayout`

| Field | Detail |
|-------|--------|
| **Responsibility** | Stacked or two-column form rhythm. |
| **Props** | `columns` (1 \| 2); `children` (required). |
| **Package** | `packages/ui` |

### 7.4 `FormErrorSummary`

| Field | Detail |
|-------|--------|
| **Responsibility** | Focusable summary of form errors for screen readers and keyboard users. |
| **Props** | `errors` (array of `{ id, message }`, required); `title` (string). |
| **Package** | `packages/ui` |

### 7.5 `TextInput`

| Field | Detail |
|-------|--------|
| **Responsibility** | Single-line text entry. |
| **Props** | `value` / `defaultValue`; `onChange`; `name`; `placeholder`; `disabled`; `invalid`; `autoComplete`; `inputMode`. |
| **Package** | `packages/ui` |

### 7.6 `TextArea`

| Field | Detail |
|-------|--------|
| **Responsibility** | Multi-line text (reviews, admin notes). |
| **Props** | Same family as `TextInput` plus `rows`. |
| **Package** | `packages/ui` |

### 7.7 `NumberInput`

| Field | Detail |
|-------|--------|
| **Responsibility** | Numeric attributes (sponge thickness mm, ratings when editing admin). |
| **Props** | `value`; `onChange`; `min`; `max`; `step`; `unit` (string suffix display). |
| **Package** | `packages/ui` |

### 7.8 `Select`

| Field | Detail |
|-------|--------|
| **Responsibility** | Single-select listbox-styled dropdown. |
| **Props** | `options` (array of `{ value, label, disabled? }`, required); `value`; `onChange`; `placeholder`; `invalid`. |
| **Package** | `packages/ui` |

### 7.9 `Combobox`

| Field | Detail |
|-------|--------|
| **Responsibility** | Filterable select for large lists (brands, players in admin and builder). |
| **Props** | `options` (required); `value`; `onChange`; `onQueryChange`; `loading`; `emptyMessage`. |
| **Relationships** | Distinct from `SearchTypeahead` (which is discovery-first with photos). |
| **Package** | `packages/ui` |

### 7.10 `Checkbox` / `CheckboxGroup`

| Field | Detail |
|-------|--------|
| **Responsibility** | Boolean and multi-boolean inputs. |
| **Props** | Checkbox: `checked`; `onChange`; `label` (required); `indeterminate`. Group: `legend` (required); `children`. |
| **Package** | `packages/ui` |

### 7.11 `Radio` / `RadioGroup`

| Field | Detail |
|-------|--------|
| **Responsibility** | Exclusive choice within a set. |
| **Props** | Group: `name`; `value`; `onChange`; `legend` (required); `children`. |
| **Package** | `packages/ui` |

### 7.12 `Switch`

| Field | Detail |
|-------|--------|
| **Responsibility** | Binary settings toggle (e.g., show unverified setups). |
| **Props** | `checked`; `onChange`; `label` (required). |
| **Package** | `packages/ui` |

### 7.13 `Slider`

| Field | Detail |
|-------|--------|
| **Responsibility** | Range control for numeric filters (hardness band, weight). |
| **Props** | `value` (number \| `[number, number]`); `onChange`; `min`; `max`; `step`; `label` (required). |
| **Package** | `packages/ui` |

### 7.14 `FileDropzone`

| Field | Detail |
|-------|--------|
| **Responsibility** | Image upload target for admin / community contributions. |
| **Props** | `accept` (mime list); `multiple`; `onFiles` (required); `maxSizeBytes`; `hint`; `disabled`. |
| **Do not use for** | Public PDP browsing. |
| **Package** | `packages/ui` |

### 7.15 `PasswordInput`

| Field | Detail |
|-------|--------|
| **Responsibility** | Auth forms when accounts exist. |
| **Props** | Extends `TextInput` with `revealToggle` (boolean). |
| **Package** | `packages/ui` |

### 7.16 `SearchInput`

| Field | Detail |
|-------|--------|
| **Responsibility** | Styled search field primitive (no results UI). |
| **Props** | `value`; `onChange`; `onSubmit`; `placeholder`; `clearable`; `leadingIcon`. |
| **Relationships** | Used inside `SearchTypeahead`, `SearchPageHeader`. |
| **Package** | `packages/ui` |

---

## 8. Filters

### 8.1 `FilterBar`

| Field | Detail |
|-------|--------|
| **Responsibility** | Sticky, lightweight filter chrome for catalog and search without destroying visual browsing. |
| **Props** | `children` (required); `activeCount` (number); `onClearAll` (callback); `resultCountLabel` (string). |
| **Relationships** | Composes `StickyRegion`, `FilterChipGroup`, `SortSelect`. |
| **Package** | `packages/ui` |

### 8.2 `FilterChip`

| Field | Detail |
|-------|--------|
| **Responsibility** | Toggleable filter token (brand, category, style, era). |
| **Props** | `label` (required); `selected` (boolean); `onSelect`; `count` (number); `disabled`. |
| **Do not use for** | Static taxonomy display — use `Tag`. |
| **Package** | `packages/ui` |

### 8.3 `FilterChipGroup`

| Field | Detail |
|-------|--------|
| **Responsibility** | Group of related chips with legend and multi/single mode. |
| **Props** | `legend` (required); `mode` (`single` \| `multiple`); `children` (required); `collapsible`. |
| **Package** | `packages/ui` |

### 8.4 `FilterPanel`

| Field | Detail |
|-------|--------|
| **Responsibility** | Expandable / drawer-hosted dense filters for power users. |
| **Props** | `open`; `onOpenChange`; `children` (required); `title`. |
| **Relationships** | May open inside `Drawer` on mobile. |
| **Package** | `packages/ui` |

### 8.5 `SortSelect`

| Field | Detail |
|-------|--------|
| **Responsibility** | Sort control respecting exploration (relevance, newest photography, view popularity — not “best selling”). |
| **Props** | `options` (required); `value`; `onChange`; `label` (default “Sort”). |
| **Do not use for** | Ecommerce popularity-by-sales defaults as the only option. |
| **Package** | `packages/ui` |

### 8.6 `ActiveFilterSummary`

| Field | Detail |
|-------|--------|
| **Responsibility** | Removable summary of applied filters. |
| **Props** | `items` (array of `{ id, label }`, required); `onRemove`; `onClearAll`. |
| **Package** | `packages/ui` |

### 8.7 `FacetList`

| Field | Detail |
|-------|--------|
| **Responsibility** | Scrollable facet checklist with counts (brands, categories). |
| **Props** | `facets` (array of `{ value, label, count }`, required); `selectedValues`; `onChange`; `searchable`. |
| **Package** | `packages/ui` |

---

## 9. Empty / loading / error states

### 9.1 `EmptyState`

| Field | Detail |
|-------|--------|
| **Responsibility** | Calm empty place with explanation and optional recovery actions (suggest similar queries / explorations). |
| **Props** | `title` (required); `description`; `illustration` (ReactNode — prefer abstract, not broken-image meme); `actions` (ReactNode). |
| **Package** | `packages/ui` |

### 9.2 `LoadingState`

| Field | Detail |
|-------|--------|
| **Responsibility** | Full-region loading with optional skeleton layout slot. |
| **Props** | `label` (required); `children` (skeleton layout); `delayMs` (avoid flash). |
| **Package** | `packages/ui` |

### 9.3 `ErrorState`

| Field | Detail |
|-------|--------|
| **Responsibility** | Recoverable error region (failed fetch, search backend down). |
| **Props** | `title` (required); `description`; `errorCode`; `onRetry`; `actions`. |
| **Package** | `packages/ui` |

### 9.4 `MediaMissingState`

| Field | Detail |
|-------|--------|
| **Responsibility** | Explicit missing-photography placeholder treated as data debt, not a silent gap. |
| **Props** | `entityLabel` (string, required); `reason` (`none` \| `rights` \| `pending`); `adminHint` (boolean). |
| **Relationships** | Used by `MediaFrame`, cards, PDP. |
| **Package** | `packages/ui` |

### 9.5 `UnknownValue`

| Field | Detail |
|-------|--------|
| **Responsibility** | Renders honest “Unknown” / “Unverified” for attributes and claims. |
| **Props** | `label` (default “Unknown”); `tone` (`unknown` \| `unverified`). |
| **Package** | `packages/ui` |

### 9.6 `RouteErrorBoundaryFallback`

| Field | Detail |
|-------|--------|
| **Responsibility** | Page-level crash fallback UI. |
| **Props** | `error` (Error); `onReset` (callback). |
| **Package** | Presentation in `packages/ui`; boundary wiring in `apps/web` |

### 9.7 `OfflineBanner`

| Field | Detail |
|-------|--------|
| **Responsibility** | Optional connectivity notice for future PWA browsing. |
| **Props** | `visible` (boolean); `message`. |
| **Package** | `packages/ui` |

---

## 10. Badge

### 10.1 `Badge`

| Field | Detail |
|-------|--------|
| **Responsibility** | Compact status / category label adjacent to text (not over hero media). |
| **Props** | `children` (required); `tone` (`neutral` \| `info` \| `success` \| `warning` \| `danger` \| `trust`); `size`. |
| **Do not use for** | Sale / discount / “limited time” overlays on product images. |
| **Package** | `packages/ui` |

### 10.2 `ConfidenceBadge`

| Field | Detail |
|-------|--------|
| **Responsibility** | Provenance confidence for attributes and player equipment claims (`Manufacturer` \| `Editorial` \| `Community` \| `AI-suggested` \| `Rumored`). |
| **Props** | `level` (enum, required); `label` (override string). |
| **Relationships** | Used by `AttributeRow`, `PlayerSetupCard`, reviews of claims. |
| **Package** | `packages/ui` |

### 10.3 `CategoryBadge`

| Field | Detail |
|-------|--------|
| **Responsibility** | Equipment category marker (Blade, Rubber, Shoe, …). |
| **Props** | `category` (required); `href` (optional link to browse). |
| **Package** | `packages/ui` |

### 10.4 `EraBadge`

| Field | Detail |
|-------|--------|
| **Responsibility** | Era / ball-era tagging for discovery. |
| **Props** | `era` (string, required). |
| **Package** | `packages/ui` |

### 10.5 `CountBadge`

| Field | Detail |
|-------|--------|
| **Responsibility** | Numeric indicator for compare tray / notifications (non-sales). |
| **Props** | `count` (number, required); `max` (number, default 99); `label` (accessible, required). |
| **Relationships** | Used by `CompareIndicator`. |
| **Package** | `packages/ui` |

---

## 11. Cards

### 11.1 `Card`

| Field | Detail |
|-------|--------|
| **Responsibility** | Generic interactive container for controls that need a surface — **not** the default for catalog presentation. |
| **Props** | `children` (required); `as` (`article` \| `div`); `interactive` (boolean); `onClick`; `selected`. |
| **Do not use for** | Hero marketing modules or wrapping every PDP section. Prefer bare `Section` when no interaction surface is needed. |
| **Package** | `packages/ui` |

### 11.2 `ProductCard`

| Field | Detail |
|-------|--------|
| **Responsibility** | Photo-first product tile for grids: hero image, identity, quiet meta; optional compare/favorite. |
| **Props** | `product` (`ProductSummary`, required — id, name, brand, category, image); `href` (required); `selected` (boolean); `onToggleCompare`; `onToggleFavorite`; `showBrand` (boolean); `density` (`comfortable` \| `dense`). |
| **Relationships** | Uses `MediaFrame`, `Badge`/`CategoryBadge` (text-adjacent), `IconButton`. Used by `ProductGrid`. |
| **Do not use for** | Price-led retail cards; no sale ribbons; no “Add to cart”. |
| **Package** | `packages/ui` |

### 11.3 `ProductCompactCard`

| Field | Detail |
|-------|--------|
| **Responsibility** | Smaller tile for typeahead, similar rail, compare tray thumbnails. |
| **Props** | Subset of `ProductCard` with mandatory image thumb and name. |
| **Package** | `packages/ui` |

### 11.4 `PlayerCard`

| Field | Detail |
|-------|--------|
| **Responsibility** | Player discovery tile emphasizing equipment story entry, not celebrity tabloid. |
| **Props** | `player` (`PlayerSummary`, required); `href` (required); `setupPreview` (optional product thumbs); `association` (string, e.g. federation — light). |
| **Relationships** | Uses `Avatar`, optional `ProductCompactCard` strip. |
| **Package** | `packages/ui` |

### 11.5 `SetupCard`

| Field | Detail |
|-------|--------|
| **Responsibility** | Displays a coherent setup (player or user build) with gear photography strip and date/context. |
| **Props** | `setup` (required — title, date?, products[], confidence); `href`; `onOpenInBuilder`; `attribution` (`player` \| `user`). |
| **Relationships** | Uses `ConfidenceBadge`, product thumbs. |
| **Package** | `packages/ui` |

### 11.6 `CollectionCard`

| Field | Detail |
|-------|--------|
| **Responsibility** | Entry into a curated/algorithmic collection with cover photography. |
| **Props** | `collection` (required); `href` (required); `itemCount` (number). |
| **Package** | `packages/ui` |

### 11.7 `BrandCard`

| Field | Detail |
|-------|--------|
| **Responsibility** | Brand hub tile (discovery, not storefront). |
| **Props** | `brand` (required); `href`; `productCount`; `coverImage`. |
| **Package** | `packages/ui` |

### 11.8 `MediaCard`

| Field | Detail |
|-------|--------|
| **Responsibility** | Gallery-first tile focusing on a media asset (angle label, product link). |
| **Props** | `media` (required); `href`; `caption`; `onOpenViewer`. |
| **Package** | `packages/ui` |

### 11.9 `ReviewCard`

| Field | Detail |
|-------|--------|
| **Responsibility** | Community review summary with provenance and no purchase CTA. |
| **Props** | `review` (required); `href`; `compact` (boolean). |
| **Relationships** | Uses `RatingStars`, `ConfidenceBadge` if claims included. |
| **Package** | `packages/ui` |

### 11.10 `SimilarReasonCard`

| Field | Detail |
|-------|--------|
| **Responsibility** | Similar product with optional “why similar” explanation. |
| **Props** | `product` (required); `reasons` (string[]); `href`. |
| **Package** | `packages/ui` |

---

## 12. Search

### 12.1 `SearchTrigger`

| Field | Detail |
|-------|--------|
| **Responsibility** | Header control that opens search experience (command palette or search route). |
| **Props** | `onOpen` (required); `shortcutHint` (ReactNode); `placeholder` (string). |
| **Package** | `packages/ui` |

### 12.2 `SearchTypeahead`

| Field | Detail |
|-------|--------|
| **Responsibility** | Instant search panel with photo thumbnails, entity groups (products, players, collections), alias-aware results. |
| **Props** | `query` (string, required); `onQueryChange` (required); `groups` (array of result groups); `loading`; `onSelectResult`; `onSubmitQuery`; `emptyState` (ReactNode); `recent` (items). |
| **Relationships** | Uses `SearchInput`, `ProductCompactCard`, `PlayerCard` compact, `EmptyState`. |
| **Do not use for** | Admin SKU pickers — use `Combobox`. |
| **Package** | `packages/ui` |

### 12.3 `SearchResultGroup`

| Field | Detail |
|-------|--------|
| **Responsibility** | Labeled group within typeahead or search page. |
| **Props** | `title` (required); `children` (required); `totalCount`. |
| **Package** | `packages/ui` |

### 12.4 `SearchResultRow`

| Field | Detail |
|-------|--------|
| **Responsibility** | Single result row: thumb, title, subtitle (brand/category), optional alias match highlight. |
| **Props** | `title` (required); `subtitle`; `image`; `href`; `matchLabel`; `onSelect`; `active` (keyboard highlight). |
| **Package** | `packages/ui` |

### 12.5 `SearchPageHeader`

| Field | Detail |
|-------|--------|
| **Responsibility** | Full search place header (search is a place, not only a box). |
| **Props** | `query`; `onQueryChange`; `onSubmit`; `filtersSlot`; `sortSlot`. |
| **Package** | `packages/ui` |

### 12.6 `SearchResultsLayout`

| Field | Detail |
|-------|--------|
| **Responsibility** | Visual results grid + filter column composition for search route. |
| **Props** | `filters` (ReactNode); `results` (ReactNode, required); `status` (`idle` \| `loading` \| `empty` \| `error`). |
| **Package** | `packages/ui` (layout composite); data in `apps/web` |

### 12.7 `AliasHighlight`

| Field | Detail |
|-------|--------|
| **Responsibility** | Shows matched alias (“H3” → Hurricane 3) for transparency. |
| **Props** | `query` (required); `matchedAlias` (required); `canonicalName` (required). |
| **Package** | `packages/ui` |

### 12.8 `SearchSuggestions`

| Field | Detail |
|-------|--------|
| **Responsibility** | Empty-state suggestions: similar queries and popular explorations. |
| **Props** | `suggestions` (string[]); `explorations` (array of `{ label, href }`); `onPickSuggestion`. |
| **Package** | `packages/ui` |

---

## 13. Product

### 13.1 `ProductHeroGallery`

| Field | Detail |
|-------|--------|
| **Responsibility** | Dominant PDP media region: hero + angle set, opens image viewer; no sales overlays. |
| **Props** | `media` (MediaAsset[], required); `productName` (required — for alt); `initialIndex`; `onOpenViewer`; `onAngleChange`; `missingFallback`. |
| **Relationships** | Uses `MediaFrame`, `GalleryThumbStrip`, `ImageViewer` (via callback). Used by PDP page. |
| **Do not use for** | Tiny thumbnails in cards — use `MediaFrame` directly. |
| **Package** | `packages/ui` |

### 13.2 `ProductIdentityHeader`

| Field | Detail |
|-------|--------|
| **Responsibility** | Canonical name, brand link, category, aliases summary. |
| **Props** | `name` (required); `brand` (`{ name, href }`); `category`; `aliases` (string[]); `actions` (compare, favorite, share). |
| **Package** | `packages/ui` |

### 13.3 `ProductAttributePanel`

| Field | Detail |
|-------|--------|
| **Responsibility** | Structured attributes with honesty for missing values. |
| **Props** | `attributes` (array of `{ key, label, value, confidence? }`, required); `variantNotes` (ReactNode). |
| **Relationships** | Uses `AttributeTable`, `ConfidenceBadge`, `UnknownValue`. |
| **Package** | `packages/ui` |

### 13.4 `AttributeTable` / `AttributeRow`

| Field | Detail |
|-------|--------|
| **Responsibility** | Key/value attribute presentation with difference-highlight mode for compare. |
| **Props** | Table: `rows` (required); `highlightDifferences` (boolean); `baselineId`. Row: `label`; `value`; `confidence`. |
| **Package** | `packages/ui` |

### 13.5 `ProductVariantSelector`

| Field | Detail |
|-------|--------|
| **Responsibility** | Nested variants (sponge thickness, color) under one product — not SKU spam as separate catalog cards. |
| **Props** | `variants` (required); `value`; `onChange`; `groupBy` (`thickness` \| `color` \| `custom`). |
| **Do not use for** | Exploding each thickness into separate `ProductCard`s in browse grids. |
| **Package** | `packages/ui` |

### 13.6 `UsedByPlayersSection`

| Field | Detail |
|-------|--------|
| **Responsibility** | “Used by” professionals list with confidence labeling. |
| **Props** | `players` (array of player+setup snippets, required); `onSeeAll`. |
| **Relationships** | Uses `PlayerCard` / compact rows, `ConfidenceBadge`. |
| **Package** | `packages/ui` |

### 13.7 `AppearsInSetupsSection`

| Field | Detail |
|-------|--------|
| **Responsibility** | Setups and builds that include this product. |
| **Props** | `setups` (required); `emptyState`. |
| **Relationships** | Uses `SetupCard`. |
| **Package** | `packages/ui` |

### 13.8 `SimilarEquipmentRail`

| Field | Detail |
|-------|--------|
| **Responsibility** | Horizontal neighborhood exploration with optional reasons. |
| **Props** | `items` (required); `title` (default “Similar equipment”); `onSeeAll`. |
| **Relationships** | Uses `SimilarReasonCard` / `ProductCard`. |
| **Package** | `packages/ui` |

### 13.9 `ProductExternalLinks`

| Field | Detail |
|-------|--------|
| **Responsibility** | Low-emphasis references (manufacturer page, community discussion) — never primary CTA. |
| **Props** | `links` (array of `{ label, href, kind }`); `emphasis` (forced `low`). |
| **Do not use for** | Affiliate-optimized button rows. |
| **Package** | `packages/ui` |

### 13.10 `ProductGrid`

| Field | Detail |
|-------|--------|
| **Responsibility** | Catalog photo grid assembling `ProductCard`s with density and load-more. |
| **Props** | `products` (required); `density`; `selectedIds`; `onToggleCompare`; `loading`; `sentinel` (ReactNode). |
| **Relationships** | Uses `Grid`, `ProductCard`, `InfiniteScrollSentinel`. |
| **Package** | `packages/ui` |

### 13.11 `ProductSpecsSummary`

| Field | Detail |
|-------|--------|
| **Responsibility** | Compact “at a glance” specs for builder side panel and compare pin. |
| **Props** | `attributes` (subset); `productName`. |
| **Package** | `packages/ui` |

### 13.12 `RelationshipGraphTeaser`

| Field | Detail |
|-------|--------|
| **Responsibility** | Light teaser of entity relationships (supersedes, often paired with) without full graph UI. |
| **Props** | `edges` (array of `{ type, product }`); `onOpenProduct`. |
| **Package** | `packages/ui` |

---

## 14. Player

### 14.1 `PlayerHero`

| Field | Detail |
|-------|--------|
| **Responsibility** | Player page identity: name, light career context, optional portrait — equipment storytelling first. |
| **Props** | `player` (required); `portrait`; `summary`; `actions` (e.g., open current setup in builder). |
| **Do not use for** | Tabloid biography layouts. |
| **Package** | `packages/ui` |

### 14.2 `PlayerSetupCard`

| Field | Detail |
|-------|--------|
| **Responsibility** | Notable / current setup with dated context and confidence. |
| **Props** | `setup` (required); `confidence` (required); `onOpenInBuilder`; `href`. |
| **Relationships** | Specialization of `SetupCard`. |
| **Package** | `packages/ui` |

### 14.3 `PlayerEquipmentCredits`

| Field | Detail |
|-------|--------|
| **Responsibility** | Credits-like list of equipment entities linked from the player (IMDB-like). |
| **Props** | `credits` (array of `{ role, product, confidence, era? }`, required). |
| **Package** | `packages/ui` |

### 14.4 `RelatedPlayersRail`

| Field | Detail |
|-------|--------|
| **Responsibility** | Discovery of teammates / same-equipment clusters — carefully framed. |
| **Props** | `players` (required); `reasonLabel` (string, e.g. “Same FH rubber cluster”). |
| **Do not use for** | Gossip or ranking clickbait. |
| **Package** | `packages/ui` |

### 14.5 `PlayerGrid`

| Field | Detail |
|-------|--------|
| **Responsibility** | Browse grid of `PlayerCard`s. |
| **Props** | `players` (required); `loading`; `sentinel`. |
| **Package** | `packages/ui` |

### 14.6 `PlayerQuickFacts`

| Field | Detail |
|-------|--------|
| **Responsibility** | Sparse factual chips (handedness, grip, association) — not a stats dashboard. |
| **Props** | `facts` (array of `{ label, value }`). |
| **Package** | `packages/ui` |

---

## 15. Builder

### 15.1 `BuilderCanvas`

| Field | Detail |
|-------|--------|
| **Responsibility** | Visual assembly of the racket as a whole (blade + FH + BH layers). Central visual of builder. |
| **Props** | `blade`; `forehand`; `backhand`; `extras` (optional parts); `orientation`; `onSelectSlot`; `highlightedSlot`. |
| **Relationships** | Uses `BuilderSlot`, `MediaFrame`. Used by Builder page with `SplitPane`. |
| **Do not use for** | Checkout configurator / price total modules. |
| **Package** | `packages/ui` |

### 15.2 `BuilderSlot`

| Field | Detail |
|-------|--------|
| **Responsibility** | Single part slot with empty/filled states and replace action. |
| **Props** | `slotType` (`blade` \| `fhRubber` \| `bhRubber` \| `edgeTape` \| `other`, required); `product`; `onChoose`; `onClear`; `compatibilityStatus` (`ok` \| `warn` \| `unknown`). |
| **Package** | `packages/ui` |

### 15.3 `BuilderPartsPanel`

| Field | Detail |
|-------|--------|
| **Responsibility** | List/search of candidate parts for the active slot. |
| **Props** | `slotType` (required); `query`; `onQueryChange`; `results`; `onSelect`; `filtersSlot`. |
| **Relationships** | Uses `SearchInput`, `ProductCompactCard`, filters. |
| **Package** | `packages/ui` |

### 15.4 `BuilderCompatibilityCallout`

| Field | Detail |
|-------|--------|
| **Responsibility** | Guidance (not punitive walls) about conventions and assumptions. |
| **Props** | `status` (`ok` \| `warn` \| `unknown`); `messages` (string[], required); `learnMoreHref`. |
| **Package** | `packages/ui` |

### 15.5 `BuilderSummary`

| Field | Detail |
|-------|--------|
| **Responsibility** | Readable aggregated build summary (specs rollup, part list). |
| **Props** | `parts` (required); `aggregates` (attribute summary); `notes`. |
| **Package** | `packages/ui` |

### 15.6 `BuilderToolbar`

| Field | Detail |
|-------|--------|
| **Responsibility** | Save / share / duplicate / reset / open-from-player actions. |
| **Props** | `onSave`; `onShare`; `onDuplicate`; `onReset`; `dirty` (boolean); `shareUrl`. |
| **Package** | `packages/ui` |

### 15.7 `BuilderFromSetupBanner`

| Field | Detail |
|-------|--------|
| **Responsibility** | Banner when build originated from a player setup (“Based on …”). |
| **Props** | `setupLabel` (required); `playerHref`; `onDetach`. |
| **Package** | `packages/ui` |

### 15.8 `SavedBuildsList`

| Field | Detail |
|-------|--------|
| **Responsibility** | User’s saved builds list (private by default messaging). |
| **Props** | `builds` (required); `onOpen`; `onDelete`; `emptyState`. |
| **Package** | `packages/ui` |

### 15.9 `BuildSharePanel`

| Field | Detail |
|-------|--------|
| **Responsibility** | Share URL / export affordances for a build. |
| **Props** | `url` (required); `onCopy`; `visibility` (`private` \| `unlisted` \| `public`). |
| **Package** | `packages/ui` |

---

## 16. Gallery

### 16.1 `MediaFrame`

| Field | Detail |
|-------|--------|
| **Responsibility** | Core photography primitive: aspect, object-fit, lazy load, blur placeholder, missing state. |
| **Props** | `src`; `alt` (required when src); `aspect`; `priority` (boolean); `sizes`; `onClick`; `missing` (boolean); `entityLabel`. |
| **Relationships** | Foundation for almost all visual components. |
| **Do not use for** | Decorative gradients pretending to be product photos. |
| **Package** | `packages/ui` |

### 16.2 `GalleryGrid`

| Field | Detail |
|-------|--------|
| **Responsibility** | Dense photo mosaic for media libraries and explore surfaces. |
| **Props** | `items` (MediaAsset[], required); `onOpen`; `selectable`; `selectedIds`. |
| **Package** | `packages/ui` |

### 16.3 `GalleryThumbStrip`

| Field | Detail |
|-------|--------|
| **Responsibility** | Horizontal thumbnails for angle selection under hero. |
| **Props** | `items` (required); `activeIndex`; `onChange`; `labeledByAngles` (boolean). |
| **Package** | `packages/ui` |

### 16.4 `AngleLabel`

| Field | Detail |
|-------|--------|
| **Responsibility** | Shot type label (Hero, Detail, Edge, Back, Comparison plate). |
| **Props** | `angle` (enum, required). |
| **Package** | `packages/ui` |

### 16.5 `ComparisonPlate`

| Field | Detail |
|-------|--------|
| **Responsibility** | Same-lighting multi-product plate presentation for fair visual compare. |
| **Props** | `image` (required); `products` (labels); `alt` (required). |
| **Package** | `packages/ui` |

### 16.6 `MediaAttribution`

| Field | Detail |
|-------|--------|
| **Responsibility** | Rights / source / photographer attribution under media. |
| **Props** | `source`; `license`; `photographer`; `link`. |
| **Package** | `packages/ui` |

### 16.7 `ExploreHeroGallery`

| Field | Detail |
|-------|--------|
| **Responsibility** | Home/Explore first-viewport photography plane with brand + one CTA group — calm, not dashboard. |
| **Props** | `media` (required); `brand` (ReactNode); `headline`; `support`; `actions` (ReactNode). |
| **Do not use for** | Stats strips, news modules, affiliate banners in the first viewport. |
| **Package** | `packages/ui` (composite); page content selection in `apps/web` |

---

## 17. Comparison

### 17.1 `CompareIndicator`

| Field | Detail |
|-------|--------|
| **Responsibility** | Header control showing compare count and opening tray/workspace. |
| **Props** | `count` (required); `onOpen` (required); `disabled` when count 0 (or still openable empty). |
| **Relationships** | Uses `CountBadge`, `IconButton`. |
| **Package** | `packages/ui` |

### 17.2 `CompareTray`

| Field | Detail |
|-------|--------|
| **Responsibility** | Persistent multi-select tray of products staged for comparison; primary selection verb chrome. |
| **Props** | `items` (`ProductSummary[]`, required); `onRemove`; `onClear`; `onCompare` (required); `maxItems` (number); `collapsed`; `onCollapsedChange`. |
| **Relationships** | Uses `ProductCompactCard`, `StickyRegion` / bottom dock. Slotted into `AppShell`. |
| **Do not use for** | Cart / checkout staging. |
| **Package** | `packages/ui` |

### 17.3 `CompareWorkspace`

| Field | Detail |
|-------|--------|
| **Responsibility** | Dedicated compare experience: synchronized photo slots + attribute matrix. |
| **Props** | `products` (required, N items); `baselineId`; `onBaselineChange`; `onRemoveProduct`; `onAddProduct`; `shareUrl`. |
| **Relationships** | Composes `ComparePhotoStrip`, `CompareAttributeMatrix`, `SplitPane`. |
| **Package** | `packages/ui` |

### 17.4 `ComparePhotoStrip`

| Field | Detail |
|-------|--------|
| **Responsibility** | Aligned photography columns with sync pan/zoom optional. |
| **Props** | `products` (required); `syncNavigation` (boolean); `onOpenViewer`. |
| **Relationships** | Uses `MediaFrame`, prefers photos before tables. |
| **Package** | `packages/ui` |

### 17.5 `CompareAttributeMatrix`

| Field | Detail |
|-------|--------|
| **Responsibility** | Attribute matrix with difference highlighting and unknown cells. |
| **Props** | `products` (required); `attributes` (keys); `baselineId`; `highlightDifferences` (default true). |
| **Relationships** | Uses `AttributeTable` patterns, `UnknownValue`. |
| **Package** | `packages/ui` |

### 17.6 `CompareAddSlot`

| Field | Detail |
|-------|--------|
| **Responsibility** | Empty column CTA to add another product from search. |
| **Props** | `onAdd` (required); `disabled` when at max. |
| **Package** | `packages/ui` |

### 17.7 `AddToCompareButton`

| Field | Detail |
|-------|--------|
| **Responsibility** | Explicit compare affordance on cards/PDP. |
| **Props** | `productId` (required); `selected` (boolean); `onToggle` (required); `label`. |
| **Package** | `packages/ui` |

---

## 18. Charts

> Charts are secondary to photography. Use for attribute distribution, timeline density, and admin QA — not vanity dashboards on Explore.

### 18.1 `AttributeRadarChart`

| Field | Detail |
|-------|--------|
| **Responsibility** | Optional radar for speed/spin/control when sourced; must label scale provenance. |
| **Props** | `series` (array of `{ id, label, values }`); `axes` (required); `scaleNote` (string, required); `showLegend`. |
| **Do not use for** | Invented normalized scores without disclosure. |
| **Package** | `packages/ui` |

### 18.2 `AttributeBarCompare`

| Field | Detail |
|-------|--------|
| **Responsibility** | Simple bar comparison for a single attribute across products. |
| **Props** | `attributeLabel` (required); `values` (array of `{ productId, label, value, unknown? }`); `baselineId`. |
| **Package** | `packages/ui` |

### 18.3 `DistributionHistogram`

| Field | Detail |
|-------|--------|
| **Responsibility** | Catalog distribution (e.g., sponge hardness band) for explore/admin insight. |
| **Props** | `bins` (required); `xLabel`; `yLabel`; `onBinClick`. |
| **Package** | `packages/ui` |

### 18.4 `ChartContainer`

| Field | Detail |
|-------|--------|
| **Responsibility** | Accessible chart wrapper: title, description, data table alternative toggle. |
| **Props** | `title` (required); `description` (required for a11y); `children` (chart); `tableAlternative` (ReactNode, required). |
| **Package** | `packages/ui` |

### 18.5 `Sparkline`

| Field | Detail |
|-------|--------|
| **Responsibility** | Tiny trend for admin metrics (ingestion volume) — not consumer home. |
| **Props** | `values` (number[], required); `label` (required). |
| **Package** | `packages/ui` |

---

## 19. Timeline

### 19.1 `Timeline`

| Field | Detail |
|-------|--------|
| **Responsibility** | Vertical timeline shell for equipment changes and eras. |
| **Props** | `children` (required); `orientation` (`vertical` default). |
| **Package** | `packages/ui` |

### 19.2 `TimelineEvent`

| Field | Detail |
|-------|--------|
| **Responsibility** | Single dated event with content slot. |
| **Props** | `date` (string \| Date, required); `title` (required); `confidence`; `children`; `media`. |
| **Relationships** | Uses `ConfidenceBadge`, optional `MediaFrame`. |
| **Package** | `packages/ui` |

### 19.3 `EquipmentTimeline`

| Field | Detail |
|-------|--------|
| **Responsibility** | Player equipment change history domain composite. |
| **Props** | `events` (array of setup-change events, required); `onOpenProduct`; `onOpenSetup`. |
| **Relationships** | Composes `Timeline`, `TimelineEvent`, `ProductCompactCard`. |
| **Package** | `packages/ui` |

### 19.4 `EraAxis`

| Field | Detail |
|-------|--------|
| **Responsibility** | Horizontal era marker axis for collections / research views. |
| **Props** | `eras` (required); `activeEra`; `onSelect`. |
| **Package** | `packages/ui` |

---

## 20. Video

### 20.1 `VideoPlayer`

| Field | Detail |
|-------|--------|
| **Responsibility** | Opt-in video playback secondary to still inspection. |
| **Props** | `src` (required); `poster` (required — still first); `caption`; `autoPlay` (default false); `muted` (default true if autoplay ever allowed); `onPlay`. |
| **Do not use for** | Autoplay that steals focus from still PDP gallery. |
| **Package** | `packages/ui` |

### 20.2 `VideoThumbnail`

| Field | Detail |
|-------|--------|
| **Responsibility** | Still poster with play affordance launching player/modal. |
| **Props** | `poster` (required); `title` (required); `duration`; `onPlay`. |
| **Package** | `packages/ui` |

### 20.3 `VideoChapterList`

| Field | Detail |
|-------|--------|
| **Responsibility** | Chapters for longer equipment explainers (later learn content). |
| **Props** | `chapters` (array of `{ t, label }`, required); `onSeek`. |
| **Package** | `packages/ui` |

---

## 21. Review

### 21.1 `RatingStars`

| Field | Detail |
|-------|--------|
| **Responsibility** | Display or input of star rating with accessible value text. |
| **Props** | `value` (number, required); `max` (default 5); `readOnly` (boolean); `onChange`; `label` (required). |
| **Package** | `packages/ui` |

### 21.2 `ReviewForm`

| Field | Detail |
|-------|--------|
| **Responsibility** | Submit community review with provenance honesty (opinion vs fact). |
| **Props** | `productId` (required); `onSubmit` (required); `initialValues`; `guidelines` (ReactNode). |
| **Relationships** | Uses form primitives, `RatingStars`, `TextArea`. |
| **Package** | `packages/ui` |

### 21.3 `ReviewList`

| Field | Detail |
|-------|--------|
| **Responsibility** | Paginated list of `ReviewCard`s with sort. |
| **Props** | `reviews` (required); `sort`; `onSortChange`; `emptyState`. |
| **Package** | `packages/ui` |

### 21.4 `ReviewModerationActions`

| Field | Detail |
|-------|--------|
| **Responsibility** | Admin/moderation controls for a review. |
| **Props** | `reviewId` (required); `onApprove`; `onReject`; `onFlag`. |
| **Package** | Admin subsection / `apps/web` preferred early |

### 21.5 `ClaimVsOpinionToggle`

| Field | Detail |
|-------|--------|
| **Responsibility** | Helps authors mark statements as opinion vs factual claim. |
| **Props** | `value` (`opinion` \| `claim`); `onChange` (required). |
| **Package** | `packages/ui` |

---

## 22. Modal

### 22.1 `Dialog`

| Field | Detail |
|-------|--------|
| **Responsibility** | Accessible modal shell: overlay, focus trap, ESC close, title. |
| **Props** | `open` (required); `onOpenChange` (required); `title` (required); `description`; `children` (required); `size` (`sm` \| `md` \| `lg` \| `fullscreen`); `footer`. |
| **Package** | `packages/ui` |

### 22.2 `ConfirmDialog`

| Field | Detail |
|-------|--------|
| **Responsibility** | Confirm destructive or irreversible actions (clear build, delete media). |
| **Props** | `open`; `onOpenChange`; `title` (required); `description`; `confirmLabel`; `cancelLabel`; `tone` (`danger` \| `default`); `onConfirm` (required). |
| **Package** | `packages/ui` |

### 22.3 `CommandPalette`

| Field | Detail |
|-------|--------|
| **Responsibility** | Keyboard-first jump to search, routes, recent entities. |
| **Props** | `open`; `onOpenChange`; `commands` (array); `onRun`; integrates search results slot. |
| **Relationships** | May embed `SearchTypeahead` patterns. |
| **Package** | `packages/ui` |

### 22.4 `ShareDialog`

| Field | Detail |
|-------|--------|
| **Responsibility** | Share compare/build/collection URLs. |
| **Props** | `open`; `onOpenChange`; `url` (required); `title`. |
| **Package** | `packages/ui` |

---

## 23. Drawer

### 23.1 `Drawer`

| Field | Detail |
|-------|--------|
| **Responsibility** | Edge panel shell (filters, nav, AI on small screens). |
| **Props** | `open` (required); `onOpenChange` (required); `side` (`left` \| `right` \| `bottom`); `title`; `children` (required); `size`. |
| **Package** | `packages/ui` |

### 23.2 `FilterDrawer`

| Field | Detail |
|-------|--------|
| **Responsibility** | Mobile filters hosted in drawer. |
| **Props** | Extends drawer + `FilterPanel` children; `onApply`; `onClear`. |
| **Package** | `packages/ui` |

### 23.3 `AiAssistantDrawer`

| Field | Detail |
|-------|--------|
| **Responsibility** | AI assistant hosted as drawer on narrow viewports. |
| **Props** | Same open API as dock; `children` conversation UI. |
| **Relationships** | See AI section; composes `Drawer`. |
| **Package** | `packages/ui` |

---

## 24. Image Viewer

### 24.1 `ImageViewer`

| Field | Detail |
|-------|--------|
| **Responsibility** | Fullscreen / immersive still inspection: zoom, pan, keyboard next/prev, captions, attribution. |
| **Props** | `open` (required); `onOpenChange` (required); `items` (MediaAsset[], required); `index`; `onIndexChange`; `productName`; `showAttribution` (default true). |
| **Relationships** | Uses `Dialog` fullscreen or custom portal; `MediaFrame`; `MediaAttribution`. |
| **Do not use for** | Video — use `VideoPlayer`. Do not overlay promo badges. |
| **Package** | `packages/ui` |

### 24.2 `ImageViewerToolbar`

| Field | Detail |
|-------|--------|
| **Responsibility** | Zoom in/out, reset, download (if rights allow), close. |
| **Props** | `zoom`; `onZoomChange`; `onReset`; `onDownload`; `canDownload`. |
| **Package** | `packages/ui` |

### 24.3 `ImageZoomPane`

| Field | Detail |
|-------|--------|
| **Responsibility** | Pan/zoom surface for a single still. |
| **Props** | `src` (required); `alt` (required); `zoom`; `onZoomChange`; `reducedMotion`. |
| **Package** | `packages/ui` |

---

## 25. AI assistant UI chrome

> AI assists exploration; it must not replace catalog photography or invent unverifiable claims. Always label AI-suggested content.

### 25.1 `AiAssistantDock`

| Field | Detail |
|-------|--------|
| **Responsibility** | Persistent optional dock entry for assistant (collapsed by default on Explore). |
| **Props** | `open`; `onOpenChange`; `unread` (boolean); `children` (panel content). |
| **Relationships** | Slotted in `AppShell`; uses `AiAssistantPanel` when open. |
| **Do not use for** | Homepage-replacing chatbot hero. |
| **Package** | `packages/ui` |

### 25.2 `AiAssistantPanel`

| Field | Detail |
|-------|--------|
| **Responsibility** | Conversation chrome: message list, composer, grounding indicators. |
| **Props** | `messages` (required); `onSend` (required); `busy`; `groundingSources` (links to products/players); `disclaimer` (ReactNode, required). |
| **Relationships** | Uses `AiMessage`, `AiComposer`, `AiGroundingChips`. |
| **Package** | `packages/ui` |

### 25.3 `AiMessage`

| Field | Detail |
|-------|--------|
| **Responsibility** | Single message bubble with role and optional confidence/grounding. |
| **Props** | `role` (`user` \| `assistant` \| `system`); `content` (ReactNode, required); `sources`; `isStreaming`. |
| **Package** | `packages/ui` |

### 25.4 `AiComposer`

| Field | Detail |
|-------|--------|
| **Responsibility** | Input for assistant queries with send/stop. |
| **Props** | `value`; `onChange`; `onSend`; `onStop`; `busy`; `placeholder`. |
| **Package** | `packages/ui` |

### 25.5 `AiGroundingChips`

| Field | Detail |
|-------|--------|
| **Responsibility** | Chips linking assistant claims to catalog entities. |
| **Props** | `sources` (array of `{ type, id, label, href }`, required). |
| **Package** | `packages/ui` |

### 25.6 `AiSuggestionChips`

| Field | Detail |
|-------|--------|
| **Responsibility** | Prompt starters that deep-link into search/compare/builder. |
| **Props** | `suggestions` (array of `{ label, prompt \|\| href }`). |
| **Package** | `packages/ui` |

### 25.7 `AiDisclosureBanner`

| Field | Detail |
|-------|--------|
| **Responsibility** | Persistent reminder that AI output may be wrong and is labeled when inferred. |
| **Props** | `children` (required message). |
| **Package** | `packages/ui` |

---

## 26. Favorites / account (lightweight)

### 26.1 `FavoriteButton`

| Field | Detail |
|-------|--------|
| **Responsibility** | Toggle favorite on product/player/setup. |
| **Props** | `pressed` (boolean); `onToggle` (required); `label`. |
| **Package** | `packages/ui` |

### 26.2 `FavoritesList`

| Field | Detail |
|-------|--------|
| **Responsibility** | Saved entities list. |
| **Props** | `items` (required); `onRemove`; `emptyState`. |
| **Package** | `packages/ui` |

### 26.3 `AccountMenu`

| Field | Detail |
|-------|--------|
| **Responsibility** | Account entry: saved builds, favorites, sign-in. |
| **Props** | `user`; `items` (menu links); `onSignIn` / `onSignOut`. |
| **Package** | `packages/ui` |

### 26.4 `AuthForm`

| Field | Detail |
|-------|--------|
| **Responsibility** | Sign-in / sign-up form composite when auth lands. |
| **Props** | `mode`; `onSubmit`; `error`; `oauthSlot`. |
| **Package** | `packages/ui` |

---

## 27. Admin components (separate subsection)

Admin UI prioritizes data quality (especially media QA) over consumer photography luxury, but should reuse primitives.

### 27.1 `AdminShell`

| Field | Detail |
|-------|--------|
| **Responsibility** | Admin layout: side nav, breadcrumbs, main. |
| **Props** | `nav` (required); `children` (required); `user`. |
| **Package** | `apps/web` (early) or `packages/ui/admin` |

### 27.2 `AdminDataTable`

| Field | Detail |
|-------|--------|
| **Responsibility** | Sortable, selectable table for products/players/media jobs. |
| **Props** | `columns` (required); `rows` (required); `rowId`; `selectedIds`; `onSelectionChange`; `onSort`. |
| **Package** | `packages/ui/admin` |

### 27.3 `EntityEditForm`

| Field | Detail |
|-------|--------|
| **Responsibility** | Generic admin edit form shell for entity fields. |
| **Props** | `title`; `children` (required); `onSubmit`; `dirty`; `status`. |
| **Package** | `apps/web` feature forms composing `packages/ui` inputs |

### 27.4 `MediaQaCard`

| Field | Detail |
|-------|--------|
| **Responsibility** | Review a media asset against photography quality bar (angle, rights, sharpness notes). |
| **Props** | `media` (required); `checklist` (items); `onApprove`; `onReject`; `notes`. |
| **Package** | `packages/ui/admin` |

### 27.5 `MediaQaQueue`

| Field | Detail |
|-------|--------|
| **Responsibility** | Queue list of assets pending QA. |
| **Props** | `items` (required); `onOpen`. |
| **Package** | `packages/ui/admin` |

### 27.6 `IngestionJobStatus`

| Field | Detail |
|-------|--------|
| **Responsibility** | Scraper/ingestion job progress and errors. |
| **Props** | `job` (required — status, progress, logs summary); `onRetry`. |
| **Relationships** | Uses `ProgressBar`, `InlineAlert`. |
| **Package** | `packages/ui/admin` |

### 27.7 `AliasEditor`

| Field | Detail |
|-------|--------|
| **Responsibility** | Edit multilingual aliases for search identity. |
| **Props** | `aliases` (string[], required); `onChange` (required); `localeHints`. |
| **Package** | `packages/ui/admin` |

### 27.8 `ProvenanceEditor`

| Field | Detail |
|-------|--------|
| **Responsibility** | Set source confidence on attributes and setup claims. |
| **Props** | `value` (confidence enum, required); `sourceUrl`; `onChange`. |
| **Package** | `packages/ui/admin` |

### 27.9 `MergeEntitiesDialog`

| Field | Detail |
|-------|--------|
| **Responsibility** | Merge duplicate product/player entities carefully. |
| **Props** | `primary`; `duplicate`; `onConfirmMerge`; open state props. |
| **Package** | `packages/ui/admin` |

### 27.10 `ModerationQueue`

| Field | Detail |
|-------|--------|
| **Responsibility** | Community reviews / contributions awaiting moderation. |
| **Props** | `items` (required); `onOpen`. |
| **Package** | `packages/ui/admin` |

### 27.11 `AdminMetricStrip`

| Field | Detail |
|-------|--------|
| **Responsibility** | Compact admin metrics (catalog counts, missing media debt). Consumer Explore must not reuse this as a vanity dashboard. |
| **Props** | `metrics` (array of `{ label, value, href? }`). |
| **Package** | `packages/ui/admin` |

### 27.12 `RightsLicenseSelect`

| Field | Detail |
|-------|--------|
| **Responsibility** | License/rights metadata control for media. |
| **Props** | `value`; `onChange`; `options` (required). |
| **Package** | `packages/ui/admin` |

---

## 28. Page-level compositions (`apps/web` only)

These are **not** design-system exports; listed so implementers know how domain composites assemble.

| Page component | Composes (primary) | Job |
|----------------|--------------------|-----|
| `ExplorePage` | `ExploreHeroGallery`, collection/product rails, `PrimaryNav` targets | Visual wandering |
| `EquipmentBrowsePage` | `FilterBar`, `ProductGrid`, `CompareTray` | Scan catalog |
| `SearchPage` | `SearchPageHeader`, `SearchResultsLayout` | Resolve intent |
| `ProductDetailPage` | `ProductHeroGallery`, identity, attributes, used-by, similar | Understand object |
| `ComparePage` | `CompareWorkspace` | Decide between N |
| `BuilderPage` | `BuilderCanvas`, parts panel, summary, toolbar | Compose racket |
| `PlayerDetailPage` | `PlayerHero`, setups, `EquipmentTimeline`, credits | Equipment story |
| `PlayerBrowsePage` | `PlayerGrid`, filters | Find players |
| `CollectionPage` | `GalleryGrid` / `ProductGrid`, `PageHeader` | Curated slice |
| `BrandPage` | brand header, `ProductGrid` | Brand hub |
| `FavoritesPage` / `SavedBuildsPage` | lists | Return visits |
| `Admin*` pages | admin composites | Data quality |

---

## 29. Cross-cutting hooks & providers (non-visual, documented for integration)

Not React “visual components”, but required companions in the library boundary:

| Name | Responsibility | Package |
|------|----------------|---------|
| `CompareSelectionProvider` | Global compare selection state for tray | `packages/ui` or `apps/web` store (Zustand) with UI bindings |
| `ToastProvider` | See §6.11 | `packages/ui` |
| `ThemeProvider` | Tokens / color scheme | `packages/ui` |
| `AiAssistantProvider` | Open state + conversation client wiring | `apps/web` (API) + ui chrome |

Visual components must not hardcode fetch logic; pages/hooks supply view-models.

---

## 30. Inventory checklist (canonical names)

### Layout (12)
`AppShell`, `SiteHeader`, `BrandMark`, `MainContent`, `PageHeader`, `Section`, `Stack`, `Grid`, `SplitPane`, `StickyRegion`, `FullBleed`, `Container`

### Navigation (10)
`PrimaryNav`, `SecondaryNav`, `Breadcrumbs`, `Tabs`, `Pagination`, `InfiniteScrollSentinel`, `NavDrawer`, `Link`, `SkipToContent`, `TocNav`

### Primitives — actions/typography/feedback (17)
`Button`, `IconButton`, `ButtonGroup`, `Heading`, `Text`, `VisuallyHidden`, `Icon`, `Spinner`, `ProgressBar`, `Skeleton`, `Toast` (+ `ToastViewport`, `ToastProvider`), `InlineAlert`, `Tooltip`, `Kbd`, `Divider`, `Avatar`, `Tag`

### Forms & inputs (18)
`Form`, `FormField`, `FormLayout`, `FormErrorSummary`, `TextInput`, `TextArea`, `NumberInput`, `Select`, `Combobox`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `Slider`, `FileDropzone`, `PasswordInput`, `SearchInput`

### Filters (7)
`FilterBar`, `FilterChip`, `FilterChipGroup`, `FilterPanel`, `SortSelect`, `ActiveFilterSummary`, `FacetList`

### Empty / loading / error (7)
`EmptyState`, `LoadingState`, `ErrorState`, `MediaMissingState`, `UnknownValue`, `RouteErrorBoundaryFallback`, `OfflineBanner`

### Badge (5)
`Badge`, `ConfidenceBadge`, `CategoryBadge`, `EraBadge`, `CountBadge`

### Cards (10)
`Card`, `ProductCard`, `ProductCompactCard`, `PlayerCard`, `SetupCard`, `CollectionCard`, `BrandCard`, `MediaCard`, `ReviewCard`, `SimilarReasonCard`

### Search (8)
`SearchTrigger`, `SearchTypeahead`, `SearchResultGroup`, `SearchResultRow`, `SearchPageHeader`, `SearchResultsLayout`, `AliasHighlight`, `SearchSuggestions`

### Product (13)
`ProductHeroGallery`, `ProductIdentityHeader`, `ProductAttributePanel`, `AttributeTable`, `AttributeRow`, `ProductVariantSelector`, `UsedByPlayersSection`, `AppearsInSetupsSection`, `SimilarEquipmentRail`, `ProductExternalLinks`, `ProductGrid`, `ProductSpecsSummary`, `RelationshipGraphTeaser`

### Player (6)
`PlayerHero`, `PlayerSetupCard`, `PlayerEquipmentCredits`, `RelatedPlayersRail`, `PlayerGrid`, `PlayerQuickFacts`

### Builder (9)
`BuilderCanvas`, `BuilderSlot`, `BuilderPartsPanel`, `BuilderCompatibilityCallout`, `BuilderSummary`, `BuilderToolbar`, `BuilderFromSetupBanner`, `SavedBuildsList`, `BuildSharePanel`

### Gallery (7)
`MediaFrame`, `GalleryGrid`, `GalleryThumbStrip`, `AngleLabel`, `ComparisonPlate`, `MediaAttribution`, `ExploreHeroGallery`

### Comparison (7)
`CompareIndicator`, `CompareTray`, `CompareWorkspace`, `ComparePhotoStrip`, `CompareAttributeMatrix`, `CompareAddSlot`, `AddToCompareButton`

### Charts (5)
`AttributeRadarChart`, `AttributeBarCompare`, `DistributionHistogram`, `ChartContainer`, `Sparkline`

### Timeline (4)
`Timeline`, `TimelineEvent`, `EquipmentTimeline`, `EraAxis`

### Video (3)
`VideoPlayer`, `VideoThumbnail`, `VideoChapterList`

### Review (5)
`RatingStars`, `ReviewForm`, `ReviewList`, `ReviewModerationActions`, `ClaimVsOpinionToggle`

### Modal (4)
`Dialog`, `ConfirmDialog`, `CommandPalette`, `ShareDialog`

### Drawer (3)
`Drawer`, `FilterDrawer`, `AiAssistantDrawer`

### Image Viewer (3)
`ImageViewer`, `ImageViewerToolbar`, `ImageZoomPane`

### AI chrome (7)
`AiAssistantDock`, `AiAssistantPanel`, `AiMessage`, `AiComposer`, `AiGroundingChips`, `AiSuggestionChips`, `AiDisclosureBanner`

### Favorites / account (4)
`FavoriteButton`, `FavoritesList`, `AccountMenu`, `AuthForm`

### Admin (12)
`AdminShell`, `AdminDataTable`, `EntityEditForm`, `MediaQaCard`, `MediaQaQueue`, `IngestionJobStatus`, `AliasEditor`, `ProvenanceEditor`, `MergeEntitiesDialog`, `ModerationQueue`, `AdminMetricStrip`, `RightsLicenseSelect`

**Approximate total named UI components:** ~190 (Toast + ToastViewport + ToastProvider counted under feedback; checkbox/radio group variants counted separately).  
**Page-level assemblies:** ~12 (`apps/web`).  
**Providers / non-visual companions:** ~4.

---

## 31. Suggested `packages/ui` folder map

```text
packages/ui/src/
  primitives/          # Button, Input, Dialog, …
  layout/              # AppShell, Grid, SplitPane, …
  navigation/
  forms/
  filters/
  feedback/            # Empty, Skeleton, Toast, …
  media/               # MediaFrame, Gallery*, ImageViewer*, Video*
  badges/
  cards/
  search/
  product/
  player/
  builder/
  compare/
  charts/
  timeline/
  review/
  ai/
  account/
  admin/               # optional until admin stabilizes
  index.ts             # public exports
```

---

## 32. Document control

| Field | Value |
|-------|--------|
| Title | Component Library — TTSetupBuilder |
| Location | `docs/ui/COMPONENT_LIBRARY.md` |
| Companions | `docs/PRODUCT_VISION.md`; future `docs/ui/DESIGN_SYSTEM.md`, `docs/NAVIGATION.md` |
| Change policy | Update when IA or domain entities shift; note significant additions in `CHANGELOG.md` |

---

**Bottom line:** Implement **primitives and media-safe patterns** first (`MediaFrame`, grids, dialogs, filters), then **domain composites** that protect photography-first browsing (`ProductCard`, `ProductHeroGallery`, `CompareTray`, `BuilderCanvas`), keeping route data wiring in `apps/web`.
