# LotMerit design

LotMerit helps property investors and their teams decide what a deal is worth and what to do with it next. This document sets the frontend direction for this checkout. The implemented color, type, and shape tokens live in [globals.css](src/app/globals.css).

## Visual direction

Use the clarity of a property feature on Home and of a financial worksheet in the tools. Give the property room to be seen, keep source amounts close to what they calculate, and put the address and current stage first wherever a team reviews a deal.

Use a pale green-tinted canvas, white work surfaces, green-black text, and flat section boundaries. Space and alignment establish hierarchy. Use a single 1px `border-border` edge and 12px `rounded-lg` corners for surfaces that need framing. Use dividers or spacing within a surface. Keep shadows subtle and neutral. The surface system excludes gradients, glow, glass effects, neon, and nested cards.

## Color and contrast

| Role | Treatment |
| --- | --- |
| Canvas and content | Use `--background` for the canvas, `--card` for work surfaces, and `--foreground` and `--muted-foreground` for primary and secondary text. |
| Brand | Emerald `#22A06B` defines the brand palette. The mark, navigation, links, and controls use the contrast-tuned `--primary` value for each theme. |
| Primary action | Pair `--primary` with `--primary-foreground`. The existing deeper light-mode emerald supports light text. In dark mode, pair the brighter emerald with green-black text. Keep the pairing legible on hover and press. |
| Secondary action | Use a neutral outline or a text link with a clear hover state. Use `--accent` and `--accent-foreground` for quiet selection and hover surfaces. |
| Boundaries and focus | Use `--border` for section dividers, `--input` for form boundaries, and `--ring` for a distinct, immediate focus outline. |
| Deal stage | Use neutral labels for routine stages, amber for pending attention such as **Needs info**, emerald for **Closed**, and red for **Rejected**. The stage name carries the meaning. |
| Validation and warnings | Use red for errors and destructive actions. Reserve amber for warnings and pending states. Pair every state with a plain-language label or message. |

Check both themes. Target at least 4.5:1 for ordinary text and 3:1 for large text, focus indicators, and necessary control boundaries. Keep the existing theme preference and apply the same hierarchy in each theme.

## Type, spacing, and imagery

- Use Geist for display, headings, labels, and interface copy. Set the Home headline around 40–72px as space allows, screen titles around 28–36px, and default body and input text at 16px. Keep labels and dense table rows at 14px and reserve 12px for short captions.
- Use tabular numerals for amounts, percentages, and counts. Align comparable amounts to the right and keep the unit with the figure. Use a larger, heavier figure for the main result and a quieter label with the period or unit.
- Use a 4px spacing base, with 8–16px inside related groups and 24–48px between regions. Center public content in a capped container around 1200px with 16–32px gutters. Allow text to wrap, including long addresses and currency values.
- Use believable property photography with natural daylight and a crop that shows the house. Keep the property image and any caption legible independently. Use only authorized imagery, with descriptive alt text for an informative image.
- Use `BrandMark` for the brand and thin or regular Phosphor icons from `src/components/ui/icons.tsx` for interface actions. Give icon-only controls accessible names. Keep labels in sentence case and use emoji-free UI and email subjects.

## Brand assets

The 512 × 512 transparent mark at `public/brand/lotmerit-mark.png` supplies the silhouette for both `BrandMark` variants. The interface uses the current theme's primary colors. Standalone icons use the emerald mark on deep green-black.

Run `node scripts/generate-icons.js` to regenerate the manifest PNGs (72, 96, 128, 144, 152, 192, 384, and 512 px), 180 px Apple touch icon, 32 px PNG favicon, 16/32/48/256 px ICO, and `/icons/icon.svg`. The manifest artwork fits within the central maskable safe circle. The same command combines the mark with `public/example-property.webp` for the 1200 × 630 px social preview at `src/app/opengraph-image.jpg`. The adjacent `.alt.txt` supplies its description.

