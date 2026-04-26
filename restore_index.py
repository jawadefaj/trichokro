# This script restores index.html from index_bn.html by replacing known Bangla phrases with English.
import re

bn_to_en = {
    "হোম": "HOME",
    "আমাদের সম্পর্কে": "ABOUT US",
    "প্রকৌশল": "ENGINEERING",
    "পণ্য": "PRODUCTS",
    "কেন আমরা": "WHY US",
    "প্রতিষ্ঠাতা": "FOUNDERS",
    "যোগাযোগ": "CONTACTS",
    "ট্রাম্বুলেন্স": "TRAMBULANCE",
    "পাবলিক ফাইল এবং রিসোর্স": "Public Files & Resources",
    "ডাউনলোড দেখুন": "View Downloads",
    "গ্যালারি": "Gallery",
    "ত্রিচক্র মুহূর্ত": "TriChokro Moments",
    "প্রকৌশল উৎকর্ষ": "Engineering Excellence",
    "এরোডাইনামিক ডিজাইন": "Aerodynamic Design",
    "হাইড্রোলিক ব্রেকিং": "Hydraulic Braking",
    "ট্রাস চ্যাসিস": "Truss Chassis",
    "LiFePO4 প্রযুক্তি": "LiFePO4 Technology",
    "কেন ত্রিচক্র?": "Why TriChokro?",
    "খরচ হ্রাস": "Cost Reduction",
    "০ নির্গমন": "0 Emission",
    "ভবিষ্যতের জন্য সুন্দর পৃথিবী": "Better World for future",
    "৩ গুণ": "3x",
    "নিরাপদ কাঠামো এবং ব্রেকিং": "Safer Structure & Braking",
    "অর্থনৈতিক প্রভাব": "The Economic Impact",
    "সহযোগিতা এবং স্বীকৃতি": "Collaboration and Recognition",
    "কোর টিম": "Core Team",
    "উপদেষ্টা বোর্ড": "Advisory Board",
    "জুনিয়র অ্যাসোসিয়েট": "Junior Associates",
    "লক্ষ্য ও উদ্দেশ্য": "Mission & Vision",
    "সময়রেখা": "Timeline",
    "অর্জনসমূহ": "Achievements",
    "যোগাযোগ করুন": "Get in Touch",
    "মিটিং বুক করুন": "Book Meeting",
    "ভিজিট করুন": "Visit",
    "কল করুন": "Call",
    "ইমেল": "Email",
    "ব্লগ ও খবর": "Blogs & News",
    "সম্পূর্ণ আর্টিকেল পড়ুন": "Read the full Article",
    "ভিডিও": "Videos",
    "রুহান এবং জুলস দ্বারা বিকশিত; সর্বস্বত্ব সংরক্ষিত, ত্রিচক্র ২০২৬": "Developed by Ruhan & Jules; All right reserved, TriChokro 2026",
    "ভিজিটর": "Visitors",
    "দেখতে ক্লিক করুন": "Click to Reveal",
    "দিকনির্দেশ পান": "Get Direction",
    "২০২৪ সাল থেকে বুয়েট ছাত্র ও অ্যালামনাইদের একটি স্টার্টআপ": "A Startup of BUET Students & Alumni Since 2024",
    "স্বল্পোন্নত দেশগুলোর জন্য নির্ভরযোগ্য ইলেকট্রিক বাহন": "Reliable Electric Mobility for LMICs",
    "শূন্য নির্গমন, প্রত্যাহারযোগ্য হুড, বাংলাদেশের রাস্তার জন্য তৈরি, হাইড্রোলিক ব্রেকের সুরক্ষা, এবং উন্নত সাসপেনশনের আরাম।": "Zero tailpipe emissions, retractable hood, Engineered for Bangladeshi Road, safety from hydraulic brake, comfort from superior suspension.",
    "যানবাহন দেখুন 🛺": "Explore Vehicles 🛺",
    "আমাদের টিম 👥": "Explore our team 👥",
    "ডিজাইন ও পণ্য": "Designs & Products",
    "বাংলাদেশের রাস্তার অনন্য চাহিদার জন্য প্রকৌশলকৃত। বুয়েটের মতোই টেকসই, দক্ষ ও নির্ভরযোগ্য।": "Engineered for the unique demands of Bangladesh's roads. Durable, efficient, reliable as BUET.",
    "সম্পূর্ণ স্পেসিফিকেশন দেখুন": "View Full Specifications",
    "বুয়েট মডেলের উন্নত সংস্করণ": "Improved Version of BUET's model",
    "টিআরসি- পাথফাইন্ডার": "TRC- Pathfinder",
    "সাধারণ যাত্রী ট্রাইহুইলার। হাইড্রোলিক ব্রেকিং, ম্যাকফারসন সাসপেনশন এবং প্রত্যাহারযোগ্য হুড।": "The common passenger Triwheeler. Hydraulic braking, MacPherson suspension, and retractable hood.",
    "রেঞ্জ": "Range",
    "১২০ কিমি": "120 km",
    "বৈশিষ্ট্য": "Features",
    "৫ জন যাত্রী, স্টিয়ারিং সিস্টেম": "5 People, Steering System, 6h Charge",
    "গতি": "Speed",
    "৫০ কিমি/ঘন্টা": "50 Km/h",
    "বিস্তারিত স্পেক": "Detailed Spec",
    "মেডিকেল ইমার্জেন্সি ট্রান্সপোর্টেশন": "Medical Emergency Transportation",
    "দ্রুত, সাশ্রয়ী, চপলা তিন চাকার অ্যাম্বুলেন্স। মেডিকেল-গ্রেড ইন্টেরিয়র সহ সরু গলিতে প্রবেশযোগ্য।": "Rapid, Affordable, Nimble three-wheeled ambulance. Access narrow lanes with medical-grade interior.",
    "১৫০ কিমি": "150 Km",
    "ধারণক্ষমতা": "Capacity",
    "রোগী + ৩ জন সেবাকারী": "Medical Equipment+ Patient+ 3 Caregiver",
    "৭০ কিমি/ঘন্টা": "70 Km/h",
    "ত্রিচক্র কার্গো": "TriChokro Cargo",
    "শহুরে ডেলিভারির জন্য হেভি ডিউটি লজিস্টিক সমাধান।": "Heavy duty logistics solution for urban delivery.",
    "আসছে ২০২৬": "Coming 2026",
    "আপনারটি কনফিগার করুন": "Configure Yours",
    "রওনক শাহরিয়ার রুহান": "Rownak Shahriar Ruhan",
    "প্রতিষ্ঠাতা, ত্রিচক্র": "Founder, TriChokro",
    "আমাদের সর্বশেষ প্রজেক্ট ভিডিও, টেস্ট ড্রাইভ এবং টেক ইনসাইট দেখুন": "Watch our latest project videos, test drives, and tech insights",
    "সর্বশেষ খবর এবং অর্জনের সাথে আপডেট থাকুন": "Stay updated with the latest news and achievements",
    "আমরা বাস্তব জগতের ড্রাইভারদের সুবিধা এবং শক্তিশালী পণ্যের বৈশিষ্ট্যগুলিকে একত্রিত করেছি। প্রতিটি উপাদান বাংলাদেশের জন্য স্থায়িত্ব এবং দক্ষতার জন্য নির্বাচিত 🇧🇩": "We combined real-world driver benefits with robust product features. Every component is chosen for durability and efficiency tweaked for Bangladesh 🇧🇩",
    "আমাদের অনন্য প্রত্যাহারযোগ্য হুড ডিজাইন প্রথাগত ফ্ল্যাট-ফ্রন্ট রিক্সার তুলনায় বাতাসের বাধা উল্লেখযোগ্যভাবে হ্রাস করে। এই অপ্টিমাইজেশনের ফলে প্রতি চার্জে ১৫% রেঞ্জ বৃদ্ধি পায় এবং উচ্চ গতিতে (৫০ কিমি/ঘন্টা পর্যন্ত) আরও ভাল স্থিতিশীলতা পাওয়া যায়।": "Our unique retractable hood design significantly reduces air drag coefficient compared to traditional flat-front rickshaws. This optimization leads to a 15% increase in range per charge and better stability at higher speeds (up to 50 km/h).",
    "নিরাপত্তা সর্বাগ্রে। আমরা স্ট্যান্ডার্ড মেকানিক্যাল ড্রাম ব্রেকগুলিকে ট্রিপল-ডিস্ক হাইড্রোলিক ব্রেকিং সিস্টেম (হাত, পা, হ্যান্ডেল) দিয়ে প্রতিস্থাপন করেছি। এটি ব্রেকিং দূরত্ব ৪০% কমিয়ে দেয় এবং ভারী ট্রাফিকে ব্রেক ফেল করার ঝুঁকি দূর করে।": "Safety is paramount. We replaced the standard mechanical drum brakes with a triple-disc hydraulic braking system (Hand, Foot, Handle). This reduces braking distance by 40% and eliminates the risk of brake fade in heavy traffic.",
    "ANSYS লোড সিমুলেশনের মাধ্যমে পরীক্ষিত, আমাদের টিউবুলার ট্রাস চ্যাসিস চাপ সমানভাবে বিতরণ করে। এটি প্রথাগত কৌণিক চ্যাসিসের চেয়ে ৩৫% হালকা তবুও ৮০% বেশি লোড (৭০০ কেজি পর্যন্ত) সমর্থন করে, কাঠামোগত ক্লান্তি প্রতিরোধ করে।": "Validated through ANSYS load simulations, our tubular truss chassis distributes stress evenly. It is 35% lighter than traditional angular chassis yet supports 80% more load (up to 700kg), preventing structural fatigue.",
    "আমরা লিথিয়াম আয়রন ফসফেট ব্যাটারি ব্যবহার করি যা ৩০০০+ চার্জ সাইকেল (লিড-এসিডের জন্য ৫০০ এর বিপরীতে) অফার করে। এগুলি বিষাক্ত নয়, বিস্ফোরক নয় এবং চার্জ লেভেল নির্বিশেষে ধারাবাহিক শক্তি আউটপুট প্রদান করে।": "We utilize Lithium Iron Phosphate batteries which offer 3000+ charge cycles (vs 500 for Lead-Acid). They are non-toxic, non-explosive, and provide consistent power output regardless of charge level.",
    "ড্রাইভার এবং পরিবেশের জন্য বাস্তব সুবিধা সহ টেকসই পরিবহনের ভবিষ্যৎ চালনা করা।": "Driving the future of sustainable transportation with tangible benefits for drivers and the environment.",
    "প্রথাগত ইঞ্জিনের তুলনায়, আমাদের ইভিগুলি দৈনিক খরচ কমিয়ে ড্রাইভারদের পকেটে বেশি টাকা রাখে।": "Compared to traditional combustion engines, our EVs drastically cut daily operational costs, putting more money in drivers' pockets.",
    "শূন্য টেলপাইপ নির্গমন মানে আমাদের শহরের জন্য পরিষ্কার বাতাস এবং পরবর্তী প্রজন্মের জন্য স্বাস্থ্যকর ভবিষ্যৎ।": "Zero tailpipe emissions mean cleaner air for our cities and a healthier future for the next generation.",
    "আমাদের ট্রিপল হাইড্রোলিক ডিস্ক ব্রেক সিস্টেম উচ্চতর থামানোর শক্তি প্রদান করে, যা ব্যস্ত রাস্তায় দুর্ঘটনার ঝুঁকি উল্লেখযোগ্যভাবে কমায়।": "Our triple hydraulic disk brake system provides superior stopping power, significantly reducing accident risks on busy roads.",
    "\"বাংলাদেশে উৎপাদন স্থানীয়করণের মাধ্যমে, আমরা কেবল আমদানি নির্ভরতা কমাই না বরং প্রকৌশল ও উৎপাদনে উচ্চ-দক্ষ কর্মসংস্থান তৈরি করি।\"": "\"By localizing production in Bangladesh, we not only reduce import reliance but also create high-skilled jobs in engineering and manufacturing.\"",
    "বুয়েটের ত্রিচক্র SOfE ফাইনাল ২০২৫-এ বিজয়ী স্থান অর্জন করেছে": "TriChokro from BUET Secures Winner Spots at SOfE Final 2025",
    "২৪ নভেম্বর, ২০২৫": "Nov 24, 2025",
    "অর্জন": "Achievement",
    "ফিরে যান": "Back",
    "ENGLISH": "ENGLISH",
    "হোম": "HOME"
}

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

for bn, en in bn_to_en.items():
    content = content.replace(bn, en)

# Fix Font
content = content.replace("font-family: 'Hind Siliguri', 'Inter', sans-serif;", "font-family: 'Inter', sans-serif;")
content = content.replace("font-family: 'Hind Siliguri', 'Cinzel', serif;", "font-family: 'Cinzel', serif;")
content = content.replace("&family=Hind+Siliguri:wght@300;400;500;600;700", "")

# Fix Links
content = content.replace('index_bn.html', 'index.html')
content = content.replace('founder_bn.html', 'founder.html')
content = content.replace('trambulance_bn.html', 'trambulance.html')
content = content.replace('pathfinder_bn.html', 'pathfinder.html')
content = content.replace('contact_bn.html', 'contact.html')
content = content.replace('blog_bn.html', 'blog.html')
content = content.replace('resources_bn.html', 'resources.html')
content = content.replace('privacy_bn.html', 'privacy.html')
content = content.replace('metadata_bn.html', 'metadata.html')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
    
print("Restored index.html")
