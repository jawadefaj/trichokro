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

CONTENT REVISION — OCTOBER 2026
- Navigation label on both homepages: NEWS / খবর; corresponding section jump.
- Added TriChokro AUTOMOTIVES header wordmark and EV R&D company positioning.
- Added 2-, 3-, 4-wheeler / commercial / customized / bulk / R&D / CAD / manufacture capability tiles.
- Refreshed Pathfinder image and homepage feature specifications per handwritten annotations.
- Updated Trambulance copy, founder photo and introduction, sister concerns description.
- Reordered core team and updated advisor roles; replaced junior associates with Sifat Rana.
- Replaced the erroneous timeline entries with annotated 2022–2026 milestones.
- Rebuilt the homepage gallery using known local files and reliable one-image-at-a-time layout.
- Added css/site-content-revisions.css and synchronized homepage changes into index_bn.html.

REQUIRES OWNER REVIEW BEFORE PUBLISHING
- Confirm new managing director name and role, and supply an approved photograph.
- Confirm Sifat Rana spelling/role and provide an approved photograph.
- Supply the achievement slide to replace the retained achievements text exactly.
- Verify 150 km, 50 km/h and 3/6/8-person Pathfinder variants before publishing.
- Confirm the official Bangkok 2025 sustainability-award title.
- Provide the requested replacement logo or product images when available.
- Screenshot annotation '4' did not specify a 4-wheeler product; retained the existing
  sister-concern card and added a 4-wheeler capability category without inventing a model.

CLEANUP: Two obsolete, unlinked demo pages under src/assets/ (index.html and
index2.html) were excluded because their relative links were broken and they
are not part of the production website navigation.