ImageGen supplied the mark and property artwork. Watermarks Remover (MIT) performed a metadata-only cleanup on the source PNGs. The decoded pixels matched before and after. [Pinned tool source](https://github.com/guillaumemeyer/watermarks-remover/tree/5a62be6338d2812372b1da440e55c82922f97d53)

## Home and public navigation

Open with a compact headline, one sentence, and a clear **Browse calculators** action. Keep sign-in and the account entry visible through the existing public routes. The brand and key actions fit in the first desktop viewport.

Place one broad property figure immediately under the opening, with the image occupying most of the width and a single caption area alongside it. Label it **Example deal**, name the property, and show a short set of estimates such as after-repair value, repairs, and maximum offer. Any displayed result should agree with its example assumptions. Keep the photo unobstructed. On a narrow screen, keep the opening and actions compact, then stack photo and caption. This figure replaces the dark appraisal-sheet treatment and its miniature comparable-sales table.

Follow the example with a plain, scannable list of calculators, grouped by what they help decide if grouping improves scanning. Describe the workspace in terms of work someone can do. Use factual headings, clear action labels, and useful captions. Omit numbered eyebrows, made-up proof, and promotional superlatives.

## Calculators

Use a shared worksheet rhythm. Start with the tool name and strategy selector where applicable. On desktop, top-align assumptions and results in adjacent columns. Group related fields with headings or fieldsets and give results a clear main figure followed by the calculation breakdown. On mobile, keep strategy, assumptions, main result, and breakdown in reading and focus order so a user can edit and recalculate within the same page.

Use visible labels associated with the controls. Put units and constraints beside the relevant input and connect supporting text programmatically. Show a specific inline error at the field, expose its invalid state, and preserve entered values. Give strategy tabs proper tab and panel semantics and arrow-key navigation. Use concise, polite feedback for meaningful result updates.

Preserve current defaults, ranges, formulas, result labels, and handoffs between tools, including Repairs to MAO. Keep the existing BRRRR account gate and route to sign in. Keep save and account entry actions reachable in every viewport.

## Workspace

Organize the dashboard around real deals and the next action available to the current user. Lead with address, stage, and a clearly labeled amount such as asking price, offer, or after-repair value when present. Use subordinate summaries with source-backed counts and totals. Show a plain missing-value state and distinguish it from a recorded zero.

Keep deals easy to scan in rows and stage groups. Show the current stage in text. Give authorized users an explicit stage-change control in list and board views that works with a tap, click, or keyboard. Dragging can remain available as a second interaction. Keep the current stage and focus understandable during pending changes. Confirm success and provide a clear error if the update fails.

Keep search, filters, view choice, navigation, and account and theme controls available at usable widths. Reflow narrow deal rows around the address and stage before secondary fields. Give empty, filtered, loading, and error states their specific context and one useful next action when available. Keep account forms and menus on the same typography, spacing, and action system.

Use only records and calculations available to the current user. Confine invented properties and figures to clearly labeled public examples. Workspace presentation changes preserve existing authentication, organization and role boundaries, data access, saved preferences, and deal workflows.

## Controls and motion

- Use native controls or the existing accessible primitives. Keep one primary action per group, indicate the current option in text and programmatically, and make important touch targets at least 44px. Keep focus visible and clear of sticky chrome. Announce asynchronous success or failure and retain focus on the invoking control where possible.
- Use transitions of at most 250ms, with named properties and `ease-out` for entrances. Use a brief `scale(0.97)` pointer press and keep keyboard and frequent interactions still. If a reveal needs scale, start at 0.95 with opacity. When a list needs a stagger, use 30–80ms. Honor `prefers-reduced-motion`.

## Design checks

- Review Home and ROI **Buy & Hold** at desktop and mobile widths, including 1280×800 and 390px wide. Check 320px reflow, keyboard order, labels, focus, disabled and error states, and both color themes on changed surfaces.
- Review alignment, typography, and copy in the browser. Check the affected calculator and workspace flows through their normal entry points.

The Mercury and Wise documents informed the organization of roles, typography, layout, and components. LotMerit's visual decisions come from its own product and tokens. [Mercury](https://github.com/VoltAgent/awesome-design-md/blob/fcc70284932276d085f01ef9f83edde90b1258cb/design-md/mercury/DESIGN.md) · [Wise](https://github.com/VoltAgent/awesome-design-md/blob/fcc70284932276d085f01ef9f83edde90b1258cb/design-md/wise/DESIGN.md)
