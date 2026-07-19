# Design System — TTSetupBuilder

> Visual and interaction requirements for a photography-first table tennis equipment database — not a storefront.

**Status:** Living requirements document (documentation-only phase)  
**Audience:** Product design, frontend engineering, AI assistants generating UI  
**Companions:** [`PRODUCT_VISION.md`](../PRODUCT_VISION.md) · [`NAVIGATION.md`](../NAVIGATION.md) · [`FUNCTIONAL_REQUIREMENTS.md`](../FUNCTIONAL_REQUIREMENTS.md)  
**Quality bar:** Apple Human Interface Guidelines–level polish, clarity, and restraint  
**Constraint:** No ecommerce chrome. Photography leads. Cards are rare and purposeful.

---

## 0. How to use this document

This is a **requirements** design system: conceptual tokens, rules, and do/don’t guidance. It deliberately avoids implementation dumps (no CSS, Tailwind class lists, React snippets, or raw token JSON).

When implementing later:

- Map conceptual tokens (`color.bg.primary`, `space.4`, `type.body`) to the chosen stack.
- Prefer fewer tokens used consistently over a large unused vocabulary.
- If a proposal conflicts with **Product Vision** or this document, the vision and this system win.

**Related docs (when present):** Navigation IA, functional requirements, and architecture ADRs should defer to this system for visual language.

---

## 1. Principles

### 1.1 Product principles (non-negotiable)

| Principle | Meaning in UI |
|-----------|----------------|
| **Eyes first, text second** | If the screen still works with images muted, the design failed. |
| **Photography is inventory** | Media is the product surface, not decoration. |
| **One job per section** | One purpose, one headline, one short supporting line. |
| **Density with grace** | Catalog scale (thousands) without dashboard clutter. |
| **No sales chrome** | No cart, primary “Buy”, promo badges, sale ribbons, or conversion funnels. |
| **Honesty over completeness** | Prefer “Unknown” / “Unverified” over invented precision. |
| **Motion orients** | Transitions clarify hierarchy; they do not decorate. |
| **Selection is a verb** | Compare multi-select feels as native as opening a product. |

### 1.2 Design-system principles

1. **Restraint over spectacle** — Apple HIG: clarity, deference, depth. Prefer calm hierarchy to visual noise.
2. **Photography deference** — UI chrome yields to media: lighter weight, lower chroma, fewer borders on image planes.
3. **Tokenized consistency** — Color, type, space, elevation, motion durations, and radii come from named scales.
4. **Interaction surfaces are explicit** — Interactive regions look and behave interactively; decorative containers do not pretend to be cards.
5. **Dark-first, light-capable** — Early product ships **dark as primary**; light theme is specified for future parity (see §16–17).
6. **Accessible by default** — Visual-first ≠ vision-only. Focus, contrast, alt text, and keyboard paths are mandatory.
7. **Anti-cliché** — Avoid purple-on-white / purple–indigo gradient themes; warm cream + terracotta “AI editorial” looks; broadsheet hairline newspaper layouts; generic Inter / Roboto / Arial stacks; emoji as UI; glow soup; pill clusters; multi-layer shadow stacks.

### 1.3 Emotional target

Users should feel **respect, clarity, momentum, and confidence** while browsing equipment — like a curated museum you can search, compare, and assemble — never upsold, dashboard-lost, or chrome-fatigued.

---

## 2. Theme strategy

### 2.1 Decision (early product)

| Theme | Role | Rationale |
|-------|------|-----------|
| **Dark** | **Primary / default** | Photography museum + Steam/IMDB exploration energy; product photos and materials read with cinematic contrast; reduces temptation toward retail white-storefront patterns; aligns with long browsing sessions. |
| **Light** | **Future secondary** | Full parity later for daylight / print-adjacent contexts; not required for MVP UI. Specs in §17 so implementation does not paint into a corner. |

### 2.2 Rules

- Do **not** ship a half-finished dual theme. Until light theme is complete, dark is the only supported appearance.
- System preference (`prefers-color-scheme`) may **suggest** light later; early product may ignore OS preference and force dark.
- Theme tokens must be semantic (`color.bg.canvas`, `color.text.primary`), never hard-coded “always black / always white” in component logic.
- Product photography stays **neutral studio truthful** in both themes — do not recolor product images per theme.

### 2.3 What “dark” means here

Not a generic “admin panel dark mode.” Target: **deep, calm, slightly cool-neutral canvases** with restrained accents; generous negative space around media; high-legibility text; no neon cyberpunk, no purple glow, no glass everywhere.

---

## 3. Color Palette

### 3.1 Palette philosophy

