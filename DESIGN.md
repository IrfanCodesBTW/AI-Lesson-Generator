# Design System: AI Lesson Plan Generator

**Project ID:** IrfanCodesBTW/AI-Lesson-Generator

## 1. Visual Theme & Atmosphere

The design system adopts a **"Playful Professionalism"** atmosphere. Preschool teachers operate in dynamic, high-energy classrooms and need an interface that is both **calmingly structured** and **optimistically warm**.

- **Mood:** Airy, reassuring, friendly, and structured.
- **Density:** Generous spacing (`gap-6`, `space-y-6`) to reduce cognitive load. Touch targets are large and clear for mobile ease-of-use in active classroom environments.
- **Aesthetic Philosophy:** Light card grids, soft drop shadows, pastel badges, and smooth micro-transitions. The interface avoids cold corporate aesthetics, leaning instead into friendly rounded corners and colorful accents that echo the preschool environment.

---

## 2. Color Palette & Roles

The colors are selected to pass WCAG AA contrast standards (minimum 4.5:1 ratio) while maintaining a warm and welcoming educational aesthetic.

### Primary Identity

- **Deep Ocean Blue (`#0369a1` / `brand-600`):** Used for primary action buttons, main navigation links, and section headings. Conveys reliability and calm.
- **Dark Cobalt (`#075985` / `brand-700`):** Hover states for primary actions and active navigation items.
- **Sky Blue Accent (`#0ea5e9` / `brand-500`):** Focus states, active borders, and highlights.
- **Soft Sky Tint (`#e0f2fe` / `brand-100` / `#f0f9ff` / `brand-50`):** Light backgrounds for selected elements, info banners, and subtle panel highlights.

### Semantic Accents (AI vs. Static Paths)

- **Creative AI Violet (`#7c3aed` / Text: `#6d28d9` / BG: `#f3e8ff`):** Represents the generative AI features. Used for the "AI" source badge.
- **Warm Sunshine Gold (`#d97706` / Text: `#b45309` / BG: `#fef3c7`):** Represents deterministic fallbacks. Used for the "Template" source badge.

### Neutrals & Backgrounds

- **Slate Background (`#f8fafc` / `slate-50`):** Base canvas color for the entire application.
- **Pure White (`#ffffff`):** Card backgrounds, inputs, and primary content sheets.
- **Slate Charcoal (`#0f172a` / `slate-900`):** Primary headings and body copy to ensure maximum legibility.
- **Muted Slate (`#475569` / `slate-600`):** Secondary description text, dates, and labels.
- **Soft Border Grey (`#e2e8f0` / `slate-200`):** Divider lines and container outlines.

### Feedback

- **Soft Crimson (`#e11d48` / Text: `#be123c` / BG: `#ffe4e6`):** Errors, deletes, and warning states.

---

## 3. Typography Rules

- **Font Family:** `Inter`, system-ui, sans-serif. Clear, modern geometric letterforms that remain highly legible on small mobile screens.
- **Scale & Hierarchy:**
  - **Page Titles:** `text-2xl font-bold tracking-tight text-slate-900` (e.g., Dashboard Title, Detail Page Header).
  - **Section/Card Headers:** `text-lg font-semibold text-slate-900`.
  - **Input Labels / Metadata:** `text-sm font-medium text-slate-700`.
  - **Body / Content:** `text-sm leading-relaxed text-slate-800`.
  - **System Labels:** `text-xs uppercase tracking-wider font-semibold`.
- **Curriculum Rendering:** Generated contents like _rhymes_ and _activities_ are displayed using `whitespace-pre-wrap font-sans text-sm text-slate-800` to maintain natural stanza or step breaks without relying on system-code fonts.

---

## 4. Component Stylings

### Buttons

