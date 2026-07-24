# PataNyumba – Design Brainstorming

## Three Stylistic Approaches

### 1. Warm Earth Contemporary
**Very Brief Intro:** A warm, inviting palette of terracotta, sand, and deep forest greens that evokes Kenyan landscapes and the feeling of "home." Soft shadows, organic curves, and natural textures.
**Probability:** 0.07

### 2. Clean Trust Tech
**Very Brief Intro:** A crisp, professional aesthetic with teal primary, generous whitespace, and subtle glassmorphism. Conveys trust and transparency — ideal for a property marketplace where credibility matters.
**Probability:** 0.04

### 3. Bold Editorial Estate
**Very Brief Intro:** A magazine-inspired layout with large serif headlines, dramatic imagery, and a monochrome+emerald accent. Feels premium and curated, like browsing a high-end real estate catalog.
**Probability:** 0.03

---

## Chosen Approach: Clean Trust Tech

### Design Movement
Scandinavian-inspired clean tech with Kenyan warmth — minimal surfaces, generous spacing, and a teal-forward palette that nods to the original PataNyumba brand while feeling distinctly modern.

### Core Principles
1. **Clarity over clutter** — every screen has breathing room; information is layered, not crammed
2. **Trust through polish** — verified badges, smooth transitions, and consistent components build confidence
3. **Mobile-first responsiveness** — every layout works flawlessly from 320px to 1440px+
4. **Accessible by default** — high contrast, keyboard navigable, focus rings preserved

### Color Philosophy
- **Primary:** Deep teal `oklch(0.45 0.09 180)` — trustworthy, calm, distinctively PataNyumba
- **Accent:** Bright teal `oklch(0.65 0.12 175)` — for CTAs and highlights
- **Neutrals:** Warm grays with slight green undertone for backgrounds; pure white cards
- **Dark mode:** Deep charcoal-teal `oklch(0.18 0.02 185)` backgrounds with muted teal accents
- **Status colors:** Amber for pending, emerald for approved, rose for rejected

### Layout Paradigm
- **Public site:** Asymmetric hero with search overlay, staggered property card grids, sidebar-filtered property listing page
- **Dashboards:** Fixed sidebar navigation with collapsible mobile drawer, stat cards in responsive grid, data tables with horizontal scroll on mobile
- **Property detail:** Two-column layout (gallery + info) collapsing to single column on mobile

### Signature Elements
1. **Rounded search pill** — the hero search bar is a distinctive rounded pill that floats over the hero image
2. **Verified badge system** — emerald checkmark badges on verified properties and landlords
3. **WhatsApp green CTAs** — instant communication buttons that feel native to the Kenyan market

### Interaction Philosophy
- Hover states lift cards with subtle translateY + shadow expansion
- Favorite heart animates with a scale bounce on click
- Page transitions are instant (no slow fades) — snappy and responsive
- Toast notifications slide in from the bottom-right with auto-dismiss

### Animation Guidelines
- Card hover: `translateY(-4px)` + shadow expansion, 200ms ease-out
- Button press: `scale(0.97)`, 160ms ease-out
- Modal/drawer: slide + fade, 250ms with `cubic-bezier(0.23, 1, 0.32, 1)`
- Toast: slide from bottom-right, 300ms ease-out
- Stagger property card entrance: 40ms per card
- Respect `prefers-reduced-motion`

### Typography System
- **Display/Headings:** Plus Jakarta Sans (700-800 weight) — modern, geometric, friendly
- **Body:** Inter (400-500 weight) — highly readable, neutral
- **Mono/Numbers:** Tabular nums for prices and stats
- Hierarchy: H1 2.5rem/800, H2 1.75rem/700, H3 1.25rem/600, body 0.95rem/400

### Brand Essence
**Positioning:** PataNyumba is Kenya's most transparent property marketplace — connecting landlords and house hunters with verified listings and instant communication.
**Personality:** Trustworthy, Modern, Warm

### Brand Voice
- Headlines are direct and confident: "Find your next home with confidence"
- CTAs are action-oriented: "Browse Properties", "List Your Space", "Chat on WhatsApp"
- Microcopy is helpful: "We'll notify you when similar properties become available"
- Ban: "Welcome to our website", "Get started today", lorem ipsum

### Wordmark & Logo
A house icon with a location pin integrated — symbolizing "finding home." The wordmark uses Plus Jakarta Sans 800 with the "Pata" in primary teal and "Nyumba" in dark charcoal.

### Signature Brand Color
Deep teal `oklch(0.45 0.09 180)` — unmistakably PataNyumba, evoking trust and calm.