- **Canvas is quiet** so photography and materials speak.
- **Accent is scarce** — used for primary actions, focus, and active selection — not for decoration.
- **Semantic colors** for success / warning / danger / info — never competing with product photos.
- **No brand purple default.** Accent should feel sport-adjacent and premium: cool teal–cyan or crisp electric blue-green family, or a restrained table-tennis–inspired accent (e.g. deep court green or precise cyan) — pick **one** accent family and stick to it. Avoid magenta/purple clichés and warm terracotta/cream pairings.

### 3.2 Conceptual token groups (dark primary)

| Token | Role | Guidance |
|-------|------|----------|
| `color.bg.canvas` | App background | Deep near-black / charcoal; slightly cool. Not pure `#000` if it crushes photo blacks — allow a hair of lift. |
| `color.bg.elevated` | Panels, sheets, menus | One step lighter than canvas; used for chrome, not for wrapping every photo. |
| `color.bg.sunken` | Wells, inset galleries, code/spec blocks | Slightly deeper than canvas for recessed media stages. |
| `color.bg.overlay` | Modal / sheet scrims | High-opacity dark scrim; content behind must not compete. |
| `color.bg.interactive` | Hover wash on non-media controls | Subtle lift; never a loud fill on photo cells. |
| `color.bg.selected` | Selected compare / multi-select | Clear but restrained tint of accent at low opacity. |
| `color.text.primary` | Body and titles | Near-white with slight warm or cool neutrality; not pure harsh white if it blooms on OLED. |
| `color.text.secondary` | Supporting copy | Clearly secondary; still meets contrast on canvas. |
| `color.text.tertiary` | Metadata, timestamps, “unknown” | Quiet; never the only cue for critical state. |
| `color.text.inverse` | Text on accent fills | High contrast against accent. |
| `color.border.subtle` | Dividers, quiet structure | Low-contrast edges; prefer space over lines when possible. |
| `color.border.strong` | Emphasized structure (compare columns) | Used sparingly. |
| `color.border.focus` | Focus rings | Accent-derived; always visible on canvas and elevated. |
| `color.accent.primary` | Primary actions, key selection | Single accent family; high recognition, low saturation noise. |
| `color.accent.muted` | Soft accent backgrounds, chips (rare) | Accent at low alpha. |
| `color.semantic.success` | Confirmed / compatible | Distinct from accent. |
| `color.semantic.warning` | Caution / unverified | Distinct; do not rely on color alone. |
| `color.semantic.danger` | Destructive / error | Reserved; calm, not alarmist red everywhere. |
| `color.semantic.info` | Neutral system notices | Low drama. |
| `color.media.stage` | Behind product photos | Neutral dark stage; consistent across catalog for fair comparison. |
| `color.media.placeholder` | Missing photo debt | Visibly “data incomplete,” not a pretty fake. |

### 3.3 Light theme token roles (future)

Same semantic names; inverted luminance relationships. Canvas becomes quiet light-cool or true neutral light — **not** warm cream paper. Accent remains the same family at adjusted contrast. See §17.

### 3.4 Contrast requirements

| Pairing | Minimum |
|---------|---------|
| `text.primary` on `bg.canvas` / `bg.elevated` | WCAG AA for body (≥ 4.5:1); prefer AAA for long reading |
| `text.secondary` on canvas | ≥ 4.5:1 for any readable secondary text |
| Interactive controls | ≥ 3:1 against adjacent non-text (UI component contrast) |
| Focus ring | Visible against both canvas and elevated surfaces |
| Accent text / icons on accent fill | ≥ 4.5:1 |

### 3.5 Color do / don’t

| Do | Don’t |
|----|--------|
| Keep chroma low on large surfaces | Flood pages with accent |
| Use accent for **one** primary job per view | Rainbow tags, multi-color icon rows |
| Keep media stages neutral and consistent | Theme-tint product photos |
| Mark provenance with labels + iconography | Color-only “rumored vs confirmed” |
| Reserve semantic red for true errors / destructive | Red sale stickers or urgency theater |

---

## 4. Typography

### 4.1 Type direction (expressive, purposeful)

**Reject** default AI stacks: Inter, Roboto, Arial, system-ui as the *designed* face, and “neutral SaaS grotesk only.”

**Target character:**

- **UI / body:** A contemporary **grotesque or neo-grotesque with personality** — precise, slightly technical, excellent numerals for specs (think the *feel* of Söhne, Neue Haas Grotesk, ABC Diatype, or similar licensed/open alternatives with a clear license path). Slightly condensed allowed for dense metadata; never cramped.
- **Display / brand moments:** Same family at large optical sizes **or** a tightly related display cut — used rarely: Explore hero brand lockup, empty-state headlines, onboarding. Display must not overpower the **product photography** or the **wordmark**.
- **Specs / data:** Tabular figures mandatory for attribute matrices and compare tables. Optional **monospaced companion** for IDs, SKUs, raw attribute keys — restrained, not “hacker aesthetic.”
- **Never** decorative script, blackletter, or sports-jersey display fonts for UI.

