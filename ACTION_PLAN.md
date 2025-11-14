# Neretva Valley Site - Prioritized Action Plan

**Goal:** Fix all 43 identified issues in order of impact and effort.

---

## 🎯 Priority Matrix

| Priority | Count | Time Estimate |
|----------|-------|---------------|
| 🔴 Critical (P0) | 6 issues | 2-3 hours |
| 🟠 High (P1) | 10 issues | 4-6 hours |
| 🟡 Medium (P2) | 12 issues | 6-8 hours |
| 🟢 Low (P3) | 15 issues | 8-10 hours |
| **TOTAL** | **43** | **20-27 hours** |

---

## Phase 1: Critical Fixes (2-3 hours)

### Sprint 1A: SEO Essentials (1 hour)

#### 1. Add Page Titles (15 min)
**File:** `src/app.html`
```html
<title>NeretvaLive - Neretva Valley Weather Forecast</title>
```

**File:** `src/routes/+page.svelte` - Add to top:
```svelte
<svelte:head>
  <title>{$t('main.header.title')} - {$t('main.header.subtitle')}</title>
</svelte:head>
```

**File:** `src/routes/privacy/+page.svelte` - Add:
```svelte
<svelte:head>
  <title>{$t('privacy.title')} - {$t('main.header.title')}</title>
</svelte:head>
```

#### 2. Add Meta Descriptions (15 min)
Add to each page's `<svelte:head>`:
```svelte
<meta name="description" content="{$t('meta.description')}" />
```

Add to locale files:
```json
{
  "meta.description": "Live weather forecasts for Neretva Valley, Croatia. Real-time temperature, precipitation, and wind data for Ploče, Opuzen, and surrounding areas."
}
```

#### 3. Fix robots.txt (2 min)
**File:** `static/robots.txt`
```txt
User-agent: *
Disallow:

Sitemap: https://neretvalive.eu/sitemap.xml
```

#### 4. Remove Broken AdSense Script (2 min)
**File:** `src/routes/+layout.svelte` line 34-36

**Option A:** Remove entirely if not using AdSense yet
**Option B:** Replace with real AdSense script

```svelte
<!-- Remove this: -->
<svelte:head>
  <script async src="#" crossorigin="anonymous"></script>
</svelte:head>
```

#### 5. Fix Duplicate H1 Elements (15 min)
**File:** `src/routes/+layout.svelte` lines 45-53

**Current:**
```svelte
<h1 class="text-3xl font-bold">
  <a href="/">{$t('main.header.title').split(' ')[0]}</a>
</h1>
<h1 class="text-3xl font-bold text-[var(--color-on-30)]">
  {$t('main.header.title').split(' ')[1]}
  {$t('main.header.title').split(' ')[2]}
</h1>
```

**Fix:**
```svelte
<h1 class="text-3xl font-bold">
  <a href="/" class="underline decoration-[var(--color-10)] hover:text-[var(--color-10)]">
    {$t('main.header.title').split(' ')[0]}
  </a>
  <span class="text-[var(--color-on-30)]">
    {$t('main.header.title').split(' ')[1]}
    {$t('main.header.title').split(' ')[2]}
  </span>
</h1>
```

#### 6. Create Basic XML Sitemap (15 min)
**File:** `static/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://neretvalive.eu/</loc>
    <lastmod>2025-11-13</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://neretvalive.eu/privacy</loc>
    <lastmod>2025-09-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

---

## Phase 2: High Priority Fixes (4-6 hours)

### Sprint 2A: Accessibility Fixes (2 hours)

#### 7. Add ARIA Labels to Language Buttons (5 min)
**File:** `src/routes/+layout.svelte` lines 64-71
```svelte
<button
  aria-label="Switch to Croatian"
  lang="hr"
  on:click={() => setLang('hr')}
>HR</button>
<button
  aria-label="Switch to English"
  lang="en"
  on:click={() => setLang('en')}
>EN</button>
```

#### 8. Add ARIA Labels to Weather Icons (30 min)
**File:** `src/routes/+page.svelte`

**Example for forecast title:**
```svelte
<h2 class="flex items-center text-xl font-semibold">
  <span aria-hidden="true">🌤️</span>
  <span class="sr-only">Weather forecast:</span>
  {$t('main.forecast.title')}
