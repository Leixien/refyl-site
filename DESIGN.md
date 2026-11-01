---
name: Refyl
description: The carriageway seen from above; asphalt ground, road paint, lanes that route you to the cheapest fuel.
colors:
  asphalt: "#4E5154"
  asphalt-deep: "#313437"
  paint: "#EEEDE6"
  paint-muted: "#CFCEC6"
  works-yellow: "#F2C230"
  on-yellow: "#23221E"
  cheapest-green: "#30D158"
  on-green: "#08130B"
  stale-orange: "#FFBE5C"
typography:
  display:
    fontFamily: "Road (Big Shoulders Display), Arial Narrow, sans-serif"
    fontSize: "clamp(64px, 8.6vw, 128px)"
    fontWeight: 900
    lineHeight: 0.82
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Road (Big Shoulders Display), Arial Narrow, sans-serif"
    fontSize: "clamp(54px, 7vw, 96px)"
    fontWeight: 900
    lineHeight: 0.82
    letterSpacing: "0.01em"
  title:
    fontFamily: "Road (Big Shoulders Display), Arial Narrow, sans-serif"
    fontSize: "40px"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.02em"
  label:
    fontFamily: "Road (Big Shoulders Display), Arial Narrow, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    letterSpacing: "0.03em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  body-small:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  none: "0px"
  icon: "8px"
spacing:
  line: "10px"
  gutter: "clamp(16px, 4vw, 56px)"
  section: "clamp(48px, 8vw, 96px)"
components:
  button-primary:
    backgroundColor: "{colors.cheapest-green}"
    textColor: "{colors.on-green}"
    rounded: "{rounded.none}"
    padding: "15px 20px"
  button-paint:
    backgroundColor: "{colors.paint}"
    textColor: "{colors.on-yellow}"
    rounded: "{rounded.none}"
    padding: "15px 20px"
  button-paint-hover:
    backgroundColor: "{colors.works-yellow}"
    textColor: "{colors.on-yellow}"
  lane-selected:
    backgroundColor: "{colors.works-yellow}"
    textColor: "{colors.on-yellow}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 6px 12px"
  city-field:
    backgroundColor: "transparent"
    textColor: "{colors.paint}"
    rounded: "{rounded.none}"
    height: "52px"
---

# Design System: Refyl

## Overview

**Creative North Star: "The Carriageway From Above"**

The page is a stretch of Italian road seen from overhead. The ground is real asphalt (a procedural aggregate tile, `assets/asphalt.webp`, over a mid-grey fill), and everything placed on it is road marking: thermoplastic white paint for text and lines, works-zone yellow for whatever is selected, Refyl green only for the cheapest price. Structure comes from markings rather than boxes. Solid edge lines separate the kerb (header), each stretch of road (section) and the footer. A dashed centre line splits the two lanes of the first viewport. Dashed lane dividers and painted arrows turn into the controls.

Painted words are the display type: a condensed, heavy face, stretched vertically to 1.65x and masked with a turbulence "wear" texture so the paint reads as worn. Body copy uses the platform's text face at a calm reading size, so content stays plain and legible. Stale data is drawn as faded paint, not with an alarm treatment.

The world is dark-only (`color-scheme: dark`), flat, square-cornered and uses no drop shadows.

**Key Characteristics:**
- Asphalt ground with aggregate grain; paint white is the dominant foreground.
- Vertically stretched, worn, uppercase road lettering for display.
- Solid edge lines and dashed centre/lane lines are the dividers.
- Yellow means selected or "you"; green means cheapest; faded paint means stale.
- Square ends everywhere; dots are the only round forms.

## Colors

Asphalt greys, road-paint off-white, and two signal colours that each have exactly one meaning.

### Primary
- **Thermoplastic White** (paint): all body text, headings, edge lines, centre lines, solid borders, the default button fill. This is the dominant mark on the ground.

### Secondary
- **Works-Zone Yellow** (works-yellow): selection and position only. Used for the checked fuel lane, focus rings, hover fills, link underlines, `::selection`, the "you are here" dot on the map, the national-median tick on the price rail, the strike-through on "what it doesn't do", the disclosure chevron, and the "coming soon" painted word.
- **Yellow Ink** (on-yellow): text on yellow and on paint-white fills.

### Tertiary
- **Cheapest Green** (cheapest-green): reserved for "cheapest". It marks the best price painted large, the cheapest 10% of map dots, the selected station marker, the rail marker for the selected price, and the primary action ("Vicino a me", "Indicazioni"). It is the app's dark-mode semantic green, a brand commitment.
- **Green Ink** (on-green): text on green fills.
- **Stale Orange** (stale-orange): the app's dark-mode stale orange (#FF9F0A), lightened so small text reaches 4.86:1 on asphalt. It is used for stale tags and error status text.