**Brand test (from product taste):** On branded surfaces, the product name is a hero-level signal. No marketing headline should overpower the brand; photography still leads the viewport.

### 4.2 Type roles (conceptual tokens)

| Token | Use | Approx. scale guidance |
|-------|-----|------------------------|
| `type.display` | Rare marketing / Explore brand moments | Largest; tight tracking; short strings only |
| `type.title.lg` | Page titles (PDP name, Player name) | Clear hierarchy under media |
| `type.title.md` | Section titles | One per section |
| `type.title.sm` | Card/sheet titles, dialog titles | Compact chrome |
| `type.body.lg` | Lead supporting sentence | Short; 1–2 lines |
| `type.body.md` | Default reading | Comfortable measure |
| `type.body.sm` | Secondary descriptions | Dense lists |
| `type.label` | Form labels, filter labels | Medium weight; clear |
| `type.meta` | Timestamps, provenance, counts | Small; tabular where numeric |
| `type.numeric` | Specs, ratings, compare deltas | Tabular lining figures |
| `type.code` | IDs, aliases technical | Mono companion |

### 4.3 Hierarchy rules

1. **One dominant text level per viewport region** — avoid competing headlines.
2. **PDP:** Product name is strong but **subordinate to the gallery**.
3. **Catalog grids:** Prefer **image recognition** over title dominance; titles are captions, not billboards.
4. **Line length:** Body ~45–75 characters where continuous reading exists; catalogs use short captions.
5. **Tracking:** Display slightly tight; meta slightly open; never ultra-wide “luxury tracking” as a gimmick.
6. **Weight:** Prefer two to three weights (regular, medium, semibold). Avoid black/heavy weights on dark UI (halation).
7. **Case:** Sentence case for UI. All-caps only for tiny meta labels if at all — and never for product names.

### 4.4 Localization readiness

- Allow +30–40% string growth for translated UI.
- Truncation with ellipsis only after responsive layout; tooltips or expand for full product names.
- Aliases and non-Latin catalog names must render correctly; do not assume Latin-only metrics.

---

## 5. Spacing

### 5.1 Scale

Use a **4-based spacing scale** (conceptual). Prefer multiplying the base unit rather than inventing one-off gaps.

| Token | Multiplier (of base 4) | Typical use |
|-------|------------------------|-------------|
| `space.0` | 0 | Reset |
| `space.1` | 1× | Hair gaps, icon-to-label |
| `space.2` | 2× | Compact control padding |
| `space.3` | 3× | Dense list rows |
| `space.4` | 4× | Default control padding, caption gap |
| `space.5` | 5× | Group spacing inside sheets |
| `space.6` | 6× | Section internal rhythm |
| `space.8` | 8× | Between major blocks |
| `space.10` | 10× | Page section separation |
| `space.12` | 12× | Large breathing room around heroes |
| `space.16` | 16× | Rare editorial separation |

### 5.2 Density modes

| Mode | Where | Rules |
|------|-------|--------|
| **Gallery density** | Catalog, search results, similar | Tight gaps between **photos**; captions flush and quiet; prioritize scan speed (Google Photos / Steam library energy). |
| **Reading density** | Learn notes, long attributes | More vertical rhythm; comfortable body measure. |
| **Workbench density** | Compare, Builder | Structured alignment; consistent column gutters; chrome compact so media stays large. |

### 5.3 Spacing principles

- Prefer **space over borders** to separate sections.
- **First viewport (Explore):** generous space around brand + one headline + one sentence + CTA group + full-bleed photography — no stat strips or secondary modules in that viewport.
- Do not use spacing to create fake “cards” (large padded islands) around non-interactive content.
- Safe areas: respect notches and home indicators; keep primary actions reachable on mobile.

---

## 6. Grid

### 6.1 Page grid

| Concept | Guidance |
|---------|----------|
| **Columns** | 12-column mental model on desktop; collapse to 4 / 8 on smaller breakpoints as needed |
| **Margins** | Fluid; larger on desktop, tighter on mobile — never flush content to screen edge except full-bleed media |
| **Gutters** | Consistent; catalog photo gutters smaller than page section gutters |
| **Content max measure** | Continuous text capped; **media grids may go wider** than text measure |
| **Full-bleed** | Allowed for hero photography and gallery stages only |

### 6.2 Catalog / photo grid

- Primary metaphor: **photo grid**, not table rows.
- Cell aspect ratios: consistent within a view (e.g. square or 4:5 packshot). Mixing arbitrary ratios in one grid causes visual noise — prefer consistency; allow exceptions in editorial collections.
- Alignment: edges snap to grid; captions align across rows.
- Infinite scroll / pagination must not jump layout (reserve skeleton aspect ratios).

### 6.3 Product detail layout

Conceptual zones (top → bottom):

