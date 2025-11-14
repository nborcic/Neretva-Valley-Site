# Issues Grouped By File Location

Quick reference guide showing which files need attention and what needs to be fixed.

---

## 📁 `src/app.html` (3 critical issues)

**Severity: 🔴 CRITICAL**

### Issues:
1. ❌ **Missing `<title>` tag** (WCAG 2.2 A violation)
2. ❌ **Missing meta description**
3. ❌ **Hardcoded `lang="en"` attribute** (should be dynamic)

### Current Structure:
```html
<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

### Needs:
- Default `<title>` tag
- Meta description
- Open Graph tags
- Twitter Card tags
- Leaflet CSS `<link>` (move from WeatherMap component)

---

## 📁 `src/routes/+layout.svelte` (9 issues)

**Severity: 🔴 CRITICAL + 🟠 HIGH**

### Issues:
1. 🔴 **Duplicate H1 elements** (lines 45-53) - SEO/accessibility issue
2. 🔴 **Broken AdSense script** (line 35) `src="#"`
3. 🟠 **Language buttons missing aria-labels** (lines 64-71)
4. 🟠 **Placeholder email** "contact@example.com" (line 149)
5. 🟠 **Test AdSense IDs** "YOUR-ADSENSE-CLIENT-ID" (lines 100, 121)
6. 🟡 **Excessive inline styles** (throughout)
7. 🟢 **Navigation structure** - duplicates with +page.svelte header

### Line-by-Line:
```
Line 35:  <script async src="#" ← BROKEN
Line 45:  <h1>...</h1> ← DUPLICATE H1
Line 50:  <h1>...</h1> ← DUPLICATE H1
Line 64:  <button on:click={() => setLang('hr')}>HR</button> ← NO ARIA
Line 69:  <button on:click={() => setLang('en')}>EN</button> ← NO ARIA
Line 100: data-ad-client="YOUR-ADSENSE-CLIENT-ID" ← PLACEHOLDER
Line 121: data-ad-client="YOUR-ADSENSE-CLIENT-ID" ← PLACEHOLDER
Line 149: href="mailto:contact@example.com" ← PLACEHOLDER
```

---

## 📁 `src/routes/+page.svelte` (8 issues)

**Severity: 🟠 HIGH + 🟡 MEDIUM**

### Issues:
1. 🟠 **Weather emoji icons lack aria-labels** (lines 53, 64, 67, 70, 73, 76, 79, 82)
2. 🟠 **Duplicate header** (lines 34-45) - conflicts with layout header
3. 🟡 **Table header color inconsistency** (lines 60-82)
4. 🟡 **Overly broad CSS transitions** (lines 209-213)
5. 🟡 **Debug console.log** (line 171)
6. 🟢 **Missing type annotation** (line 27) `switchLanguage` function
7. 🟢 **Excessive inline styles** (throughout)
8. 🟢 **iframe/img optimization** (lines 146, 165) - needs explicit dimensions

### Critical Lines:
```
Line 27:  function switchLanguage(lang: string) ← should be 'hr' | 'en'
Line 38:  <h1 class="text-3xl font-bold text-gray-900"> ← DUPLICATE with layout
Line 53:  🌤️ {$t('main.forecast.title')} ← NO ARIA
Line 146: <iframe ... ← needs width/height
Line 165: <img ... ← needs width/height  
Line 171: console.log('Meteogram failed to load'); ← REMOVE DEBUG
Line 209: :global(*) { transition... } ← TOO BROAD
```

---

## 📁 `src/lib/components/WeatherMap.svelte` (7 issues)

**Severity: 🟠 HIGH + 🟡 MEDIUM**

### Issues:
1. 🟠 **Dead code** - `getWeatherColor` function (lines 98-116) completely commented
2. 🟠 **Commented tile layer alternatives** (lines 180-199)
3. 🟠 **Map markers not keyboard accessible**
4. 🟡 **Leaflet CSS loaded dynamically** (lines 228-241) - causes FOUC
5. 🟡 **Multiple debug console.logs** (lines 35, 69, 204)
6. 🟡 **Weather icon markers lack text alternatives**
7. 🟡 **Popup content not accessible**

### Dead Code to Remove:
```javascript
// Lines 98-116 - REMOVE ENTIRE FUNCTION
function getWeatherColor(weather: WeatherObservation['weather']): string {
  /* switch (weather) {
    case 'sunny':
      return 'transparent';
    case 'partly-cloudy':
      return 'transparent';
    ...all cases return transparent
  } */
  return 'transparent';
}