</h2>
```

**Add to `app.css`:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

#### 9. Add Skip Navigation Link (15 min)
**File:** `src/routes/+layout.svelte` - Add at very top of body:
```svelte
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<div class="flex min-h-screen flex-col">
  <header>...</header>
  
  <main id="main-content" class="container mx-auto flex gap-4 p-4">
    ...
  </main>
</div>
```

**Add to `app.css`:**
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-10);
  color: var(--color-on-10);
  padding: 8px;
  z-index: 100;
  text-decoration: none;
}

.skip-link:focus {
  top: 0;
}
```

#### 10. Fix Privacy Page Navigation (10 min)
**File:** `src/routes/privacy/+page.svelte` - Add at top:
```svelte
<nav class="mb-4">
  <a href="/" class="inline-flex items-center text-blue-600 hover:underline">
    ← {$t('nav.back_home')}
  </a>
</nav>
```

Add to locales:
```json
{
  "nav.back_home": "Back to Home"
}
```

### Sprint 2B: Code Cleanup (2 hours)

#### 11. Remove Dead Code from WeatherMap (15 min)
**File:** `src/lib/components/WeatherMap.svelte`

**Delete lines 98-116:**
```javascript
// DELETE THIS ENTIRE FUNCTION
function getWeatherColor(weather: WeatherObservation['weather']): string {
  /* ... */
  return 'transparent';
}
```

**Delete all references to `getWeatherColor` (line 128)**

**Delete lines 180-199:**
```javascript
// DELETE commented tile layers
//L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//  ...
//}).addTo(map);
```

#### 12. Remove Console.log Statements (10 min)
**Files to clean:**
- `src/lib/components/WeatherMap.svelte` (lines 35, 69, 204)
- `src/routes/+page.svelte` (line 171)

**Replace with proper error handling or remove entirely.**

#### 13. Fix Placeholder Email (2 min)
**File:** `src/routes/+layout.svelte` line 149
```svelte
<a href="mailto:info@neretvalive.eu" class="mx-2 text-[var(--color-10)] hover:underline">
  {$t('footer.contact')}
</a>
```

#### 14. Remove/Fix AdSense Test IDs (5 min)
**File:** `src/routes/+layout.svelte`

**Option A:** Remove entire ad sections if not ready
**Option B:** Replace with real AdSense IDs

### Sprint 2C: Navigation Structure (1 hour)

#### 15. Fix Duplicate Headers (45 min)
**Problem:** `+layout.svelte` has header, `+page.svelte` has another header

**Solution:** Remove header from `+page.svelte` (lines 34-45), rely on layout header

**File:** `src/routes/+page.svelte`
```svelte
<!-- DELETE this entire section: -->
<header class="border-b bg-white shadow-sm">
  <div class="mx-auto max-w-7xl px-4 py-6">
    <div class="flex items-center justify-between">
      <div class="flex-1 justify-center text-center">
        <h1 class="text-3xl font-bold text-gray-900">{$t('main.header.title')}</h1>
        <p class="mt-2 text-center text-gray-600">
          {$t('main.header.subtitle')}
        </p>
      </div>
    </div>
  </div>
</header>
```

**Update layout header to include subtitle**

---

## Phase 3: Medium Priority (6-8 hours)

### Sprint 3A: Performance Optimizations (2 hours)

#### 16. Move Leaflet CSS to app.html (10 min)
**File:** `src/app.html` - Add to `<head>`:
```html
<link 
  rel="stylesheet" 
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin=""
/>
```

**File:** `src/lib/components/WeatherMap.svelte` - Remove lines 228-241

#### 17. Fix Overly Broad CSS Transitions (15 min)
**File:** `src/routes/+page.svelte` lines 209-213

**Replace:**
```css
:global(*) {
  transition-property: color, background-color, border-color, opacity, transform;
  transition-duration: 200ms;
}
```

**With:**
```css
:global(button, a, .transition) {
  transition-property: color, background-color, border-color, opacity, transform;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
}
```

#### 18. Add Image/Iframe Dimensions (10 min)
**File:** `src/routes/+page.svelte`

**iframe (line 146):**
```svelte
<iframe
  src="https://www.yr.no/en/content/2-3194528/card.html"
  class="h-96 w-full rounded-lg border-0"
  width="600"
  height="400"
  title="YR Weather Card"
  loading="lazy"
></iframe>
```