1. **Media gallery** (dominant)
2. Identity + taxonomy
3. Structured attributes
4. Used by / setups
5. Similar
6. Learning notes

Text columns may sit beside gallery on wide screens **only if** gallery remains the visual owner (Apple Store PDP energy).

### 6.4 Compare / Builder grids

- Compare: synchronized **photo slots** above attribute matrix — photos align before tables.
- Builder: visual assembly region is central; parts pickers are secondary columns or sheets — not a form-first wizard.

---

## 7. Breakpoints

### 7.1 Conceptual breakpoints

| Token | Approx. range | Intent |
|-------|---------------|--------|
| `bp.compact` | ~0–599 | One-column; bottom sheets; thumb-reach actions |
| `bp.medium` | ~600–899 | Two-column possible; filters as sheet or top bar |
| `bp.expanded` | ~900–1199 | Side filters optional; gallery + meta side-by-side on PDP |
| `bp.wide` | ~1200–1599 | Comfortable compare columns; builder split view |
| `bp.ultrawide` | ~1600+ | Cap line lengths; allow wider photo grids; avoid stretching chrome |

Exact pixel values are implementation details; **behavior** at each tier is normative.

### 7.2 Behavioral requirements by tier

| Concern | Compact | Expanded+ |
|---------|---------|-----------|
| Primary nav | Bottom bar or compact top + menu | Persistent top / side minimal chrome |
| Filters | Sheet / drawer | Sticky lightweight bar or side rail |
| Compare tray | Bottom sheet / sticky bar | Persistent tray + workspace |
| PDP gallery | Full-bleed vertical stack | Gallery dominates with optional side meta |
| Builder | Stepwise sheets OK if visual preview stays visible | Split: preview + parts |
| Hover affordances | Touch-first; no hover-only critical actions | Hover enhancements allowed as **additive** |

### 7.3 Orientation & input

- Design for touch and pointer. Hover is enhancement (§13).
- Support keyboard at all breakpoints (§15).
- Landscape compact: protect gallery visibility; avoid crushing media under chrome.

---

## 8. Elevation

Elevation expresses **temporary chrome and focus**, not card stacks of content.

| Level | Token | Use |
|-------|-------|-----|
| 0 | `elevation.flat` | Canvas, photo stages, most content |
| 1 | `elevation.raised` | Menus, popovers, filter chips bar |
| 2 | `elevation.overlay` | Modals, compare workspace sheets |
| 3 | `elevation.urgent` | Toasts / critical dialogs only |

**Rules:**

- Do not elevate static product tiles “to look premium.”
- Elevation pairs with subtle shadow (§10) and/or surface color shift — not both loudly.
- Photo content stays at flat / sunken stage; chrome floats above when needed.

---

## 9. Cards

### 9.1 Policy (strict)

**Cards are allowed only when they are the container for a user interaction** — i.e., the bounded region is itself the control or a clearly interactive unit (select, open, drag, toggle). If removing border, shadow, fill, or radius does not hurt interaction or understanding, it should not be a card.

### 9.2 When cards are allowed

| Allowed | Why |
|---------|-----|
| Interactive product cell in a selectable grid (hit target) | Selection / open is the job |
| Compare slot that can be cleared / replaced | Interactive slot |
| Builder part slot awaiting selection | Interactive empty state |
| Settings / account interactive rows grouped as a control list | Interaction container |
| Dialog / sheet content frames | Transient interaction surfaces |

### 9.3 When cards are forbidden

| Forbidden | Use instead |
|-----------|-------------|
| Hero / Explore first viewport | Full-bleed photography composition |
| Decorative wrapping of static text sections | Typography + spacing |
| Dashboard widget walls | One-job sections |
| “Feature cards” marketing rows | Editorial photography + links |
| Nesting cards in cards | Flatten hierarchy |
| Cardizing every search result with heavy chrome | Photo + quiet caption |

### 9.4 Card anatomy (when allowed)

- Clear hit target; focusable as a unit when it represents one action.
- Optional quiet border or hairline; **no** heavy drop shadow stacks.
- Selected state via `color.bg.selected` + border accent — not a sticker badge on the photo.
- Radius: use shared `radius.md` — consistent, modest (not pill-like mega-rounding).

### 9.5 Hero rule reminder

**Never use cards in the hero.** No inset hero images, side-panel hero cards, rounded media cards, tiled collages, or floating image blocks on promotional / Explore surfaces unless a future explicit exception is documented.

---

## 10. Shadows

### 10.1 Philosophy

Shadows are **scarce**. Dark themes use surface luminance more than drop shadows. Light theme (future) may use slightly more shadow — still restrained (HIG deference).

### 10.2 Conceptual tokens

