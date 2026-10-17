TriChokro Automotives — targeted website update (October 2026)

WHAT IS INSIDE
- index.html: original index, with ONLY requested changes (removed Engineering Stack caption and bottom engineering grid; moved Blogs & News; new video carousel; updated Facebook timeline).
- blogs.html: the original Blogs & News marquee section moved to a separate page with the original navbar/footer design.
- youtube-feed.php: optional live YouTube upload feed provider. PHP + cURL + SimpleXML required. The homepage asks this file for the latest 6 public uploads.
- achievements.html and achievement-details.html: original files unchanged.
- trichokro_research add.html: original research file unchanged.
- achievements-data.js: the same previous starter dataset; replace with your own full dataset when available.

DEPLOYMENT
Upload the contents next to your existing website files. KEEP your existing src/assets, css, js, images, blog.html and other HTML files in their current paths. The website requires these existing assets.
For automatic latest six YouTube uploads, use a PHP-enabled host with outbound HTTPS access (PHP cURL + SimpleXML), and place youtube-feed.php beside index.html. For restrictive hosting, get your public YouTube channel ID (UC followed by 22 characters) and put it in youtube-channel-id.txt in the same directory. An RSS feed may contain fewer than six eligible public uploads.
On STATIC hosting without PHP, the carousel works but shows two previously linked featured videos rather than claiming to know the latest six.
Facebook uses Meta's official Page Plugin in Timeline mode, linked to https://www.facebook.com/people/TriChokro/61577812382585/ . Meta controls which recent public posts are shown, and privacy/login restrictions may prevent display. This is not a custom Facebook API feed.
YouTube videos play inside the web page on click, provided embedding is permitted for that upload.

NOTES
The existing standalone blog.html?post=... links are retained in the moved cards. Keep blog.html on your site for them to work.