**img (line 165):**
```svelte
<img
  src="https://www.yr.no/en/content/2-3194528/meteogram.svg"
  alt="Weather Meteogram for Neretva Valley"
  width="800"
  height="450"
  class="absolute inset-0 h-96 w-full rounded-lg"
  loading="lazy"
/>
```

### Sprint 3B: Enhanced SEO (3 hours)

#### 19. Add Open Graph Tags (30 min)
**File:** `src/app.html` or page-specific `<svelte:head>`
```html
<meta property="og:title" content="NeretvaLive - Neretva Valley Weather" />
<meta property="og:description" content="Live weather forecasts for Neretva Valley, Croatia" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://neretvalive.eu/" />
<meta property="og:image" content="https://neretvalive.eu/og-image.jpg" />
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="hr_HR" />
```

#### 20. Add Twitter Card Tags (15 min)
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="NeretvaLive - Neretva Valley Weather" />
<meta name="twitter:description" content="Live weather forecasts for Neretva Valley" />
<meta name="twitter:image" content="https://neretvalive.eu/twitter-card.jpg" />
```

#### 21. Create HTML Sitemap Page (1 hour)
**File:** `src/routes/sitemap/+page.svelte`
```svelte
<script>
  import { t } from 'svelte-i18n';
</script>

<svelte:head>
  <title>Site Map - {$t('main.header.title')}</title>
</svelte:head>

<div class="container mx-auto max-w-3xl p-8">
  <h1 class="mb-6 text-3xl font-bold">Site Map</h1>
  
  <section class="mb-8">
    <h2 class="mb-4 text-2xl font-semibold">Main Pages</h2>
    <ul class="space-y-2">
      <li><a href="/" class="text-blue-600 hover:underline">Home - Weather Forecast</a></li>
      <li><a href="/privacy" class="text-blue-600 hover:underline">Privacy Policy & Terms</a></li>
    </ul>
  </section>

  <section>
    <h2 class="mb-4 text-2xl font-semibold">Weather Data Sources</h2>
    <ul class="space-y-2">
      <li><a href="https://www.met.no/" class="text-blue-600 hover:underline" rel="external">MET Norway</a></li>
      <li><a href="https://www.yr.no/" class="text-blue-600 hover:underline" rel="external">Yr.no</a></li>
    </ul>
  </section>
</div>
```

#### 22. Add Structured Data (45 min)
**File:** `src/routes/+page.svelte` - Add to `<svelte:head>`
```svelte
{@html `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "NeretvaLive",
  "url": "https://neretvalive.eu/",
  "description": "Live weather forecasts for Neretva Valley, Croatia",
  "inLanguage": ["en", "hr"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://neretvalive.eu/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
`}
```

#### 23. Fix Table Header Colors (5 min)
**File:** `src/routes/+page.svelte` lines 60-82

**Replace:**
```svelte
class="px-4 py-3 text-left text-sm font-semibold text-gray-900"
```

**With:**
```svelte
class="px-4 py-3 text-left text-sm font-semibold text-[var(--color-on-30)]"
```

### Sprint 3C: Persistence Features (1 hour)

#### 24. Persist Language Selection (30 min)
**File:** `src/lib/i18n-lib.ts` (or create `src/lib/stores/language.ts`)

```typescript
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const stored = browser ? localStorage.getItem('language') : null;
export const language = writable<'en' | 'hr'>(stored as 'en' | 'hr' || 'en');

language.subscribe((value) => {
  if (browser) {
    localStorage.setItem('language', value);
  }
});
```

**Update components to use this store**

#### 25. Verify Theme Persistence (30 min)
**File:** `src/lib/stores/theme.ts` - Verify localStorage works correctly

---

## Phase 4: Low Priority / Polish (8-10 hours)

### Sprint 4A: Type Safety (1 hour)

#### 26. Fix Type Annotations (15 min)
**File:** `src/routes/+page.svelte` line 27
```typescript
function switchLanguage(lang: 'hr' | 'en'): void {
  locale.set(lang);
}
```

#### 27. Complete Type Safety Audit (45 min)
- Review all components for missing types
- Ensure no implicit `any`
- Add return types to functions

### Sprint 4B: Maintainability (3 hours)

#### 28. Extract Inline Styles to CSS Classes (2 hours)
**Goal:** Move all `style=""` attributes to named classes in `app.css`

**Example:**
```svelte
<!-- Before: -->
<div style="background-color: var(--color-30); color: var(--color-on-30);">