| Token | Use |
|-------|-----|
| `shadow.none` | Default for media and most content |
| `shadow.soft` | Menus, popovers |
| `shadow.overlay` | Modals / sheets |
| `shadow.focus` | Optional ambient aid — never replaces the focus ring |

### 10.3 Rules

- No multi-layer “glowing” shadow stacks.
- No colored neon shadows.
- No shadows on product photography (photos sit on `color.media.stage`).
- Prefer 1 elevation cue: either soft shadow **or** border **or** surface shift — not all three.

---

## 11. Borders

| Token | Use |
|-------|-----|
| `border.width.hairline` | Default dividers (1 logical px) |
| `border.width.strong` | Active compare column emphasis (rare) |
| `border.radius.sm` | Chips, small controls |
| `border.radius.md` | Buttons, interactive cells |
| `border.radius.lg` | Sheets / large containers |
| `border.radius.pill` | **Avoid** for primary UI; reserved if ever for tiny status dots — not for CTAs |

### 11.1 Rules

- Prefer spacing and typography before drawing boxes.
- Dividers: low contrast; full-bleed dividers sparingly.
- Image frames: usually **no** border; the stage defines the edge.
- Selected interactive cells: accent-tinted border OK.
- Dashed borders: only for empty interactive slots (builder / compare empty).

---

## 12. Glassmorphism

### 12.1 Policy — use sparingly

Glass (translucency + blur) is a **special effect for floating chrome over media**, not a visual identity.

### 12.2 When allowed

| Allowed | Reason |
|---------|--------|
| Sticky filter bar over scrolling photo grids | Keeps context of photography underneath |
| Compare tray floating over catalog | Continuity while selecting |
| Compact top chrome over full-bleed Explore hero | Brand + nav without opaque slab killing the image |
| Transient tooltips / context menus over media | Readability without hard cut |

### 12.3 When forbidden

| Forbidden | Reason |
|-----------|--------|
| Glass panels as page section backgrounds | Noise; hurts text contrast |
| Frosted product photos | Corrupts visual truth |
| Glass cards for content blocks | Violates card policy + clutter |
| Heavy blur + high saturation accents | AI cliché / glow aesthetic |
| Glass everywhere in Builder/Compare workbenches | Prefer solid elevated surfaces for long tasks (legibility) |

### 12.4 Technical requirements (normative for later implementation)

- Maintain text/icon contrast on glass (extra scrim if needed).
- Respect `prefers-reduced-transparency` — fall back to opaque `color.bg.elevated`.
- Blur must not make scrolling feel sticky or low-FPS; if performance fails, use opaque chrome.

---

## 13. Buttons

### 13.1 Hierarchy

| Variant | Token | Job | Frequency |
|---------|-------|-----|-----------|
| Primary | `button.primary` | The one most important action in a region | At most one prominent primary per view region |
| Secondary | `button.secondary` | Alternative actions | Common |
| Tertiary / ghost | `button.tertiary` | Low-emphasis actions | Common in chrome |
| Destructive | `button.destructive` | Delete build, clear destructive | Rare; confirm when irreversible |
| Quiet text | `button.text` | Inline textual actions | “Manufacturer page”, “View similar” |

### 13.2 Content rules

- Labels are **verbs** or clear nouns: “Add to compare”, “Open in builder”, “Save build” — not “Submit”, “Buy”, “Get deal”.
- No shopping-bag icons as primary metaphor.
- Icon+label for primary tools; icon-only only when the metaphor is universal **and** has a tooltip / `aria-label`.
- Do not place primary purchase-like CTAs on PDP. External links stay tertiary.

### 13.3 Sizing & hit targets

| Token | Use |
|-------|-----|
| `button.size.sm` | Dense toolbars (compare, builder) |
| `button.size.md` | Default |
| `button.size.lg` | Rare emphasis (empty states) |

Minimum hit target: **44×44 CSS px** equivalent for touch (HIG-aligned). Visual size may be smaller if padding expands the hit area.

### 13.4 States

Every button defines: default, hover (pointer), active/pressed, focus-visible, disabled, loading.

Disabled: visibly quiet; never rely on color alone; do not remove from tab order without a reason (prefer focusable + explained disabled).

---

## 14. Icons

### 14.1 Style

- **Single icon family** — geometric, medium stroke, optically aligned to type.
- Prefer **outlined** icons for navigation; solid for selected / toggled states.
- Optical sizing: 16 / 20 / 24 conceptual sizes; align to text caps height where inline.
- No emoji as UI icons.
- No multicolored skeuomorphic icons in chrome.

### 14.2 Metaphor map (core)

| Action | Metaphor guidance |
|--------|-------------------|
| Search | Magnifier |
| Compare | Columns / split view — not “vs fire” |
| Builder | Racket/system assemble — avoid cart |
| Save / favorite | Bookmark or star — consistent one metaphor |
| Filters | Sliders / funnels — quiet |
| External link | Arrow-up-right — tertiary |