### Neutral
- **Asphalt** (asphalt): the page ground under the aggregate tile.
- **Deep Asphalt** (asphalt-deep): the scrollbar track and the outline stroke (at 85%) behind lettering painted on the map canvas. The map lane darkens the asphalt with a `rgba(28,30,32,.4)` scrim.
- **Worn Paint** (paint-muted): secondary text, legends, the dashed lane dividers and result separators, and stale prices in the results list.
- **Paint alphas**: canvas dots use paint at 13% (no price), 30% (stale), and 78% (current). Hover rows use paint at 7%. Soft dashed rules use 28% to 35%.

### Named Rules
**The One Meaning Rule.** Yellow means selected or "you". Green means cheapest. Neither is used as decoration or for brand emphasis.

**The Worn Paint Rule.** A stale price fades: dimmer paint, the wear mask, or a lower dot alpha. It does not get a red alert treatment.

## Typography

**Display Font:** Road (Big Shoulders Display 800/900, self-hosted woff2, OFL), falling back to Arial Narrow
**Body Font:** System text stack (-apple-system / SF Pro Text / Segoe UI / Roboto / Arial)

**Character:** Tall, condensed lettering painted on the road surface, paired with a neutral platform text face that carries all reading.

### Hierarchy
- **Display** (900, clamp 64-128px, line-height 0.82, stretched 1.65x vertically, uppercase, wear-masked): the single hero word.
- **Headline** (900, clamp 54-96px, same treatment): one painted word per section ("In auto", "Dati veri"). The best price uses this treatment at clamp 76-108px in green.
- **Title** (900, 32-40px, 0.02em, uppercase, not stretched): sub-heads in sections and on read pages. The brand wordmark is 30px.
- **Label** (800, 22px, 0.03em, uppercase): fuel-lane names. List prices use Road 900 at 34px with tabular figures.
- **Body** (400, 17px/1.55; lead 18-20px): copy capped at 32-38em, read pages at 680px. Buttons use the body face at 800 weight, 19px.
- **Small** (14-15px, paint-muted): status lines, legends, meta, footer.

### Named Rules
**The Painted Word Rule.** Road lettering is for short words only: a heading, a price, a lane name. It is uppercase, and stretched and worn when it is display size. Sentences are never set in it.

**The Same Face On Canvas Rule.** Text painted on the map uses the Road face at 900, scaled 1.6x vertically, with a deep-asphalt outline stroke, so canvas lettering matches the DOM lettering.

## Layout

The first viewport is a two-lane road: a three-column grid of left lane (1fr), centre line (10px), and right lane (1.12fr), at `min(100svh - 80px, 940px)` tall. The left lane stacks headline, explanation, fuel lanes, action row, results and price rail; the rail is pinned to the lane's foot. The right lane is the full-bleed canvas map. Below the fold, each section is a stretch of road that opens with a 10px solid edge line and uses `clamp(48px, 8vw, 96px)` vertical padding with the side gutter. "Cosa fa / Cosa non fa" is a two-column grid split by a solid painted line.

Horizontal gutter: `clamp(16px, 4vw, 56px)`. At 900px and below, the lanes stack, the centre line turns horizontal (48px dashes on 88px), the map becomes a block 112vw tall (max 620px), and the split columns collapse. At 480px and below, lane labels shrink to 17px and arrows to 38px.

## Elevation & Depth

The system is flat. There are no box-shadows. Depth comes from the ground: the aggregate texture, a darker scrim on the map lane, and the wear mask that lets asphalt show through the paint. The only lift is the button hover translate (-2px), and the only "shadow" is the deep-asphalt outline stroke behind lettering painted on the canvas.

### Named Rules
**The Paint Has No Height Rule.** Markings sit in the surface. Do not add drop shadows, glows or raised cards.

## Shapes

Every rectangle has square corners (0px): buttons, fields, lanes, frames and screenshots. Line weights form a ladder: 10px for edge and centre lines, 4px for solid frames and lane dashes, 3px for field borders, nav underlines and focus rings, 2px for dashed list separators. Circles appear only as data points: map dots, the "you" marker, legend swatches. The rounded 8px corner exists only on the app icon. Arrows are the painted lane-arrow glyph drawn in inline SVG.

## Components

### Buttons
- **Shape:** square (0px), no border, body face at 800/19px, 15px 20px padding, with an inline SVG icon at 20px when needed.
- **Primary (green):** the green fill with green ink, for the act-on-cheapest actions only. Its hover keeps the green and lifts 2px.
- **Paint:** the paint-white fill with yellow ink. On hover the fill turns yellow and lifts 2px. Active returns to 0. Busy is 70% opacity with a progress cursor.
- **Focus:** a 3px yellow outline at 3px offset (global).

