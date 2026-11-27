---
name: design-system-harbor-hackathon
description: >
  Apply the HARBOR Hackathon design system when building or updating UI.
  Use when creating components, choosing colors or typography,
  or reviewing designs for marketing interfaces.
---

# HARBOR Hackathon — Design System Skill

## When to Use

- Building new UI components for HARBOR Hackathon.
- Reviewing or updating existing component styles.
- Choosing colors, typography, or spacing for marketing pages.
- Checking designs against the extracted token set.

## Context

- **Product:** HARBOR Hackathon — https://www.mec.me/en-US/hackathon/harbor
- **Surface:** marketing
- **Audience:** Business decision-makers and potential customers
- **Character:** Conversion-focused marketing presence with a rich, diverse color palette and single-typeface typography.

## Tokens

### Colors

| Token | Value | Role |
|-------|-------|------|
| --text-dark-color | `#808183` | Text Secondary |
| --text-desc-color | `#A4A4A4` | Text Secondary |
| color-5 | `#787878` | Text Secondary |
| color-3 | `#3469B7` | Accent |
| color-4 | `#0067FF` | Accent |
| color-2 | `#444448` | Border |
| color-1 | `#000000` | Background Dark |
| color-8 | `#DBDBDB` | Text Light |
| color-9 | `#FFFFFF` | Text Light |

### Typography

**Font stack:** Arial

| Level | Size | Usage |
|-------|------|-------|
| text-xs | 7px | Captions, metadata |
| text-sm | 12px | Labels, secondary text |
| text-base | 14px | Body text (default) |
| text-lg | 15px | Subheadings, emphasis |
| text-xl | 17px | Section headings |
| text-2xl | 18px | Section headings |
| text-3xl | 19px | Section headings |
| text-4xl | 21px | Section headings |
| text-9 | 22px | General use |
| text-10 | 25px | General use |
| text-11 | 31px | General use |
| text-12 | 114px | General use |

**Weight scale:** 400 · 500 · 600 · 700 · 800
**Line heights:** 137.02px · 30.9844px · 20.6562px · 23.135px · 21px · 24.7875px · 22.7219px · 10.3281px · 16.5px · 18px · 18.5906px · 27.5417px · 28.9188px · 26.8531px · 19.2792px · 24px · 46.4766px · 19.2px · 22.5px · 17.2135px · 20.4497px

### Spacing

**Base unit:** 4px

`space-1: 1px` · `space-2: 2px` · `space-3: 3px` · `space-4: 4px` · `space-5: 6px` · `space-6: 7px` · `space-7: 8px` · `space-8: 9px` · `space-9: 11px` · `space-10: 12px` · `space-11: 13px` · `space-12: 14px` · `space-13: 15px` · `space-14: 16px` · `space-15: 17px` · `space-16: 20px` · `space-17: 21px` · `space-18: 23px` · `space-19: 24px` · `space-20: 28px` · `space-21: 29px` · `space-22: 33px` · `space-23: 37px` · `space-24: 39px` · `space-25: 41px` · `space-26: 43px` · `space-27: 50px` · `space-28: 51px` · `space-29: 55px` · `space-30: 57px` · `space-31: 58px` · `space-32: 61px` · `space-33: 73px` · `space-34: 80px` · `space-35: 83px` · `space-36: 107px` · `space-37: 127px` · `space-38: 139px` · `space-39: 142px` · `space-40: 171px` · `space-41: 199px` · `space-42: 279px` · `space-43: 359px`

### Shapes

**Border radius:** `radius-sm: 6.88542px` · `radius-md: 10px` · `radius-lg: 17px` · `radius-xl: 22.0333px` · `radius-full: 24.7875px` · `radius-full: 50%`

### Elevation

- **shadow-sm:** `rgba(77, 145, 255, 0.5) 0px 0px 30px 2px inset`

### Motion

- **duration-fast:** `all`
- **duration-fast:** `none`
- **duration-base:** `opacity 0.2s ease-in`
- **duration-base:** `opacity 0.25s`
- **duration-base:** `opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1)`
- **duration-base:** `transform 0.3s`
- **duration-base:** `transform 0.3s ease-in-out`
- **duration-slow:** `0.5s`
- **duration-slow:** `width 0.55s cubic-bezier(0.22, 1, 0.36, 1)`
- **duration-slow:** `0.75s both fadeIn`
- **duration-slow:** `transform 3.8s cubic-bezier(0.2, 0.7, 0.2, 1)`
- **duration-slow:** `transform 3.8s cubic-bezier(0.2, 0.7, 0.2, 1) 0.18s`
- **duration-slow:** `transform 3.8s cubic-bezier(0.2, 0.7, 0.2, 1) 0.36s`
- **duration-slow:** `transform 3.8s cubic-bezier(0.2, 0.7, 0.2, 1) 0.72s`

## Component Inventory

- **Buttons:** 19 detected
- **Lists:** 8 detected
- **Images:** 36 detected

## Constraints

### Always

- Use tokens from the tables above — do not introduce new values.
- Include hover, focus-visible, and disabled states for interactive elements.
- Follow the 4px spacing grid.
- Meet WCAG 2.2 AA contrast minimums.

### Never

- Do not introduce colors outside the extracted palette.
- Do not use arbitrary spacing values — stick to the scale.
- Do not mix border-radius values. Pin to the detected set (6.88542px, 10px, 17px, 22.0333px, 24.7875px, 50%).
- Do not use full-uppercase text for body or paragraph content.
- Do not nest interactive elements (e.g. buttons inside links).
- Do not ship components without defining hover, focus-visible, and disabled states.

## Tone

Concise, confident, implementation-focused. Avoid filler preambles.

## Authoring Workflow

When creating or documenting a component for this system:

1. State intent — one sentence on purpose.
2. Map tokens — list every token the component uses.
3. Define anatomy — named parts with token assignments.
4. Specify states — default, hover, focus-visible, active, disabled, loading, error, empty.
5. Describe interactions — keyboard, pointer, touch, edge cases.
6. Add a11y criteria — testable pass/fail checks.
7. List anti-patterns — concrete misuse examples.
8. Close with the Definition of Done checklist.

## Output Structure

Component guidelines must contain, in order:

1. Overview (purpose, when to use, when not to use)
2. Tokens and foundations
3. Anatomy, variants, responsive behavior
4. States and interactions
5. Accessibility (ARIA, contrast, focus, screen reader)
6. Content guidelines (copy rules, tone)
7. Anti-patterns with reasoning

## Component Requirements

- Reference only tokens from the tables above.
- Define all states: default, hover, focus-visible, active, disabled, loading, error.
- Handle edge cases: empty, overflow, truncation, max content.
- Include keyboard navigation behavior.
- Document ARIA roles and labels.

## Definition of Done

- Default state renders (smoke test).
- All states visually verified.
- Zero hardcoded visual values — tokens only.
- Keyboard navigation works without pointer.
- No critical a11y violations.
- Tested at min and max breakpoint.
- At least one anti-pattern documented.
- Purpose, usage, and limitations documented.
