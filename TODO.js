[
	{ 2: 'color if EN HR i Title' },

	{ 3: 'create a compomemts of main page' },
	{ 4: 'make a card better placed' },
	{ 5: 'Reintroduce server-side MET forecast proxy to restore caching and headers' },

	// ========== CRITICAL SEO & ACCESSIBILITY ISSUES (from site audit) ==========
	{ 6: 'Add <title> tag to app.html - CRITICAL (WCAG 2.2 A, Google/Bing guidelines)' },
	{ 7: 'Add meta description tag for SEO (Yahoo/Google/Bing recommendation)' },
	{ 8: 'Ensure proper H1 hierarchy - main page needs H1 before main content (Bing guideline)' },
	{ 9: 'Create and upload XML sitemap (sitemap.xml) for search engines' },
	{ 10: 'Create HTML sitemap page with links to all important sections' },
	{ 11: 'Add sitemap location to robots.txt file' },
	{ 12: 'Add navigation links to prevent "dead-end" pages (Usability.gov 7:1)' },
	{ 13: 'Consider adding search functionality for content-rich sections (Usability.gov 17:4)' },

	// ========== CODE QUALITY & STRUCTURE ISSUES ==========
	{ 14: 'Fix duplicate H1 elements in +layout.svelte (lines 45-53) - bad for SEO and accessibility' },
	{
		15: 'Language buttons missing aria-label for screen readers (lines 64-71 in +layout.svelte)'
	},
	{
		16: 'Broken AdSense script tag in +layout.svelte (line 35) - src="#" should be removed or configured'
	},
	{ 17: 'AdSense placeholders show test IDs "YOUR-ADSENSE-CLIENT-ID" - need real IDs or removal' },
	{ 18: 'Footer email "contact@example.com" is placeholder - needs real contact email' },

	// ========== ACCESSIBILITY ISSUES ==========
	{ 19: 'Add lang attributes to language switcher buttons for better i18n support' },
	{ 20: 'Weather emoji icons lack aria-label descriptions for screen readers' },
	{
		21: 'Table headers use inconsistent color (text-gray-900) on colored background (--color-30)'
	},
	{ 22: 'Add loading="lazy" and proper dimensions to img/iframe for performance' },
	{ 23: 'Map markers lack keyboard navigation support - not accessible for keyboard-only users' },
	{ 24: 'Missing skip-to-content link for keyboard navigation' },
	{ 25: 'Focus indicators could be more prominent for keyboard users' },

	// ========== PERFORMANCE & BEST PRACTICES ==========
	{ 26: 'Leaflet CSS loaded dynamically in WeatherMap - should be in app.html for performance' },
	{
		27: 'Commented out dead code in WeatherMap.svelte (lines 99-115) - remove to clean codebase'
	},
	{ 28: 'Multiple alternative tile layers commented out - remove unused code (lines 180-199)' },
	{ 29: 'Inline styles throughout components - consolidate into CSS classes for maintainability' },
	{ 30: 'CSS transitions applied to ALL elements (*) in +page.svelte - too broad, impacts performance' },

	// ========== TYPE SAFETY ISSUES ==========
	{ 31: 'Missing type annotation for switchLanguage parameter in +page.svelte (line 27)' },
	{ 32: 'Console.log for debugging still present in WeatherMap.svelte (line 171) and +page.svelte (line 171)' },

	// ========== UX & DESIGN ISSUES ==========
	{ 33: 'Navigation inconsistent - +layout has header/footer but +page.svelte has its own header' },
	{ 34: 'Privacy page has no back/home link - users can get stuck' },
	{ 35: 'No favicon configured properly (only generic favicon.ico)' },
	{ 36: 'Missing Open Graph and Twitter Card meta tags for social media sharing' },
	{ 37: 'No structured data (Schema.org JSON-LD) for rich search results' },
	{ 38: 'Theme toggle works but no persistence - resets on page reload (check localStorage implementation)' },

	// ========== SECURITY CONCERNS ==========
	{ 39: 'External script loading without SRI (Subresource Integrity) hashes in some places' },
	{ 40: 'MET API calls from client-side expose API pattern - consider server-side proxy' },

	// ========== I18N ISSUES ==========
	{ 41: 'Language persistence not implemented - resets on page reload' },
	{ 42: 'Missing translations keys cause fallback issues (check locale files completeness)' },
	{ 43: 'HTML lang attribute in app.html is hardcoded to "en" - should be dynamic based on locale' }
];