### Fuel Lanes (signature)
These are radio inputs drawn as painted lanes. Four equal columns are separated by 4px dashed worn-paint lines. Each lane has an inline SVG straight-ahead arrow (18x48) above a Road 800 uppercase label. The checked lane fills yellow with yellow ink. On hover the arrow nudges up 4px (0.35s, expo-out). Keyboard focus draws the yellow ring on the lane.

### Inputs / Fields
- **City field:** a 3px solid paint border, 0px corners, 52px minimum height, transparent fill, 600/17px text and a yellow caret. On focus-within the border turns yellow. The attached submit button is a paint-white fill with asphalt text that turns yellow on hover.

### Results List
A 4px solid paint rule sits on top, with 2px dashed worn-paint separators between rows. Each row is a full-width button: name (650/16px) and meta (14px muted) on the left, and the price in Road 900 34px tabular on the right. Hover and current rows get a 7% paint wash. Stale rows draw the price in worn paint with the wear mask.

### Best Price
A painted green price with a smaller unit sits beside the station name, address, age and delta against the national median. A green "Indicazioni" button follows.

### Price Rail (signature)
A 54px canvas. A paint edge line runs along the bottom, every station is stacked into 2px bins with log height at 55% paint, a yellow tick marks the national median, and a green bar marks the selected price. Min, median and max values sit below in tabular figures.

### Navigation
The header acts as the kerb: brand mark (34px icon plus Road 30px wordmark) on the left, and 600/15px links on the right with no underline. The current page gets a 3px yellow underline. A 10px solid paint line closes the header. Footer links are worn paint.

### Read Pages
Prose is capped at 680px under a painted section word. h2 is the Road title at 32px. The contact block is a 4px solid paint frame. FAQ disclosures are separated by dashed rules, with a yellow chevron that rotates from -45deg to 45deg when open.

## Motion

Motion on the home page comes from driving, and each behaviour has one job. They run one after another, never two at once on the same surface.

- **The drive.** The dashes of the centre line slide with scroll at 1.6x the scroll speed, set as `--drive` on `.centre` only.
- **The driver's view.** The road section tilts away with `perspective(1400px) rotateX(up to 32deg)`, pivoting on its bottom edge, and fades to 65% opacity, so the painted word reads as it does from the driver's seat.
  - Desktop without a search: the tilt grows from the first pixel of scroll.
  - On phones, and on desktop once a search has results: the tilt starts only when the road's bottom edge is above half the viewport. It never tilts while the map or results are in use.
- **The paint machine.** When the prices arrive, a paint-white stripe with a works-yellow block sweeps Italy north to south in 1.9s (ease-in-out). It repaints each dot from the pre-price paint to its price colour, and paints the running count in yellow Road beside the block. The caption line under the map is `aria-busy` during the sweep and announces once at the end. Searches wait for the machine to finish.
- **The flight.** A search animates the map camera over 1.1s with exponential ease-out (zoom in log space). The canvas banks up to 40deg mid-flight (`rotateX`, sine envelope) and lands flat. It aims at the part of the canvas that is on screen. On desktop the map is sticky beside the results.
- **The parking.** In the "In auto" section the app's map screenshot starts at full stage height in the free area right of the copy. It reverses into its bay while the other four bays slide up in turn, all driven by scroll on a 240vh sticky stage. Desktop only (min-width 901px).
- **State transitions** (lanes, buttons, details): `cubic-bezier(0.16, 1, 0.3, 1)` over 0.2-0.35s.
- **Reduced motion.** No drive, no tilt, no sweep (prices appear at once), no bank (the camera jumps), and no park stage (the strip sits in normal flow).

## Do's and Don'ts

### Do:
- **Do** separate regions with painted lines (10px solid edge, dashed centre, 4px or 2px dashed lane rules) instead of cards or background panels.
- **Do** keep yellow for selection or position and green for cheapest, everywhere including canvas.
- **Do** show staleness as worn or faded paint (wear mask, lower alpha).
- **Do** paint display words in Road 900, uppercase, stretched 1.65x, with the wear mask.
- **Do** keep every rectangle square-cornered and every surface flat.
- **Do** use `cubic-bezier(0.16, 1, 0.3, 1)` for state transitions (0.2-0.35s) and honour reduced motion.

### Don't:
- **Don't** add drop shadows, glows or raised cards.
- **Don't** round button, field or frame corners.
- **Don't** use green for anything that is not cheapest, or yellow as a generic accent.
- **Don't** set sentences or paragraphs in the Road face.
- **Don't** load third-party fonts, tiles or scripts. The face is self-hosted.