<!-- After: -->
<div class="surface-secondary">
```

#### 29. Create Design System Classes (1 hour)
**File:** `src/app.css`
```css
/* Semantic surface classes */
.surface-primary { background-color: var(--color-60); color: var(--color-on-60); }
.surface-secondary { background-color: var(--color-30); color: var(--color-on-30); }
.surface-accent { background-color: var(--color-10); color: var(--color-on-10); }

/* Common button styles */
.btn-primary { ... }
.btn-secondary { ... }

/* Card variations */
.card-elevated { ... }
.card-outlined { ... }
```

### Sprint 4C: Advanced Accessibility (2 hours)

#### 30. Enhanced Focus Indicators (30 min)
**File:** `src/app.css`
```css
:global(:focus-visible) {
  outline: 3px solid var(--color-10);
  outline-offset: 2px;
  border-radius: 4px;
}

:global(button:focus-visible) {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-10) 25%, transparent);
}
```

#### 31. Keyboard Navigation for Map (1.5 hours)
**File:** `src/lib/components/WeatherMap.svelte`

**Add keyboard controls:**
- Tab through markers
- Enter/Space to open popup
- Arrow keys to pan
- +/- to zoom

**This is complex - consider if worth the effort for this use case**

### Sprint 4D: Assets & Branding (2 hours)

#### 32. Create Favicon Set (1 hour)
**Generate using:** https://realfavicongenerator.net/

**Add to `src/app.html`:**
```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
```

#### 33. Create OG/Twitter Images (1 hour)
**Needed:**
- `static/og-image.jpg` (1200x630px)
- `static/twitter-card.jpg` (1200x628px)

**Tools:** Canva, Figma, or Photoshop

---

## Testing Checklist

After each phase, test:

### Accessibility Testing
- [ ] Run Lighthouse accessibility audit (should score 95+)
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Test keyboard-only navigation
- [ ] Verify WCAG 2.2 Level AA compliance

### SEO Testing
- [ ] Verify all pages have unique titles
- [ ] Check meta descriptions (50-160 characters)
- [ ] Validate XML sitemap
- [ ] Test robots.txt
- [ ] Verify Open Graph tags with https://developers.facebook.com/tools/debug/
- [ ] Test Twitter Card with https://cards-dev.twitter.com/validator

### Performance Testing
- [ ] Run Lighthouse performance audit (should score 90+)
- [ ] Check Core Web Vitals
- [ ] Verify lazy loading works
- [ ] Test on slow 3G connection

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### Functional Testing
- [ ] Language switching works and persists
- [ ] Theme switching works and persists
- [ ] Weather data loads correctly
- [ ] Map displays and functions
- [ ] All links work (no 404s)

---

## Estimated Timeline

| Phase | Duration | When |
|-------|----------|------|
| Phase 1: Critical | 2-3 hours | Week 1 - Day 1-2 |
| Phase 2: High Priority | 4-6 hours | Week 1 - Day 3-5 |
| Phase 3: Medium Priority | 6-8 hours | Week 2 |
| Phase 4: Low Priority | 8-10 hours | Week 3-4 |
| **Testing** | 4-6 hours | Throughout + Final |
| **TOTAL** | **24-33 hours** | **3-4 weeks** |

---

## Success Metrics

### Before (Current State)
- ❌ No page titles (WCAG violation)
- ❌ No meta descriptions
- ❌ Duplicate H1 elements
- ❌ No sitemap
- ⚠️ Broken AdSense script
- 🟡 Limited accessibility features
- 🟡 No SEO optimization

### After (Goal State)
- ✅ WCAG 2.2 Level A compliance (minimum)
- ✅ WCAG 2.2 Level AA compliance (goal)
- ✅ Google Search Console: 0 critical errors
- ✅ Lighthouse Accessibility: 95+ score
- ✅ Lighthouse SEO: 95+ score
- ✅ Lighthouse Performance: 90+ score
- ✅ All broken elements fixed
- ✅ Clean codebase (no dead code)
- ✅ Type-safe TypeScript
- ✅ Proper navigation structure
- ✅ Social media ready (OG/Twitter cards)

---

**Ready to start? Begin with Phase 1, Sprint 1A!**