- **Shape & Margins:** Inline-flex, horizontally centered, `px-4 py-2` on desktop, `px-6 py-3` on mobile for better touch targets. Subtly rounded corners (`rounded-md`).
- **Primary Button:** Deep Ocean Blue background (`bg-brand-600`), text-white. Hover state shifts to Dark Cobalt (`hover:bg-brand-700`). Focus state uses outline ring (`focus:ring-2 focus:ring-offset-2 focus:ring-brand-500`).
- **Secondary Button:** Pure White background, subtle border (`border-slate-300`), text (`text-slate-700`). Hover transitions to light slate background (`hover:bg-slate-50`).
- **Danger Button:** Crimson background (`bg-red-600`), text-white. Hover transitions to `bg-red-700`.
- **Micro-interactions:** Smooth color/opacity transitions (`transition-colors duration-150 ease-in-out`). Disabled state opacity is locked to 50% (`disabled:opacity-50 disabled:cursor-not-allowed`).

### Cards & Containers

- **Main Sheets:** White background (`bg-white`), borders (`border border-slate-200`), corners (`rounded-lg`), shadow (`shadow-sm`).
- **Dashboard Lesson Items:** List items are styled as responsive horizontal flex cards. They transition slightly on hover to signal clickability.
- **Layout Padding:** `p-6` inside main cards, responsive to `p-4` on smaller screens.

### Inputs & Selects

- **Control Styling:** Rounded corner (`rounded-md`), standard grey border (`border-slate-300`), white background, `px-3 py-2` padding, font size 14px (`text-sm`) to prevent iOS zoom-on-focus.
- **Active State:** Focus ring (`focus:border-brand-500 focus:ring-1 focus:ring-brand-500`).
- **Labeling:** Explicitly associated `<label>` tag positioned above the input with `label` styling (`mb-1 text-sm font-medium text-slate-700`).

---

## 5. Layout & Spacing Principles

- **Grid Bounds:** Centered single-column shell with a max-width of `max-w-5xl` (1024px) for reading layouts.
- **Page Padding:** Responsive gutter margins: `px-4 py-6` on mobile devices; `px-8 py-8` on tablet and desktop.
- **Rhythm:** Consistent vertical layout stack of `space-y-8` (32px) between major header and body blocks, and `space-y-4` (16px) inside section contents.
- **Responsive Breakpoints:**
  - Mobile-first: Under `640px` (sm), standard forms stack vertically (`grid-cols-1`).
  - Desktop: At or above `768px` (md), forms align side-by-side (`grid-cols-3` or custom sidebar layouts).

---

## 6. Stitch Master Prompt (Directive)

Use the following prompt when instructing Stitch to build, modify, or extend screens for the AI Lesson Plan Generator:

```text
You are generating screens for a preschool teacher web application called "AI Lesson Plan Generator". Maintain a warm, reassuring, and clean "Playful Professionalism" aesthetic.

Rules:
1. Base Canvas: Use `#f8fafc` (slate-50) for the page background.
2. Typography: Use the Inter sans-serif font family. Main headers must be bold charcoal slate (#0f172a), labels must be (#475569), and generated curriculum items must be highly readable (#1e293b).
3. Primary Brand Colors:
   - Primary: `#0369a1` (Deep Ocean Blue) for headers, icons, and primary buttons.
   - Hover Primary: `#075985` (Dark Cobalt).
   - Light Accent: `#e0f2fe` / `#f0f9ff` (Soft Sky) for banners and selected panels.
4. Semantic Accents:
   - AI Path: Violet color theme (BG: `#f3e8ff`, Text: `#6d28d9`) for AI-generated indicators.
   - Fallback Path: Sunshine Gold color theme (BG: `#fef3c7`, Text: `#b45309`) for template indicators.
5. Components:
   - Cards: White background, subtle border (#e2e8f0), rounded-lg (8px corners), and shadow-sm.
   - Forms: Vertical stack layout on mobile, multi-column inline grid on desktop. Inputs must be rounded-md with a slate-300 border, and focus rings using brand blue.
6. Animations: Keep transitions subtle (transition-colors or transition-all with duration-150). Make interactions feel tactile yet lightweight.
7. Tone: Accessible, friendly, clean, and highly organized to help busy teachers quickly plan their day.
```
