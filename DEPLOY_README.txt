TRICHOKRO — MOBILE OPTIMIZED DEPLOYMENT PACKAGE

UPLOAD INSTRUCTIONS
1. This ZIP contains the website at its ROOT (index.html is not nested).
2. Extract the files directly into your web hosting public_html / site root, or
   upload the extracted contents to the root of your GitHub Pages repository.
3. Replace older website files so the new css/ and js/ files are present.
4. Clear site/CDN caches, then test in a private browser window on a phone.
5. Keep the entire src/assets/ folder, including PDF files, in place.

WHAT CHANGED
- Shared mobile navigation with correct hidden/clickable state and keyboard close.
- Smaller touch-first gallery; gallery uses known images, not 30 probing requests.
- Autoscrolling card sections become native swipe rows on small screens.
- Click-to-play YouTube thumbnails replace startup iframe downloads.
- Native responsive images, asynchronously decoded and lazy loaded below the fold.
- Product videos play when visible, pause offscreen; smaller mobile video variants.
- GIF-based product animation replaced by optimized MP4.
- Mobile particle/background animation load is cut significantly.
- Decorative loading overlay no longer blocks using the page.
- Fixed broken product-page asset filenames and added missing social-preview image.
- React app JSX compiled ahead of time; user zoom enabled.
- English and Bangla pages included.

COMPATIBILITY & LIMITATIONS
- Existing external third-party CDN libraries (Tailwind, Lucide, fonts, React/Leaflet
  where used) remain necessary; no backend/service configuration was altered.
- This package has passed link/asset and JavaScript syntax checks. Physical device
  and remote CDN/browser performance testing must still be done after deployment.
- Do not delete optimized mobile video files or the shared site-mobile files.

Original website and file structure preserved where practical.
