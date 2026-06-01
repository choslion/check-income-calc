# Design Guide

---

## Confirmed Design Rules

These rules are directly derived from `src/index.css`, component source, and consistent patterns found across the codebase.

### Theme System

The app supports two dark themes, toggled via `ThemeContext` and applied as a `data-theme` attribute on `<html>`.

| Theme | Description | Primary color |
|-------|-------------|---------------|
| `binance` | Dark with yellow accent | `#fcd535` (Binance yellow) |
| `revolut` | Pitch black with white accent | `#ffffff` |

The selected theme is persisted in `localStorage` under the key `budget-theme`. Default is `binance`.

**Rule:** All styling must use CSS custom properties (tokens). Do not hardcode color values, border radii, or font stacks in components.

---

### CSS Design Tokens

All tokens are defined in `src/index.css` for both themes.

#### Color Tokens

| Token | binance | revolut | Usage |
|-------|---------|---------|-------|
| `--canvas` | `#0b0e11` | `#000000` | Page background |
| `--surface-card` | `#1e2329` | `#16181a` | Card/panel background |
| `--surface-input` | `#2b3139` | `#0a0a0a` | Input field background |
| `--hairline` | `#2b3139` | `rgba(255,255,255,0.12)` | Dividers, borders |
| `--primary` | `#fcd535` | `#ffffff` | CTA buttons, active state, accent |
| `--primary-hover` | `#f0b90b` | `#f4f4f4` | Hover state of primary |
| `--on-primary` | `#181a20` | `#000000` | Text on primary color |
| `--on-dark` | `#ffffff` | `#ffffff` | Primary text on dark background |
| `--on-dark-mute` | `#929aa5` | `rgba(255,255,255,0.6)` | Secondary text |
| `--muted` | `#707a8a` | `rgba(255,255,255,0.4)` | Tertiary/disabled text |
| `--success` | `#0ecb81` | `#428619` | Success state |
| `--danger` | `#f6465d` | `#e23b4a` | Error/danger state |
| `--info` | `#3b82f6` | `rgba(255,255,255,0.4)` | Info state |

#### Border Radius Tokens

| Token | binance | revolut | Usage |
|-------|---------|---------|-------|
| `--radius-card` | `12px` | `20px` | Cards and panels |
| `--radius-button` | `6px` | `9999px` (pill) | Standard buttons |
| `--radius-input` | `8px` | `12px` | Input fields |
| `--radius-pill` | `9999px` | `9999px` | Pill/chip elements |

#### Typography Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--font-number` | `"IBM Plex Mono"` (binance) / `"Inter"` (revolut) | Numeric values, percentages, monetary amounts |

Base font: `"Inter"`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `sans-serif`.

---

### Layout

- **Max content width:** `max-w-xl` (Tailwind, approx 576px), centered with `mx-auto`
- **Page padding:** `px-4 py-8`
- **Card padding:** `24px 20px` (large cards) or `16px 20px` (stat cards)
- **Gap between cards:** Tailwind `space-y-4` (16px) or `gap-3` (12px) in flex rows
- All layouts are mobile-first. The app is designed for 375–576px width.

---

### Typography Scale

Derived from consistent usage across components. All sizes are Tailwind defaults:

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Labels, sublabels, uppercase section headers |
| `text-sm` | 14px | Body text, descriptions, list items |
| `text-base` | 16px | Logo text |
| `text-lg` | 18px | Status labels |
| `text-2xl` | 24px | Inline stats (occupancy bar) |
| `text-3xl` | 30px | Page headings |
| `text-4xl` | 36px | Hero heading |

Large numeric displays (e.g., the 60px occupancy percentage) are set with inline styles.

Section headers use a consistent pattern:
```tsx
className="text-xs font-semibold tracking-widest uppercase"
style={{ color: 'var(--on-dark-mute)' }}
```

---

### Buttons

**Primary action button:**
```tsx
style={{
  backgroundColor: 'var(--primary)',
  color: 'var(--on-primary)',
  borderRadius: 'var(--radius-button)',
  border: 'none',
  fontWeight: 700,
  fontSize: '15px',
}}
```