### 14.3 Rules

- Icons support recognition; labels carry meaning for primary nav.
- Decorative icons next to every heading are noise — omit.
- Status icons accompany text for semantic states (success/warning/danger).

---

## 15. Image treatment

### 15.1 Doctrine (from Product Vision)

If photography is weak, the product fails. Users should inspect grain, sponge texture, logo placement, topsheet sheen, sole pattern.

### 15.2 Shot roles in UI

| Shot | UI role |
|------|---------|
| Hero / packshot | Grid recognition, PDP lead |
| Detail / macro | Gallery secondary; inspect mode |
| Angle set | Gallery; spatial understanding |
| In-context | Optional; never replaces hero clarity |
| Comparison plate | Compare workspace; matched lighting |

### 15.3 Presentation rules

1. **Grids are photo grids** — title + thumb + price rows are forbidden patterns.
2. **PDP opens on media** — text supports the eye.
3. **Compare aligns photos before tables.**
4. **Search results stay visually scannable** at high density; typeahead includes photo thumbnails.
5. **No overlays on hero media:** no floating badges, promo stickers, info chips, or callout boxes on the image.
6. **No aggressive sale ribbons** or dense metadata chrome on the image.
7. **Missing photos** = visible data debt (`color.media.placeholder` + “Photo needed”), not broken icon silence.
8. **Object-fit:** packshots consistently contained on `color.media.stage`; do not randomly crop faces of equipment.
9. **Zoom / lightbox:** opt-in inspect; pinch-zoom friendly; keyboard dismissible.
10. **Video (later):** opt-in, secondary to stills; no autoplay stealing inspect focus.
11. **Alt text & captions:** mandatory for a serious database; decorative chrome images empty-alt.
12. **Rights / attribution:** available without cluttering the hero (meta region or info affordance).

### 15.4 Responsive image behavior

- Aspect-ratio reserved to prevent layout shift.
- Multiple resolutions for grid vs PDP vs lightbox (implementation later) — treated as a **product feature**.
- Lazy-load below fold; prioritize LCP hero intentionally.

---

## 16. Dark Theme (primary)

### 16.1 Surface stack

- Canvas deep and calm.
- Elevated surfaces for chrome only.
- Sunken media stages for photography.
- Accent rare and precise.

### 16.2 Content behavior

- Long sessions: avoid pure black / pure white extremes that cause fatigue.
- Separators quieter than in light theme.
- Shadows softer / rarer than light theme.
- Glass allowed only per §12.

### 16.3 Photography on dark

- Stage color consistent across catalog for fair visual comparison.
- Avoid heavy vignettes in UI chrome that falsify the photo.
- Do not add fake reflections under products as default chrome.

### 16.4 Early-product default

Dark is the **only** required shipping theme until light parity is explicitly scheduled and completed.

---

## 17. Light Theme (future)

### 17.1 Intent

Daylight browsing, sharing screenshots in bright contexts, accessibility preference — without becoming a retail white shop.

### 17.2 Rules for future implementation

| Rule | Detail |
|------|--------|
| Same tokens | Semantic token names identical to dark |
| Canvas | Quiet cool-neutral or true neutral light — **not** warm cream `#F4F1EA`-like paper |
| Accent | Same family; verify contrast on light surfaces |
| Cards | Same strict policy |
| Photography | Same stage neutrality; may use slightly lighter stage gray |
| Shadows | Slightly more present than dark, still soft |
| Glass | Even more sparing; contrast harder on light |
| Broadsheet cliché | Forbidden (hairline newspaper columns, zero radius fetish) |

### 17.3 Parity checklist (before enabling)

- [ ] All semantic colors meet contrast
- [ ] Focus rings visible on light surfaces
- [ ] Media stages do not wash out packshots
- [ ] Compare / builder workbenches remain calm
- [ ] No “light mode afterthought” — screens audited, not inverted blindly

---

## 18. Animations

### 18.1 Purpose

Motion **orients** users between hierarchy levels: grid → PDP, grid → compare, builder part swap, gallery index change. It is not celebration candy.

### 18.2 Intentional motion budget

Ship **2–3 signature motions** product-wide, then stop inventing new ones:

1. **Shared-element / continuity** feel when opening a product from a grid (image continuity if technically feasible; otherwise a restrained fade+scale).
2. **Compare tray** slide/present when selection count becomes active.
3. **Gallery cross-fade or swipe** between angles — precise, interruptible.

Optional micro: press feedback on buttons; checkbox/select tick — keep tiny.

### 18.3 Parameters (conceptual)

