# TriChokro bilingual newsroom — sourcing and deployment

Updated 17 October 2026.

## What changed
- Expanded 17 sourced records with fuller, original English reporting or an explicit source-access explanation and matching Bengali versions.
- Added small source-highlight panels to both article templates and a conspicuous access-limited message on the Facebook/YouTube records.
- Retained five earlier company-archive records, existing category filters, search, article IDs and every provided URL.
- This is **original editorial paraphrasing**, not a reproduction of copyrighted third-party posts/articles or a transcript of embedded videos.

## Evidence basis
- Sasin LinkedIn TriChokro spotlight: explains the Dhaka emergency-mobility problem and the three-wheel battery-powered Trambulance concept.
- Sasin official winners post: identifies the Sustainability Award winner and the separate grand-prize and runner-up teams.
- Chulalongkorn University (https://www.chula.ac.th/en/news/410126/): 23 May ceremony, USD 5,000 sustainability prize, 385 teams and 83 institutions.
- Bangkok Business Challenge official teams directory: BUET team listing, finalists and Sustainability winner flag.
- Polymerupdate (https://polymerupdate.com/PressRelease/Details/40763) and ThaiPR.NET (https://www.thaipr.net/general/3715588): 24 April pre-event announcement, 20 semifinalists and broader competition context; **not** a May awards results announcement.
- Muspana LinkedIn: public encouragement/support at the IMechE South Asia Finals in Maldives; no confirmed sponsorship terms or amount.
- Startup Thinking School: public TriChokro 3 Star cohort profile and founder testimonial. Two supplied URLs currently display the same main webpage; STS's vehicle/equipment/other award claims are attributed to STS, not independently verified here.
- The Org: company directory visibly marked **Unverified**.
- Murali Krishnan LinkedIn links: Plas-Stick student microplastics innovation; **not TriChokro coverage**. The links display the same core story.
- BUET Automobile Club YouTube: supplied interview details only; full video transcript not independently retrieved.
- Facebook Bangkok/Sasin URLs: automated public retrieval was blocked, so no missing captions have been invented; Sasin 2022 Thai stock-market video is not TriChokro coverage.

## Publishing
Copy the following **seven files together** into the same folder:
`blogs.html`, `blog.html`, `blogs_bn.html`, `blog_bn.html`, `news-data.js`, `news-data-bn.js`, `news-category-bn.js`.
Retain existing `src/assets`, `css`, `js`, `cool_animations.js` as referenced by your site. You can replace the news files without changing the homepage.

Open `blogs.html` for the English list, `blogs_bn.html` for the Bangla list, or `blog.html?post=chulalongkorn-award` to review an individual English article. The link `blog_bn.html?post=chulalongkorn-award` opens the Bangla article. YouTube embeds, external styling/CDNs and social sites require network access and publisher permission.