// Lines 180-199 - REMOVE COMMENTED CODE
//L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//  ...
//}).addTo(map);
```

### Console.logs to Remove:
```
Line 35:  console.warn(`No coordinates found...`)
Line 69:  console.error('Error loading weather data:', err);
Line 204: console.error('Error initializing map:', err);
```

---

## 📁 `src/routes/privacy/+page.svelte` (2 issues)

**Severity: 🟠 HIGH**

### Issues:
1. 🟠 **No navigation links** - dead-end page (Usability.gov 7:1 violation)
2. 🟠 **No back to home link**

### Needs:
- Add navigation breadcrumbs or back link
- Link to home page
- Consistent header/footer from layout

---

## 📁 `src/routes/+page.ts` (1 issue)

**Severity: 🟡 MEDIUM**

### Issues:
1. 🟡 **Client-side API calls** (line 16) - should use server proxy
   - Note: Already in original TODO #5

### Current:
```typescript
const MET_FORECAST_URL = 
  'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=43.05&lon=17.6';
```

---

## 📁 `static/robots.txt` (1 issue)

**Severity: 🟠 HIGH**

### Issues:
1. 🟠 **Missing sitemap reference**

### Current:
```
User-agent: *
Disallow:
```

### Should Be:
```
User-agent: *
Disallow:

Sitemap: https://neretvalive.eu/sitemap.xml
```

---

## 📁 `src/app.css` (1 issue)

**Severity: 🟢 LOW**

### Issues:
1. 🟢 **Could add better focus styles** for keyboard navigation

### Suggested Addition:
```css
:global(:focus-visible) {
  outline: 3px solid var(--color-10);
  outline-offset: 2px;
}
```

---

## 📁 **MISSING FILES** (3 critical)

### 1. 🔴 `static/sitemap.xml` - MISSING
**Required by:** Google, Bing, all search engines

### 2. 🔴 HTML Sitemap Page - MISSING
**Needed at:** `/sitemap` or `/site-map`

### 3. 🟡 Multiple Favicon Sizes - MISSING
**Current:** Only `static/favicon.ico`
**Needs:**
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png`
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `site.webmanifest`

---

## Quick Fix Checklist

### ⚡ Can Fix in 5 Minutes:
- [ ] Add default `<title>` to `app.html`
- [ ] Remove `src="#"` from AdSense script
- [ ] Add `aria-label` to HR/EN buttons
- [ ] Update `contact@example.com`
- [ ] Remove console.log statements
- [ ] Add sitemap line to `robots.txt`

### ⏱️ Can Fix in 30 Minutes:
- [ ] Fix duplicate H1 in `+layout.svelte`
- [ ] Remove dead code from `WeatherMap.svelte`
- [ ] Add meta descriptions
- [ ] Add aria-labels to weather icons
- [ ] Add back link to privacy page
- [ ] Fix `switchLanguage` type annotation

### 📅 Requires More Planning:
- [ ] Create XML sitemap
- [ ] Add Open Graph / Twitter Card tags
- [ ] Consolidate navigation structure
- [ ] Add keyboard support to map
- [ ] Implement search functionality
- [ ] Add structured data (Schema.org)

---

## Files With NO Issues Found ✅

- `src/lib/i18n-lib.ts`
- `src/lib/stores/theme.ts` (assuming localStorage works)
- `src/lib/locales/en.json` (may need completeness audit)
- `src/lib/locales/hr.json` (may need completeness audit)
- `svelte.config.js`
- `vite.config.js`
- `package.json`

---

*Last Updated: November 13, 2025*

