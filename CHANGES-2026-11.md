# TriChokro ওয়েবসাইট আপডেট, নভেম্বর ২০২৬

ডিজাইন একই আছে। শুধু বাগ ঠিক করা হয়েছে আর সাইট দ্রুত করা হয়েছে।

## ১. মোবাইলে ভুল বাটনে চলে যাওয়ার সমস্যা ঠিক করা হয়েছে

**কারণ:** কয়েকটি পেজের CSS-এ `#mobile-menu { max-height: 100vh }` লেখা ছিল। এই নিয়মটা মেনুর "বন্ধ" অবস্থার `max-h-0` ক্লাসকে বাতিল করে দিত। ফলে মেনু বন্ধ থাকলেও সেটা পুরো স্ক্রিনজুড়ে অদৃশ্যভাবে পেজের উপরে থাকত। তাই যেকোনো বাটনে চাপ দিলে আসলে চাপ পড়ত মেনুর লুকানো লিংকে (HOME, ABOUT US, NEWS, PRODUCTS, CONTACTS, BN)।

**যা ঠিক করা হয়েছে:**
- `css/site-mobile.css` ফাইলটা নতুন করে বানানো হয়েছে। এটা অনেক পেজে লিংক করা ছিল, কিন্তু GitHub-এ ছিল না (404 আসত)। এখন বন্ধ মেনু শূন্য উচ্চতার, লুকানো, আর তাতে চাপ পড়ে না।
- `js/site-navigation.js`: লিংকে চাপলে, বাইরে চাপলে বা Esc চাপলে মেনু বন্ধ হয়। `aria-expanded` সঠিকভাবে আপডেট হয়। যে পেজগুলো `site-mobile.css` লোড করে না, সেগুলোতেও একই সমাধান কাজ করে।

## ২. দ্রুত লোডের জন্য পরিবর্তন

- **Tailwind CDN বাদ দেওয়া হয়েছে (২৫টি পেজে):** `cdn.tailwindcss.com` প্রায় ৩০০ KB+ JavaScript, যা প্রতিবার ফোনে বসে CSS তৈরি করত। এখন প্রতিটি পেজের জন্য আগে থেকে বানানো ছোট CSS ফাইল আছে `css/tw/` ফোল্ডারে (১০ থেকে ৪০ KB)। ডিজাইন হুবহু একই।
- **ছবি HTML থেকে আলাদা করা হয়েছে:** Bravostruck, fortunacargo, arkgo আর vesel_urbana পেজের ভেতরে base64 আকারে ছবি ঢোকানো ছিল। এখন ছবিগুলো `images/embedded/` ফোল্ডারে আছে:
  - Bravostruck.html: ১৬০০ KB থেকে ৬৩ KB
  - fortunacargo.html: ১১৭৪ KB থেকে ৬৪ KB
  - arkgo.html: ৮৬৭ KB থেকে ৬৬ KB
  - vesel_urbana.html: ২০৮ KB থেকে ৪৩ KB
- **অব্যবহৃত `marked.js` সরানো হয়েছে** (৮টি পেজে)। এটা লোড হতো কিন্তু কোথাও ব্যবহার হতো না।
- **Lucide আইকন লাইব্রেরির ভার্সন ঠিক করে দেওয়া হয়েছে** (`@latest` থেকে `@1.80.0`)। এতে ব্রাউজার ফাইলটা ক্যাশ করতে পারে, আর নতুন ভার্সন এসে আইকন হঠাৎ বদলে যাবে না।

## ৩. অন্যান্য বাগ

- index.html-এ Google Analytics-এর আইডি ভুল ছিল (`G-XXXXXXXXXX`)। এখন `G-11WB3G1XH8`, তাই ভিজিটর গোনা শুরু হবে।
- Bravostruck আর fortunacargo পেজে একে অপরের পেজের লিংকগুলো এমন ফাইলে যেত যা নেই (`*-standalone.html`)। এখন সঠিক পেজে যায়।
- engineering_excellence.html-এ ভাঙা ইমোজি (`ðŸ‡§ðŸ‡©`, `â¬‡ï¸`) ঠিক করা হয়েছে।

## পরে কোনো পেজে Tailwind ক্লাস যোগ করলে

পেজে নতুন Tailwind ক্লাস যোগ করলে CSS আবার বানাতে হবে (Node.js লাগবে):

```
sh tailwind/build.sh
```

প্রতিটি পেজের Tailwind সেটিংস এখন `tailwind/<page>.config.js` ফাইলে আছে।

## সার্ভারে আছে কিন্তু GitHub রিপোতে নেই এমন ফাইল

নিচের ফাইলগুলো পেজে লিংক করা আছে, কিন্তু রিপোতে নেই। লাইভ সার্ভারে থাকলে মুছবেন না:

- `images/logo-*.png`
- `images/bangkok-business-challenge-2026.jpg`
- `src/assets/Arkgo Amphibian.png`, `Bravos Truck.png`, `Fortuna Cargo.png`, `Urbana Vessel.png`
- `src/assets/slideshow/1_1.webp`
- `src/assets/pdf/ARKGO_*.pdf`
- `js/trambulance-app.js`
