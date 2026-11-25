#!/bin/sh
# Rebuild the per-page Tailwind CSS after editing any page's classes.
# Needs Node.js. Run from the site root:  sh tailwind/build.sh
set -e
cd "$(dirname "$0")/.."
npx tailwindcss@3.4.17 -c tailwind/arkgo.config.js -i tailwind/input.css -o css/tw/arkgo.css --minify
npx tailwindcss@3.4.17 -c tailwind/blog.config.js -i tailwind/input.css -o css/tw/blog.css --minify
npx tailwindcss@3.4.17 -c tailwind/blog_bn.config.js -i tailwind/input.css -o css/tw/blog_bn.css --minify
npx tailwindcss@3.4.17 -c tailwind/blogs.config.js -i tailwind/input.css -o css/tw/blogs.css --minify
npx tailwindcss@3.4.17 -c tailwind/blogs_bn.config.js -i tailwind/input.css -o css/tw/blogs_bn.css --minify
npx tailwindcss@3.4.17 -c tailwind/contact.config.js -i tailwind/input.css -o css/tw/contact.css --minify
npx tailwindcss@3.4.17 -c tailwind/contact_bn.config.js -i tailwind/input.css -o css/tw/contact_bn.css --minify
npx tailwindcss@3.4.17 -c tailwind/engineering_excellence.config.js -i tailwind/input.css -o css/tw/engineering_excellence.css --minify
npx tailwindcss@3.4.17 -c tailwind/engineering_excellence_bn.config.js -i tailwind/input.css -o css/tw/engineering_excellence_bn.css --minify
npx tailwindcss@3.4.17 -c tailwind/founder.config.js -i tailwind/input.css -o css/tw/founder.css --minify
npx tailwindcss@3.4.17 -c tailwind/founder_bn.config.js -i tailwind/input.css -o css/tw/founder_bn.css --minify
npx tailwindcss@3.4.17 -c tailwind/index.config.js -i tailwind/input.css -o css/tw/index.css --minify
npx tailwindcss@3.4.17 -c tailwind/index_bn.config.js -i tailwind/input.css -o css/tw/index_bn.css --minify
npx tailwindcss@3.4.17 -c tailwind/pathfinder.config.js -i tailwind/input.css -o css/tw/pathfinder.css --minify
npx tailwindcss@3.4.17 -c tailwind/pathfinder_bn.config.js -i tailwind/input.css -o css/tw/pathfinder_bn.css --minify
npx tailwindcss@3.4.17 -c tailwind/resources.config.js -i tailwind/input.css -o css/tw/resources.css --minify
npx tailwindcss@3.4.17 -c tailwind/resources_bn.config.js -i tailwind/input.css -o css/tw/resources_bn.css --minify
npx tailwindcss@3.4.17 -c tailwind/trambulance.config.js -i tailwind/input.css -o css/tw/trambulance.css --minify
npx tailwindcss@3.4.17 -c tailwind/trambulance_app.config.js -i tailwind/input.css -o css/tw/trambulance_app.css --minify
npx tailwindcss@3.4.17 -c tailwind/trambulance_bn.config.js -i tailwind/input.css -o css/tw/trambulance_bn.css --minify
npx tailwindcss@3.4.17 -c tailwind/triborigen_bn.config.js -i tailwind/input.css -o css/tw/triborigen_bn.css --minify
npx tailwindcss@3.4.17 -c tailwind/triborigen_en.config.js -i tailwind/input.css -o css/tw/triborigen_en.css --minify
npx tailwindcss@3.4.17 -c tailwind/trimateria_bn.config.js -i tailwind/input.css -o css/tw/trimateria_bn.css --minify
npx tailwindcss@3.4.17 -c tailwind/trimateria_en.config.js -i tailwind/input.css -o css/tw/trimateria_en.css --minify
npx tailwindcss@3.4.17 -c tailwind/vesel_urbana.config.js -i tailwind/input.css -o css/tw/vesel_urbana.css --minify
echo "Tailwind CSS rebuilt in css/tw/"
