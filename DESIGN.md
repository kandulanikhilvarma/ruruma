---
name: Ruruma
description: A calm, practical website for AI engineering.
colors:
  cream: "#faf9ed"
  ink: "#20251f"
  green: "#144d43"
  green-dark: "#103f37"
  lavender: "#e1d5f5"
  mint: "#e2eadb"
  muted: "#566052"
  line: "#c9cdbf"
  error: "#9b2923"
  focus: "#775ba4"
typography:
  display:
    fontFamily: "'EB Garamond', Georgia, serif"
    fontSize: "clamp(70px, 8vw, 106px)"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'EB Garamond', Georgia, serif"
    fontSize: "clamp(42px, 5.3vw, 70px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "'Figtree', Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  body:
    fontFamily: "'Figtree', Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Figtree', Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.55
  button:
    fontFamily: "'Figtree', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.35
rounded:
  field: "5px"
  choice: "6px"
  button: "8px"
  art: "14px"
  panel: "16px"
  section: "70px 70px 0 0"
spacing:
  "8": "8px"
  "12": "12px"
  "18": "18px"
  "24": "24px"
  "30": "30px"
  "40": "40px"
  "48": "48px"
components:
  button-primary:
    backgroundColor: "{colors.lavender}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "15px 25px"
    height: "56px"
  button-dark:
    backgroundColor: "{colors.green}"
    textColor: "{colors.cream}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "15px 25px"
    height: "56px"
  button-dark-hover:
    backgroundColor: "{colors.green-dark}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "15px 25px"
    height: "56px"
  goal-choice:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.choice}"
    padding: "12px 16px"
    height: "48px"
  goal-choice-active:
    backgroundColor: "{colors.green}"
    textColor: "{colors.cream}"
  text-field:
    backgroundColor: "#fffef5"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "11px 12px"
    height: "47px"
  result-panel:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "32px 34px"
---

# Design System: Ruruma

## Overview

**Creative North Star: "The Ruruma Workroom"**

Ruruma puts practical work in view. Large serif statements introduce the offer. Clear interface text explains the choices and next action.

Cream gives the page a quiet base. Forest green holds workflow diagrams and delivery steps. Lavender marks actions and the brief section. Broad curves connect these fields to the supplied rosette logo.

**Key Characteristics:**

- Large serif headlines with selective italic emphasis.
- Flat color fields with generous space.
- Outlined controls and clear selected states.
- Work diagrams and paper illustrations with useful detail.

The record follows the current HTML and CSS. The supplied screenshots precede the final source changes to metadata placement. They do not define that placement.

## Colors

The palette pairs warm paper with deep green and soft lavender.

### Primary

- **Forest green:** Use `green` for major dark fields, selected choices, and dark actions.
- **Deep forest:** Use `green-dark` for the footer and the dark button hover state.

### Secondary

- **Soft lavender:** Use `lavender` for the main action, review tile, text selection, and brief section.

### Neutral

- **Warm cream:** Use `cream` for the page base and panels inside colored sections.
- **Near-black ink:** Use `ink` for primary text and control outlines.
- **Pale mint:** Use `mint` for the solutions field.
- **Muted green-gray:** Use `muted` for secondary text on light surfaces.
- **Quiet line:** Use `line` for list rules, panel divisions, and disclosure borders.

### State colors

- **Error red:** Use `error` for invalid fields and error text.
- **Focus violet:** Use `focus` for the visible keyboard outline.

**The Field Rule.** Use broad color fields to divide major sections. Keep controls distinct from their surrounding field.

## Typography

**Display Font:** EB Garamond, with Georgia and serif fallbacks.

**Body Font:** Figtree, with Arial and sans-serif fallbacks.

EB Garamond gives the page a light, editorial voice. Figtree keeps the tools and detailed text clear. Both families come from local font files.

### Hierarchy

- **Display:** The large hero statement uses the display token. Italic text stays within the same family and weight.

- **Headline:** Section titles use the headline token, with local size adjustments for their space.

- **Title:** The solution result uses the sans-serif title token. Project names use the serif family.

- **Body:** The body token sets the default text. Detailed content uses smaller sizes where the source defines them.

- **Label:** Field labels use the label token. Labels use sentence case.

- **Button:** The button token supplies the default action text.

Paragraphs have a global maximum width of 70 characters. Most section copy uses narrower limits. The hero and section titles use balanced text wraps.

**The Two Voices Rule.** Use the serif family for major statements and project names. Use the sans-serif family for controls and detailed explanations.

## Layout

The main content container has a maximum width of 1200 pixels. Its default width leaves 56 pixels at each side.
The header and workflow field have a maximum width of 1250 pixels. Their default side space is 40 pixels.