| Token | Guidance |
|-------|----------|
| `motion.duration.instant` | ≤ ~100ms — presses |
| `motion.duration.fast` | ~150–200ms — hovers, small fades |
| `motion.duration.normal` | ~250–350ms — panels, trays |
| `motion.duration.slow` | ~400–500ms — rare large transitions; avoid longer |
| `motion.easing.standard` | Smooth deceleration (ease-out family) |
| `motion.easing.emphasized` | For sheet presents |
| `motion.easing.linear` | Progress only |

### 18.4 Rules

- Interruptible; never block input for animation completion.
- No parallax noise, no bouncing product cards, no infinite shimmer except skeleton loading.
- Gallery autoplay forbidden by default.
- Respect `prefers-reduced-motion`: replace with cross-dissolve or instant cut; keep functional state changes.

---

## 19. Transitions

Transitions are the **choreography between states**; animations are the timed curves. Specify both.

| Transition | Expected behavior |
|------------|-------------------|
| Grid → PDP | Continuity on image if possible; chrome settles after media |
| PDP → Similar | In-place section scroll or soft push; do not remount whole app chrome |
| Add to compare | Tray appears / badge count updates; cell selected state updates immediately |
| Open compare workspace | Sheet/page with photo slots already populated — no empty flash |
| Builder part change | Preview updates with short cross-fade; specs update in sync |
| Filter change | Grid updates without full-page reload metaphor; skeletons if needed |
| Theme switch (future) | Cross-fade surfaces; do not flash white |

**Navigation chrome** stays stable across Explore / Equipment / Players / Builder — transitions happen in the content region.

---

## 20. Hover Effects

### 20.1 Principles

- Hover is **additive** for pointer users; touch users never lose access.
- On photo grids: prefer subtle luminance lift, slight scale **≤ 1.02**, or quiet border — pick **one**.
- Do not reveal critical actions **only** on hover (e.g. Compare must also exist as visible control or selection mode).
- No glare sweeps, shine animations, or colored glow hovers on photos.

### 20.2 Control hover

| Surface | Hover cue |
|---------|-----------|
| Buttons | Background wash / border emphasis |
| Text links | Underline or accent color shift |
| Interactive cells | Stage lift + selected affordance preview |
| Icon buttons | Background circle/square wash |

### 20.3 Disabled hover

No hover affordance that implies action; cursor reflects disabled where appropriate.

---

## 21. Focus states

### 21.1 Requirements (HIG + WCAG)

- **Visible focus** for all interactive elements (`:focus-visible` pattern).
- Focus ring uses `color.border.focus` — high contrast, 2px+ effective thickness, offset so it doesn’t collide with content.
- Never remove focus outlines without a replacement that meets contrast.
- Focus order follows reading / logical order: skip repeated nav with a skip link.
- Modal / sheet: focus trap while open; restore focus on close.
- Gallery: arrow keys move between images when gallery is focused; Esc exits lightbox.

### 21.2 Selection vs focus

- **Focus** = keyboard/pointer location.
- **Selection** = compare/builder chosen items.
- Both can coexist; styles must remain distinguishable.

---

## 22. Compare & Builder UI chrome rules

### 22.1 Global chrome (all surfaces)

Minimal: search, primary nav, compare indicator, account/saved (when auth exists). No affiliate banners, news tickers, or widget dashboards.

### 22.2 Compare

| Rule | Detail |
|------|--------|
| Entry | From grid, search, PDP — “Add to compare” |
| Tray | Compact; shows count + thumbnails; does not cover critical photo area permanently on desktop |
| Workspace | Photo slots synchronized first; attribute matrix second |
| Baseline | Allow pinning a baseline product |
| Honesty | Highlight differences; show Unknown explicitly |
| Share | URL-addressable compares when practical |
| Chrome weight | Workbench solid elevated surfaces preferred over glass for long sessions |
| Photography | Matched stage; same cell size; no badge overlays on slots |

### 22.3 Builder

| Rule | Detail |
|------|--------|
| Mental model | PCPartPicker composition + Apple product respect — **not** checkout configurator |
| Center | Visual racket assembly / preview |
| Parts | Blade + FH + BH (+ optional extras) as clear slots |
| Compatibility | Guidance, not punitive walls; document assumptions |
| Actions | Save / share / duplicate; “Open player setup in builder” |
| Specs | Aggregate summary with tabular figures |
| Chrome | Dense but calm; secondary panels don’t steal preview size |
| Forbidden | Progress-to-purchase steppers, price-total hero bars, “complete your order” language |

### 22.4 Filters & search chrome

- Sticky, lightweight filters.
- Search is a **place**, not only a header box — results remain visual.
- Empty states suggest similar queries and popular explorations — no dead ends.

---

## 23. Density

| Context | Target feel |
|---------|-------------|
| Catalog | High visual density, low chrome density |
| PDP | Media-luxurious; text sections breathable |
| Compare matrix | Information-dense; aligned columns; scannable deltas |
| Builder | Preview-large; controls compact |
| Explore home | Low density in first viewport; discovery modules below |

