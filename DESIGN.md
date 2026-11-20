---
name: Azure Horizon
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44464f'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757780'
  outline-variant: '#c5c6d0'
  surface-tint: '#495d8f'
  primary: '#001238'
  on-primary: '#ffffff'
  primary-container: '#0f2756'
  on-primary-container: '#7b8fc5'
  inverse-primary: '#b1c6fe'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#00190e'
  on-tertiary: '#ffffff'
  tertiary-container: '#00301f'
  on-tertiary-container: '#24a375'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b1c6fe'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#314576'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
  metric-number:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
---

## Brand & Style
The design system balances the bespoke, sensory warmth of high-end Mediterranean hospitality with the exacting, data-dense requirements of an enterprise property management platform. It addresses hoteliers, front-desk concierges, revenue managers, and executive housekeeping teams who demand rapid comprehension without aesthetic compromise.

The visual direction marries **Modern Editorial Minimalism** with **Tactile Precision**. The interface eliminates non-functional decorative clutter in favor of confident typographic hierarchy, warm alabaster surfaces, tailored borders, and high-visibility status tokens. It conveys calm authority during peak check-in rushes while preserving the prestigious, serene character expected of a world-class coastal boutique retreat.

## Colors
The palette is rooted in maritime depth and architectural materials: deep Aegean navy anchors primary actions and navigation, while champagne brass delivers focused attention without visual aggression. 

Functional operational states have dedicated, unambiguous chromatic assignments across the room management matrix:
- **Clean / Inspected / Available:** Emerald Sage (`#059669`), paired with a translucent sage tint (`#ECFDF5`) for background pills and grid blocks.
- **Occupied / In-House:** Vibrant Indigo Azure (`#2563EB` / `#3B82F6`), indicating active guest occupancy with instant optical legibility on timeline charts.
- **Housekeeping / Turnover:** Ochre Amber (`#D97706` / `#F59E0B`), applied to rooms awaiting cleaning, linen refresh, or inspection.
- **Maintenance / Out of Order:** Crimson Coral (`#E11D48`), reserved strictly for hardware blocks, engineering tickets, and critical alerts.

Neutral backgrounds deviate from harsh sterile cold grays, utilizing warm alabaster (`#F8FAFC`), crisp linen white (`#FFFFFF`), and refined slate borders (`#E2E8F0`) to ensure 10+ hour shift comfort for operational staff.

## Typography
Plus Jakarta Sans provides geometric clarity with polished, humanist subtleties. In property management dashboards, numbers carry vital financial and operational weight: all tabular data, room numbers, ADR (Average Daily Rate), RevPAR, and folio balances must employ tabular lining numbers (`font-variant-numeric: tabular-nums; lining-nums;`) to guarantee strict vertical alignment across dense inventory matrices.

Labels and status markers use medium-to-semibold weights with slight positive tracking (`0.04em` to `0.05em`) to ensure legibility when rendered in uppercase inside compact UI chips. Page headers combine deep navy tones with tightened letter-spacing (`-0.02em`) to mirror luxury editorial typography.

## Layout & Spacing
The layout follows a responsive, fluid grid anchored by a structured left-hand navigation rail.
- **Desktop (1280px+):** 12-column layout with fixed 260px administrative navigation, 1.5rem gutters, and 2rem outer canvas margins. Multi-row tape charts and booking grids scroll horizontally within a fixed-height containment viewport.
- **Tablet (768px - 1279px):** Navigation collapses to a 72px icon rail. Gutters adjust to 1rem; room status views switch dynamically from matrix grid to grouped stacked cards.
- **Mobile (<768px):** Single-column stacked flow with bottom operational action sheet; 1rem outer margin with compact 0.5rem spacing between room operational cards.

Vertical rhythms are built on an 8px base grid, with micro 4px increments for tight table rows, badge padding, and timeline cell borders.

## Elevation & Depth
Visual hierarchy relies primarily on structured surface containment and delicate architectural borders rather than aggressive drop shadows.

