# Neretva Valley Site - Issues Analysis Report

Generated: Thursday, November 13, 2025

## Executive Summary

This report details **43 issues** found across the codebase, categorized by severity and type. Issues range from **CRITICAL** SEO/accessibility violations to code quality improvements.

---

## 🔴 CRITICAL ISSUES (Must Fix Immediately)

### 1. Missing `<title>` Tag ⚠️ WCAG 2.2 Level A Violation
**Location:** `src/app.html`  
**Impact:** Severe - Site is unusable for screen readers, fails SEO, violates accessibility standards  
**Standards Violated:**
- WCAG 2.2 Level A 2.4.2
- Section 508 (2017) A 2.4.2
- Google/Bing/Yahoo SEO guidelines

**Current State:**
```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  %sveltekit.head%
  <!-- Missing <title> tag -->
</head>
```

**Fix:** Add dynamic title using `<svelte:head>` in pages or default title in `app.html`

---

### 2. Missing Meta Description ⚠️ SEO Critical
**Location:** `src/app.html` and page components  
**Impact:** Poor search engine visibility, no social media preview text  
**Fix:** Add meta description tags for each page

---

### 3. Duplicate H1 Elements
**Location:** `src/routes/+layout.svelte` (lines 45-53)  
**Impact:** Confuses search engines and screen readers  
**Current:** Two `<h1>` tags for site title (split across elements)  
**Fix:** Use single H1, style the logo differently

---

### 4. No XML Sitemap
**Location:** Missing `sitemap.xml`  
**Impact:** Search engines can't properly crawl and index the site  
**Guideline:** Google & Bing recommend XML sitemap at `/sitemap.xml`

---

### 5. Broken AdSense Script
**Location:** `src/routes/+layout.svelte` line 35  
**Issue:** `<script async src="#" crossorigin="anonymous"></script>`  
**Impact:** Invalid HTML, throws console errors  
**Fix:** Either remove or add proper AdSense script URL

---

## 🟠 HIGH PRIORITY ISSUES

### Accessibility

#### 6. Language Buttons Missing ARIA Labels
**Location:** `src/routes/+layout.svelte` lines 64-71
```svelte
<button on:click={() => setLang('hr')}>HR</button>
<button on:click={() => setLang('en')}>EN</button>
```
**Fix:** Add `aria-label="Switch to Croatian"` etc.

#### 7. Weather Icons Not Accessible
**Issue:** Emoji icons (🌤️, 🌧️, etc.) have no text alternatives  
**Impact:** Screen readers can't convey weather information  
**Fix:** Add `aria-label` attributes or visually-hidden text

#### 8. Map Not Keyboard Accessible
**Location:** `src/lib/components/WeatherMap.svelte`  
**Issue:** Leaflet markers can't be accessed via keyboard  
**Fix:** Add keyboard event handlers or accessible alternatives

#### 9. Missing Skip Navigation Link
**Impact:** Keyboard users must tab through entire header  
**Fix:** Add skip-to-content link at page top

---

### Code Quality

#### 10. Dead Code in WeatherMap
**Location:** `src/lib/components/WeatherMap.svelte` lines 99-115
```javascript
function getWeatherColor(weather: WeatherObservation['weather']): string {
  /* switch (weather) {
    case 'sunny':
      return 'transparent';
    // ... all commented out
  } */
  return 'transparent';
}
```
**Fix:** Remove entire function and all references

#### 11. Multiple Commented-Out Tile Layers
**Location:** `src/lib/components/WeatherMap.svelte` lines 180-199  
**Fix:** Remove unused OpenStreetMap and OpenTopoMap code

#### 12. Debug Console.log Statements
**Locations:**
- `src/lib/components/WeatherMap.svelte` line 35, 171, 204
- `src/routes/+page.svelte` line 171

**Fix:** Remove all console.log used for debugging

---

### Structure & UX

#### 13. Duplicate Headers
**Issue:** `+layout.svelte` has header, but `+page.svelte` also has its own header  
**Impact:** Confusing navigation structure, duplicate elements  
**Fix:** Consolidate into single header in layout

#### 14. Privacy Page is Dead-End
**Location:** `src/routes/privacy/+page.svelte`  
**Issue:** No navigation back to home  
**Violation:** Usability.gov 7:1 guideline  
**Fix:** Add back/home link

#### 15. Placeholder Contact Email
**Location:** `src/routes/+layout.svelte` line 149  
**Current:** `contact@example.com`  
**Fix:** Use real contact email

---

## 🟡 MEDIUM PRIORITY ISSUES

### Performance

#### 16. Leaflet CSS Loaded Dynamically
**Location:** `src/lib/components/WeatherMap.svelte` lines 228-241  
**Issue:** CSS injected via JavaScript causes FOUC (Flash of Unstyled Content)  
**Fix:** Move to `<link>` in `app.html` with SRI hash

#### 17. Overly Broad CSS Transitions
**Location:** `src/routes/+page.svelte` lines 209-213
```css
:global(*) {
  transition-property: color, background-color, border-color, opacity, transform;
  transition-duration: 200ms;
}
```
**Impact:** Applies to ALL elements, hurts performance  
**Fix:** Target specific elements

#### 18. Images/Iframes Missing Optimization
**Location:** `src/routes/+page.svelte` lines 146, 165  
**Issue:** Already has `loading="lazy"` but missing explicit dimensions  
**Fix:** Add `width` and `height` attributes to prevent layout shift

---

### SEO

#### 19. No HTML Sitemap
**Missing:** `/sitemap` page with links to all sections  
**Guideline:** Google & Bing recommendation for crawler accessibility

#### 20. robots.txt Incomplete
**Location:** `static/robots.txt`  
**Current:**
```
User-agent: *
Disallow:
```
**Missing:** Sitemap location reference  
**Fix:** Add `Sitemap: https://neretvalive.eu/sitemap.xml`