**Secondary / ghost button:**
```tsx
style={{
  backgroundColor: 'transparent',
  color: 'var(--on-dark-mute)',
  border: '1px solid var(--hairline)',
  borderRadius: 'var(--radius-button)',
  fontWeight: 600,
  fontSize: '15px',
}}
```

**Disabled state:** `backgroundColor: 'var(--surface-card)'`, `color: 'var(--muted)'`, `cursor: 'not-allowed'`

**Pill/chip buttons** (e.g., quick-add furniture chips):
```tsx
style={{
  borderRadius: 'var(--radius-pill)',
  border: '1px solid var(--hairline)',
  backgroundColor: 'var(--surface-input)',
  color: 'var(--on-dark-mute)',
  fontSize: '12px',
  fontWeight: 600,
}}
```

---

### Cards

Standard card wrapper:
```tsx
style={{
  backgroundColor: 'var(--surface-card)',
  borderRadius: 'var(--radius-card)',
  padding: '16px 20px',
}}
```

Cards with sections use `borderBottom: '1px solid var(--hairline)'` between header and body rows.

Interactive cards use hover effects:
```tsx
onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--hairline)')}
```

---

### Color Usage for Status/Feedback

These colors are used directly (not via tokens) for semantic states:

| Color | Hex | Usage |
|-------|-----|-------|
| Green | `#4fc98a` | Spacious occupancy, success check |
| Blue | `#4f80f7` | Normal occupancy |
| Yellow | `#f7d04f` | Tight occupancy, warnings |
| Red | `#f76f6f` | Very tight occupancy, errors |

Warning icons use `⚠` character with `color: '#f7d04f'`.  
Success indicators use `✓` character with `color: '#4fc98a'`.

---

### Navigation / Header

- Sticky top header, `z-50`, `height: 56px` (`h-14`)
- Logo left-aligned, nav links right-aligned
- Active link uses `color: 'var(--primary)'`, `fontWeight: 600`
- Inactive link uses `color: 'var(--on-dark-mute)'`

---

### Progress / Gauge Bars

Pattern used in occupancy displays:
```tsx
// Track
style={{ height: 10, backgroundColor: 'var(--surface-input)', borderRadius: 9999 }}
// Fill
style={{ width: `${pct}%`, backgroundColor: status.color, borderRadius: 9999, transition: 'width 0.6s ease' }}
```

---

### Export Image Style

The exported PNG (1080px wide, retina 2×) uses its own hardcoded dark theme:

- Background: `#0b0e11`
- Room canvas background: `#0d1117`
- Grid lines: `rgba(255,255,255,0.07)`
- Room border: `rgba(255,255,255,0.55)`
- Warning text: `#f7d04f`
- Fonts: `Inter` for UI text, `IBM Plex Mono` for numbers
- Watermark: `생활계산소`

---

## Inferred Design Patterns

These patterns appear consistently across components but are not formally specified.

- **No shadows.** Depth is conveyed using background color differences between `--canvas` and `--surface-card`, not box shadows.
- **No animations beyond simple transitions.** Only `transition: 'width 0.6s ease'` on bars and `transition: 'color 0.15s'` on nav links.
- **Minimal icon use.** Only `lucide-react` icons are used (`ChevronRight`). Character-based glyphs (`⚠`, `✓`, `←`, `→`) are preferred for simple indicators.
- **All inputs are uncontrolled-style numerics.** No complex form libraries are used.
- **Empty states are inline.** No modal or full-page empty states.
- **Mobile-first, single-column layout.** The max-width constraint (`max-w-xl`) ensures the layout never stretches to desktop widths.

---

## Missing Design Information

- No formal dark/light mode toggle. Only dark themes exist (`binance` and `revolut`).
- No defined motion/animation system beyond the two transitions noted above.
- No tooltip or popover pattern established.
- No modal/dialog component exists yet.
- No table/data-grid pattern established.
- No defined spacing scale beyond Tailwind defaults. Padding values in inline styles vary (e.g., `12px 20px`, `16px 20px`, `24px 20px`) without a documented grid.
- No defined icon size system. Icon sizes are set ad hoc.
- Ad banner slot (`AdBannerSlot.tsx`) exists but its visual specification is unknown.