- **Base Layer (Level 0):** Canvas canvas tone `#F8FAFC`.
- **Card & Matrix Cells (Level 1):** Solid `#FFFFFF` elevated via a 1px perimeter outline (`#E2E8F0`). A barely perceptible ambient drop shadow (`0 1px 3px 0 rgba(15, 39, 86, 0.04)`) separates interactive modules from the backdrop.
- **Dropdowns & Popovers (Level 2):** `#FFFFFF` with double border-layering and a soft navy diffusion (`0 10px 25px -5px rgba(15, 39, 86, 0.08), 0 8px 10px -6px rgba(15, 39, 86, 0.04)`).
- **Guest Folio Drawers & Modal Sheets (Level 3):** Right-side sliding panel elevated via a 40% Mediterranean Navy overlay (`rgba(15, 39, 86, 0.40)`) with backdrop blur (`blur(4px)`), focusing concierge attention instantly.

## Shapes
To mirror luxury hospitality stationery, fine woodwork, and brass hardware, structural elements feature disciplined, tailored corners:
- Standard UI containers, cards, table rows, and input surfaces adhere to **0.25rem (4px)** up to **0.375rem (6px)** corner radii, projecting architectural discipline.
- Operational status pills, room badge indicators, and quick-filter chips utilize **9999px (full pill)** shapes. This conscious juxtaposition between crisp rectilinear data grids and organic, softened pills makes room statuses instantly scannable across busy timelines.

## Components

### Buttons
- **Primary:** Deep Mediterranean Navy (`#0F2756`) background with white typography, 0.375rem corner radius, subtle inset top highlight. Hover transitions to `#1E3A8A`.
- **Secondary (Brass Accent):** Warm Amber Brass (`#D97706`) with white text, reserved for booking confirmations, room upgrades, and payment settlement actions.
- **Tertiary / Outline:** Alabaster background, 1px `#CBD5E1` border, `#0F2756` text. Active press reflects `#F1F5F9`.
- **Destructive:** White surface with `#E11D48` border and text; switches to solid `#E11D48` on hover for irreversible actions (e.g., Cancel Reservation, Mark Out of Order).

### Status Badges & Room Pills
Compact, high-contrast, fully rounded capsules (`padding: 2px 10px; font-size: 11px; font-weight: 600`):
- **Clean / Ready:** Emerald text (`#047857`) on light mint tint (`#D1FAE5`), paired with a 6px solid emerald leading dot.
- **Occupied:** Blue text (`#1D4ED8`) on indigo mist (`#DBEAFE`).
- **Turnover / Cleaning:** Amber text (`#B45309`) on honey mist (`#FEF3C7`).
- **Maintenance Alert:** Coral text (`#BE123C`) on light rose (`#FFE4E6`).

### Tape Chart / Timeline Grid
- **Date Header:** Sticky top row featuring dark navy typography on `#F8FAFC` background with subtle vertical dividers (`#E2E8F0`).
- **Room Rows:** Fixed left column listing Room Number (bold, tabular font) and Room Category (e.g., "Azure Suite", "Penthouse Terrace").
- **Reservation Bars:** Solid colored blocks spanning arrival and departure columns with 4px border-radius, displaying Guest Name and Stay Duration in high-contrast white text. Overlapping turnover indicators appear as striped hash-marks on the departure boundary.

### Data Tables & Folios
- Zero-gap layout with 1px border-bottom (`#F1F5F9`) separating rows. 
- Alternating subtle hover states (`#F8FAFC`). 
- Numerical columns (Nights, Rate, Tax, Total) strictly right-aligned using tabular figures.

### Form Inputs & Selectors
- Background `#FFFFFF`, border 1px `#CBD5E1`, height 40px, padding horizontal 12px, border-radius 4px.
- Focus state: Border transitions to `#0F2756` with a 3px outer glow ring of `rgba(15, 39, 86, 0.12)`.
- Input labels rendered in `label-md` uppercase above inputs with 6px spacing.