---
name: Clinical Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#ab0b1c'
  on-tertiary: '#ffffff'
  tertiary-container: '#cf2c30'
  on-tertiary-container: '#ffecea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  header-height: 56px
  footer-height: 48px
  gutter: 12px
  edge-margin: 20px
  row-height: 32px
---

## Brand & Style
The design system is engineered for high-stakes medical data entry environments where speed, accuracy, and reduced cognitive load are paramount. The brand personality is clinical, reliable, and systematic, prioritizing functional utility over decorative flair. 

The aesthetic blends **Modern Corporate** efficiency with a **High-Density Utility** model. It draws inspiration from the structured reliability of legacy desktop software (WinForms/WPF) while applying modern web refinements: subtle depth, soft-radius geometry, and a rigorous typographic grid. The goal is to create a professional workspace that feels robust enough for institutional use yet modern enough to prevent operator fatigue during long data-entry shifts.

## Colors
The color palette is strictly functional, utilizing a high-contrast foundation to differentiate between navigation, action, and status.

- **Primary (Medical Blue):** Reserved for primary action buttons, active states, and focus indicators.
- **Success (Emerald Green):** Specifically designated for positive completions and data exports (Excel).
- **Danger (Rose Red):** Used sparingly for destructive actions and critical validation errors.
- **Surface & Backgrounds:** A tiered system of light grays (#F8FAFC) creates subtle separation between the application frame and the data entry canvas.
- **Borders:** A consistent, low-contrast gray (#E2E8F0) provides structure without visual clutter, essential for high-density layouts.

## Typography
The system uses **Inter** for its exceptional legibility at small sizes and high x-height, which is critical for dense data tables and forms. 

- **Hierarchy:** Section titles use `headline-sm` to anchor the eye. 
- **Data Entry:** The majority of text resides in `body-sm` (13px) to maximize the information visible on screen without sacrificing readability.
- **Labels:** Field labels use `label-md` with a slight tracking increase and bold weight to ensure they are distinguishable from the user's input.
- **Monospace:** For specific medical IDs or numerical codes, a monospace font (JetBrains Mono) may be used to ensure character alignment.

## Layout & Spacing
The layout employs a **Fixed High-Density Grid**. This model mimics desktop productivity suites to ensure that key controls are always accessible.

- **Fixed Zones:** Headers (Global Nav) and Footers (Action Bars) are pinned. The central workspace uses a vertical scroll for long forms.
- **Density:** We utilize a tight 4px baseline shift. Default row heights for data tables and list items are set to 32px to allow for a high volume of rows above the fold.
- **Responsive Reflow:** On tablets, the side-by-side multi-column forms reflow into a single column. Desktop views utilize a 12-column grid where inputs typically span 3 or 4 columns to keep forms compact.

## Elevation & Depth
Elevation is used functionally rather than decoratively to indicate stack order and interactive priority.

- **Level 0 (Base):** The main background (#F8FAFC).
- **Level 1 (Card/Surface):** White (#FFFFFF) surfaces with a 1px solid border (#E2E8F0). No shadow is used here to maintain a clean, flat look for data fields.
- **Level 2 (Floating/Overlay):** Modals and dropdown menus use a subtle ambient shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`.
- **Focus State:** Interactive elements receive a 2px blue ring with 20% opacity to highlight the active entry point during keyboard navigation.

## Shapes
The design system adopts a **Soft** shape language. 

- **Standard Elements:** Buttons, input fields, and checkboxes use a `0.25rem` (4px) corner radius. This provides a modern feel without the "child-like" appearance of fully rounded corners, preserving the professional tone.
- **Large Containers:** Modals and main content cards use `0.5rem` (8px) for a slightly softer distinction against the application frame.

## Components
Consistent component behavior ensures speed of entry.

- **Buttons:** 
  - *Primary:* Solid Medical Blue, white text.
  - *Secondary:* White background, gray border, blue text.
  - *Export:* Solid Emerald Green (Success).
- **Input Fields:** Use a 32px height. Background is white, border is #E2E8F0. On focus, the border changes to Primary Blue. Labels are positioned above the field for maximum vertical scanning.
- **Data Tables:** Zebra-striping is prohibited. Instead, use thin 1px horizontal dividers. The header row should have a light gray background (#F1F5F9) to lock the context while scrolling.
- **Checkboxes & Radios:** Compact 16px versions to fit within dense list rows.
- **Status Chips:** Small, low-saturation backgrounds with high-saturation text (e.g., a light green pill with dark green text) to indicate patient status or data validity.
- **Sticky Footer:** A persistent "Save / Export / Reset" bar at the bottom of the viewport to ensure primary actions are never scrolled out of view.