Desktop sections combine asymmetric columns with wide gaps. The solutions and brief sections use a narrow control column beside a wider result or form column.
Project cards use three columns. Delivery steps use four columns. Most major sections use vertical space between 90 and 126 pixels.

The repeated space values form a practical set, not a fixed arithmetic scale. Use small gaps within controls. Use larger gaps between content groups.

Responsive changes follow three breakpoints:

- At 1100 pixels, container margins and column gaps decrease.
- At 800 pixels, navigation becomes a menu. The explorer and brief sections become single columns. Delivery steps use two columns.
- At 520 pixels, the workflow becomes vertical. Project cards, form rows, and founder content become single columns.

At the smallest breakpoint, the content container leaves 20 pixels at each side. Primary hero actions fill their available width up to 320 pixels.
Form text increases to 16 pixels on small screens. Interactive targets keep at least 44 pixels of height.

## Elevation & Depth

The interface stays flat. Borders, color changes, and empty space separate regions. Paper illustrations use a soft shadow to show a sheet above its colored background.
The selected industry marker uses a small ring. The ring shows state; it does not lift the whole row.

### Shadow Vocabulary

- **Paper sheet:** `7px 14px 22px #2933271b`. Use this shadow only on the illustrated work sheets.
- **Selected marker:** `0 0 0 4px #cad8c4`. Use this ring around the active industry marker.

**The Paper Rule.** Keep interface panels flat. Reserve the sheet shadow for the paper illustrations that explain founder work.

## Shapes

Controls have small rounded corners. Panels use broader corners. Major colored sections use large upper curves and square lower corners.
The workflow field uses larger upper corners than lower corners. The founder visual uses an arch above a nearly square base.

Thin borders outline navigation, actions, and fields. Simple SVG line icons use rounded line ends. The supplied rosette remains the brand mark.

## Components

### Buttons

Buttons use a thin ink border, a small corner radius, and a clear text label. The default action uses lavender with ink text.
The dark variant uses green with cream text. The outline variant uses a transparent fill.

Hover changes the fill and moves the button upward by 2 pixels. Arrow icons move right by 2 pixels. Focus adds a violet outline.
State transitions use 0.18 seconds with `ease`. Disabled buttons reduce opacity and use the wait cursor.

### Chips

Goal choices wrap into a row. A selected choice uses green with cream text. Unselected choices use a transparent fill and a muted border.
The controls expose their selected state with `aria-pressed`. Mobile choices keep the row compact and keep a 44-pixel minimum target.

### Cards / Containers

The result panel and brief tool use cream surfaces with broad corners. They have no drop shadow.
Result details use a thin internal divider. The result panel loses its desktop minimum height after the layout becomes one column.

Project cards have a colored illustration region above the title, description, and source action. Project metadata follows the title.

### Inputs / Fields

Fields use a pale cream fill, a muted border, and a small radius. Labels stay above each field.
Focus adds the violet outline with a smaller offset than button focus. Errors change the field border and place red text below the field.
The error summary uses a pale red field with an error border. The summary includes links to affected fields.

### Navigation

Desktop navigation sits inside an outlined cream container. The brand is left of the links and action.
At the menu breakpoint, links form a vertical list below the brand row. Without JavaScript, those links remain visible.
Ordinary links gain an underline on hover. The action keeps its button treatment.

### Disclosures

Service and FAQ lists use horizontal rules. Each summary has a text label and a plus icon.
An open disclosure rotates the plus icon by 45 degrees. The answer sits directly below its summary.

### Workflow diagram

The workflow uses three clear steps joined by dashed connectors. Green holds the diagram. Cream text and pale tiles separate the steps.

The central rosette rotates once every 45 seconds. On small screens, the connectors turn downward and the steps form a vertical list.
Reduced-motion preferences stop the rotation and all other transitions. They also disable smooth scroll.

## Do's and Don'ts

### Do:

- **Do** use the supplied rosette for the brand mark.
- **Do** pair serif statements with sans-serif controls and explanations.
- **Do** separate major sections with the established color fields and broad upper curves.
- **Do** keep selected choices, field errors, and keyboard focus visible.
- **Do** preserve the vertical workflow and single-column forms on small screens.
- **Do** respect reduced-motion preferences.

### Do not:

- **Do not** replace the supplied mark with a text glyph or a new icon.
- **Do not** apply the paper illustration shadow to ordinary interface panels.
- **Do not** turn metadata into decorative labels above section or project titles.
- **Do not** treat the small text inside paper illustrations as a general text-size scale.
- **Do not** add the unused lilac and blue custom properties to the active palette without a visible use.

Not canonized: tiny paper text is illustration detail. Unused color declarations and metadata positions in older screenshots are not reusable system rules.
