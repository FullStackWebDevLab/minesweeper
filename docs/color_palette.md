# Color Palette

## Core Philosophy

* **Surfaces** → small lightness differences (subtle contrast)
* **Text** → high contrast (readability)
* **Accent** → strong contrast (attention)
* **Borders** → barely visible
* **States** → systematic (hover, active, disabled)

```
Background → Surfaces → Borders → Text → Accent
(low contrast)                      (high contrast)
```

---

## Surface Colors

### Background (base)

```
--background-color: #080f18
```

Use for:

* main page background
* deepest layer

### Sidebar / Primary surface

Subtle elevation above background.

```
--surface-background-1: #0f1b26
```

Use for:

* sidebar
* top navigation bar
* main panels

### Cards / Panels / Sections

```
--surface-background-2: #132433
```

Use for:

* cards
* modals
* dropdowns
* content blocks

### Elevated surface (dialogs, popovers)

```
--surface-background-3: #172c3d
```

Use for:

* modals
* popovers
* floating UI

---

## Border Colors

Borders must be subtle, not loud.

### Default border

```
--border-color-1: #1c3242
```

Use for:

* card borders
* input borders
* sidebar separators

### Strong border (focus / emphasis)

```
--border-color-2: #274a5f
```

Use for:

* active panels
* selected items

---

## Text Colors

### Primary text

```
--text-primary: #e6f1f7
```

Use for:

* headings
* main content

High contrast on #080f18.

### Secondary text

```
--text-secondary: #a9c0cf
```

Use for:

* descriptions
* labels
* metadata

### Muted text

```
--text-muted: #6f8fa3
```

Use for:

* placeholders
* disabled text
* hints

---

## Accent System

Accent:

```
--accent: #0dcaf0
```

Use for:

* primary buttons
* links
* highlights
* toggles
* progress bars

### Accent hover (slightly brighter)

```
--accent-hover: #2dd6f5
```

Use when mouse hovers over an element with background set to `var(--accent)`.

### Accent active (slightly darker)

```
--accent-active: #0aa2c0
```

Use for selected/active items like search input border.

### Accent subtle (background tint)

```
--accent-soft: rgba(13, 202, 240, 0.12)
```

Use for:

* badges
* hover backgrounds

---

## Semantic Colors (Status States)

These are tuned for dark UI.

### Success

```
--success: #2ecc71
```

### Warning

```
--warning: #f1c40f
```

### Error

```
--danger: #e74c3c
```

### Info (aligned with the accent)

```
--info: #0dcaf0
```

Usage:

* alerts
* validation
* badges
* notifications

---

## Button Color System

### Primary button

```
background-color: var(--accent);
color: #06202a
```

### Secondary button

```
background-color: var(--surface-background-2);
color: var(--text-primary);
border: var(--border-color-1);
```

### Ghost button

```
background-color: transparent
color: var(--text-secondary);
hover background: var(--surface-background-1);
```

---