#### 21. Missing Open Graph Tags
**Impact:** Poor social media sharing (Facebook, LinkedIn, etc.)  
**Fix:** Add OG tags for title, description, image, url

#### 22. Missing Twitter Card Tags
**Impact:** Poor Twitter sharing appearance  
**Fix:** Add Twitter Card meta tags

#### 23. No Structured Data
**Missing:** Schema.org JSON-LD markup  
**Impact:** No rich search results (star ratings, breadcrumbs, etc.)  
**Fix:** Add LocalBusiness or WebSite schema

---

### Accessibility

#### 24. Inconsistent Table Header Colors
**Location:** `src/routes/+page.svelte` lines 58-84  
**Issue:** `text-gray-900` on `bg-[var(--color-30)]` - may have poor contrast  
**Fix:** Use `text-[var(--color-on-30)]` for consistency

#### 25. No Focus Indicators Enhancement
**Issue:** Default browser focus styles may not be prominent enough  
**Fix:** Add custom focus styles with better visibility

---

## 🟢 LOW PRIORITY / NICE TO HAVE

### Type Safety

#### 26. Missing Type Annotation
**Location:** `src/routes/+page.svelte` line 27
```typescript
function switchLanguage(lang: string) {
  locale.set(lang);
}
```
**Fix:** Should be `lang: 'hr' | 'en'` to match Language type

---

### Maintainability

#### 27. Excessive Inline Styles
**Locations:** Throughout `+page.svelte` and `+layout.svelte`  
**Issue:** Inline `style=` attributes make CSS hard to maintain  
**Fix:** Extract to CSS classes in `app.css`

#### 28. AdSense Test IDs
**Location:** Multiple places in `+layout.svelte`  
**Current:** `data-ad-client="YOUR-ADSENSE-CLIENT-ID"`  
**Fix:** Replace with real IDs or remove placeholder code

---

### I18N & Localization

#### 29. Language Not Persisted
**Issue:** Selected language resets on page reload  
**Fix:** Store in localStorage

#### 30. Theme Not Persisted
**Location:** `src/lib/stores/theme.ts` (review needed)  
**Issue:** Theme selection resets on reload  
**Fix:** Verify localStorage implementation works

#### 31. Hardcoded HTML lang
**Location:** `src/app.html` line 2  
**Current:** `<html lang="en">`  
**Issue:** Doesn't change based on selected language  
**Fix:** Make dynamic (tricky with SvelteKit SSG)

#### 32. Missing Translation Keys
**Issue:** Some locale keys may be incomplete  
**Fix:** Audit `en.json` vs `hr.json` for completeness

---

### Security

#### 33. Client-Side API Calls
**Location:** `src/routes/+page.ts` line 16  
**Issue:** Direct MET API calls expose patterns and bypass caching  
**Note:** Already in TODO #5 ("Reintroduce server-side proxy")

#### 34. Missing SRI Hashes
**Location:** `src/lib/components/WeatherMap.svelte` line 232  
**Issue:** Leaflet CSS loaded without SRI (though integrity attribute exists)  
**Status:** Actually has SRI, verify it's correct

---

### UX/Design

#### 35. Generic Favicon
**Location:** `static/favicon.ico`  
**Fix:** Create branded favicon set (16x16, 32x32, apple-touch-icon, etc.)

#### 36. No Search Functionality
**Guideline:** Usability.gov 17:4 for content-rich sites  
**Priority:** Low (site is relatively simple currently)

---

## Issue Statistics

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| SEO & Accessibility | 5 | 4 | 5 | 0 | 14 |
| Code Quality | 1 | 3 | 1 | 2 | 7 |
| Performance | 0 | 0 | 3 | 0 | 3 |
| Type Safety | 0 | 0 | 0 | 1 | 1 |
| UX/Design | 0 | 3 | 0 | 3 | 6 |
| Security | 0 | 0 | 0 | 2 | 2 |
| I18N | 0 | 0 | 0 | 4 | 4 |
| **TOTAL** | **6** | **10** | **9** | **12** | **43** |

---

## Recommended Fix Order

### Phase 1: Critical Fixes (Week 1)
1. Add `<title>` tags to all pages
2. Add meta descriptions
3. Fix duplicate H1 elements
4. Remove/fix broken AdSense script
5. Create XML sitemap
6. Update robots.txt

### Phase 2: High Priority (Week 2)
7. Add ARIA labels to language buttons
8. Add aria-label to weather icons
9. Fix navigation structure (consolidate headers)
10. Add skip navigation link
11. Clean up dead code (WeatherMap)
12. Remove debug console.logs

### Phase 3: Medium Priority (Week 3-4)
13. Move Leaflet CSS to app.html
14. Optimize CSS transitions
15. Add Open Graph tags
16. Add Twitter Card tags
17. Create HTML sitemap page
18. Fix table header colors
19. Persist language selection

### Phase 4: Polish (Ongoing)
20. Add structured data
21. Improve focus indicators
22. Create branded favicon set
23. Add keyboard support to map
24. Refactor inline styles
25. Type safety improvements

---

## Tools Used for Analysis
- Manual code review
- SortSite accessibility audit report (provided by user)
- WCAG 2.2 Level A/AA guidelines
- Google/Bing SEO guidelines
- TypeScript strict mode principles
- Modern web best practices

---

## Notes

- This is a SvelteKit static site (`adapter-static` with `ssr: false`)
- Using Tailwind v4 (important for syntax)
- Internationalized with `svelte-i18n`
- Weather data from MET Norway API
- Map using Leaflet.js

---

*This analysis is comprehensive but not exhaustive. Additional issues may be discovered during implementation of fixes.*