**Fatigue test:** If the user feels they are managing a dashboard, density chrome is too high. If they cannot scan a catalog quickly, photo density is too low or captions too loud.

---

## 24. Accessibility

### 24.1 Non-negotiables

- WCAG **2.2 AA** as baseline; aspire to AAA for long text.
- Keyboard complete for search, browse, compare, builder core paths.
- Screen reader: meaningful names, roles, states; live regions for compare count / save confirmations.
- Alt text for product images describing the equipment visibly (angle, color, type) — not “image123”.
- Captions / transcripts if video arrives.
- Prefer visible text labels; don’t rely on color alone for state.
- Hit targets ≥ 44×44 where touch applies.
- `prefers-reduced-motion` and `prefers-reduced-transparency` honored.
- Error messages adjacent to fields; not color-only.
- Provenance (“rumored”, “confirmed”) announced programmatically, not only styled.

### 24.2 Visual-first ≠ vision-only

Structured attributes must remain available as text/data tables. Photography enhances understanding; it does not replace accessible information architecture.

### 24.3 Focus & forms

- Labels always associated with inputs.
- Autocomplete and typeahead navigable with arrow keys + Enter + Esc.
- Compare selection announced when items added/removed.

---

## 25. HIG alignment notes

Aligned with Apple Human Interface Guidelines spirit:

| HIG idea | TTSetupBuilder application |
|----------|----------------------------|
| **Clarity** | Legible type, precise icons, unobscured photos |
| **Deference** | Chrome yields to content — especially media |
| **Depth** | Elevation for temporary layers; not fake card stacks |
| **Consistency** | Same tokens and patterns across Equipment / Players / Builder |
| **Direct manipulation** | Select to compare; assemble in builder with visible result |
| **Feedback** | Immediate selection, save, and error feedback |
| **User control** | Interruptible motion; clear exits from sheets |
| **Accessibility** | Equal experience, not bolted on |

**Explicit divergences from “iOS app template” aesthetics:** We borrow discipline, not Apple product marketing layouts wholesale. Steam-like discovery density and IMDB-like entity graphs remain in scope when they don’t violate deference to photography.

---

## 26. Do / Don’t (summary)

### 26.1 Do

- Lead with honest equipment photography.
- Keep Explore’s first viewport to: brand, one headline, one sentence, CTA group, dominant full-bleed image.
- Use cards only as interaction containers.
- Prefer dark, calm canvases for early product.
- Use one accent family with restraint.
- Choose expressive grotesque typography with tabular figures for specs.
- Make compare and builder feel native and URL-shareable.
- Mark unknowns honestly.
- Invest in focus states, keyboard paths, and alt text.
- Limit signature motions to a small intentional set.

### 26.2 Don’t

- Design like ecommerce (cart, buy-first, promo badges, sale urgency).
- Bury photos under stickers, chips, or autoplay video.
- Use purple-on-white / indigo glow themes or cream+terracotta broadsheet clichés.
- Default to Inter / Roboto / Arial as the design face.
- Card-ify heroes or static content.
- Overuse glassmorphism.
- Stack multi-layer shadows and glow effects.
- Build dashboard home pages with stat strips and widget walls.
- Invent ratings or precision.
- Ship hover-only critical actions.
- Treat the builder as a checkout funnel.

---

## 27. Component inventory (conceptual, for later)

Documented for planning — **not** implementation:

- App shell (nav, search entry, compare indicator)
- Photo grid cell (interactive)
- Product gallery + lightbox
- Filter bar / filter sheet
- Search typeahead (with thumbs)
- Attribute matrix / spec list
- Compare tray + compare workspace
- Builder preview + part slots
- Player header + setup timeline list
- Empty / missing-photo / unknown states
- Toast / dialog / sheet
- Buttons, icon buttons, inputs, chips (rare)

Each must obey tokens and policies above before visual polish details.

---

## 28. Governance

| Field | Value |
|-------|--------|
| Title | Design System — TTSetupBuilder |
| Location | `docs/ui/DESIGN_SYSTEM.md` |
| Owner | Design Systems / Product Design (principal) |
| Change policy | Update when visual language or interaction policy shifts; note significant changes in `CHANGELOG.md` |
| Conflict resolution | Product Vision > this Design System > individual screen mocks |

**Review questions before accepting UI work:**

1. Does photography lead?
2. Would this still make sense with every sales affordance removed?
3. Are cards only interaction containers?
4. Is motion intentional and reduced-motion safe?
5. Does it work at catalog scale?
6. Is it closer to a database you love browsing than a store you endure?

---

**Bottom line:** TTSetupBuilder’s design system exists to protect photographic truth, exploration speed, and calm premium clarity — Apple-level restraint with PCPartPicker composition power and Steam/IMDB/Google Photos discovery energy — without ever becoming a shop.
