# Oracle Cloud ফ্রি সার্ভারে Trambulance ম্যাপ সার্ভার

এই ফোল্ডারটা দিয়ে Oracle Cloud-এর **Always Free** সার্ভারে তিনটা জিনিস চালানো হয়:

| সেবা | কাজ |
|---|---|
| **OSRM** | অ্যাম্বুলেন্সের রুট আর কত মিনিট লাগবে তার হিসাব |
| **Nominatim** | ঠিকানা খোঁজা (যেমন "Dhanmondi 27") আর লোকেশন থেকে ঠিকানা বের করা |
| **PMTiles** | পুরো বাংলাদেশের ম্যাপ একটা ফাইলে |

ডাটাবেস, লগইন আর পেমেন্ট আগের মতোই Supabase-এ থাকবে। এই সার্ভার শুধু ম্যাপের কাজ করে।

**নিরাপত্তা:** আপনার সার্ভার কোনো কারণে বন্ধ থাকলে অ্যাপ নিজে থেকেই OpenStreetMap-এর পাবলিক সার্ভারে চলে যায়। তাই সার্ভার বন্ধ হলেও রোগীর বুকিং আটকাবে না।

পুরোটা ফ্রি। Oracle শুধু পরিচয় যাচাইয়ের জন্য একটা কার্ড চায়, টাকা কাটে না।

---

## ধাপ ১: Oracle Cloud অ্যাকাউন্ট খুলুন

1. **cloud.oracle.com**-এ গিয়ে **Sign up** করুন।
2. **Home Region** হিসেবে **Singapore** বা **India South (Hyderabad)** বেছে নিন। এটা পরে আর বদলানো যায় না, আর বাংলাদেশ থেকে এগুলোই সবচেয়ে কাছে।
3. কার্ডের তথ্য দিন। এটা শুধু যাচাইয়ের জন্য।

## ধাপ ২: সার্ভার (VM) বানান

1. মেনু থেকে **Compute → Instances → Create instance**-এ যান।
2. **Image**-এ **Canonical Ubuntu 24.04** বেছে নিন। নামের শেষে **aarch64** আছে কিনা দেখে নিন।
3. **Shape**-এ **Ampere → VM.Standard.A1.Flex** বেছে নিন। **OCPU 2** আর **Memory 12 GB** দিন। এটাই এখন ফ্রি সীমা।
4. **Boot volume**-এ **Specify a custom boot volume size** চালু করে **100 GB** দিন। ফ্রিতে মোট ২০০ GB পর্যন্ত পাওয়া যায়।
5. **Add SSH keys**-এ **Generate a key pair** চাপুন, তারপর **Save private key** দিয়ে চাবির ফাইলটা নামিয়ে রাখুন। এটা হারালে সার্ভারে আর ঢুকতে পারবেন না।
6. **Create** চাপুন। কয়েক মিনিট পর **Public IP address** দেখাবে, সেটা লিখে রাখুন।

> "Out of capacity" লেখা এলে অন্য **Availability domain** বেছে আবার চেষ্টা করুন, অথবা কয়েক ঘণ্টা পরে চেষ্টা করুন। ফ্রি সার্ভারের চাহিদা বেশি, তাই এটা প্রায়ই হয়।

## ধাপ ৩: ওয়েবের জন্য পোর্ট খুলুন

1. সার্ভারের পাতায় **Primary VNIC → Subnet**-এ ক্লিক করুন।
2. সেখান থেকে **Security Lists → Default Security List → Add Ingress Rules**-এ যান।
3. দুটো নিয়ম যোগ করুন। দুটোতেই Source CIDR হবে `0.0.0.0/0` আর IP Protocol **TCP**:
   - Destination port **80**
   - Destination port **443**

## ধাপ ৪: ফ্রি ডোমেইন নিন (DuckDNS)

ফোন শুধু HTTPS ঠিকানায় কথা বলে, আর HTTPS-এর জন্য একটা ডোমেইন নাম লাগে।

1. **duckdns.org**-এ Google দিয়ে লগইন করুন।
2. একটা নাম লিখুন, যেমন `trambulance-map`, তারপর **add domain** চাপুন।
3. **current ip** ঘরে ধাপ ২-এর Public IP বসিয়ে **update ip** চাপুন।

আপনার ঠিকানা হবে `trambulance-map.duckdns.org`।

## ধাপ ৫: সার্ভারে সেটআপ চালান

আপনার কম্পিউটারে Terminal খুলুন (Windows-এ PowerShell)। যে ফোল্ডারে চাবির ফাইল রেখেছেন সেখান থেকে চালান:

```bash
# server ফোল্ডারটা সার্ভারে পাঠান
scp -i ssh-key.key -r trambulance/server ubuntu@আপনার_IP:~/

# সার্ভারে ঢুকুন
ssh -i ssh-key.key ubuntu@আপনার_IP
```

সার্ভারে ঢোকার পর এটা চালান। `DOMAIN` আর `EMAIL` নিজের মতো বদলে নিন:

```bash
cd ~/server
DOMAIN=trambulance-map.duckdns.org EMAIL=apnar@gmail.com bash setup.sh
```

স্ক্রিপ্টটা নিজে থেকে এগুলো করবে:

1. সার্ভারের ফায়ারওয়ালে পোর্ট খুলবে।
2. Docker ইনস্টল করবে।
3. বাংলাদেশের ম্যাপ ডাটা নামাবে।
4. রুটের নেটওয়ার্ক বানাবে।
5. ম্যাপ ফাইল কাটবে।
6. HTTPS চালু করবে।
7. প্রতি সপ্তাহে ম্যাপ আপডেটের ব্যবস্থা করবে।

এতে ৩০–৬০ মিনিট লাগে।

শেষে স্ক্রিন এরকম চারটা লাইন দেখাবে:

```
"EXPO_PUBLIC_OSRM_URL": "https://trambulance-map.duckdns.org/osrm",
"EXPO_PUBLIC_NOMINATIM_URL": "https://trambulance-map.duckdns.org/nominatim",
"EXPO_PUBLIC_PMTILES_URL": "https://trambulance-map.duckdns.org/tiles/bangladesh.pmtiles",
"EXPO_PUBLIC_MAP_KEY": "এলোমেলো-লম্বা-চাবি"
```

> ঠিকানা খোঁজার ডাটাবেস (Nominatim) এরপরও ব্যাকগ্রাউন্ডে কয়েক ঘণ্টা ধরে তৈরি হতে থাকে। এই সময়টায় অ্যাপ পাবলিক সার্চ সার্ভার ব্যবহার করবে, তাই অপেক্ষা করার দরকার নেই।

## ধাপ ৬: অ্যাপে বসান

1. `app/eas.json`-এ `build → base → env`-এর ভেতরে ওই চারটা লাইনের মান বসান। `YOUR-MAP-DOMAIN` লেখা পুরনো মানগুলো বদলে দিন।
2. নতুন APK বানান:

```bash
cd trambulance/app
npx eas-cli@latest build -p android --profile preview
```

GitHub Actions দিয়ে APK বানালে মানগুলো অন্য জায়গায় বসাতে হবে:

- **Variables**-এ `OSRM_URL`, `NOMINATIM_URL`, `PMTILES_URL`
- **Secrets**-এ `MAP_KEY`

**চাবির ব্যাপারে:** `MAP_KEY` চাবিটা অ্যাপের ভেতরে থাকে, তাই এটা পুরোপুরি গোপন নয়। তবে এটা অচেনা লোক বা বটকে আপনার সার্ভার ব্যবহার করা থেকে আটকায়। চাবি কখনো ফাঁস হলে সার্ভারের `.env` ফাইলে `ACCESS_KEY` বদলে `sudo docker compose up -d` চালান, তারপর নতুন চাবি দিয়ে APK বানান।

---

## সব ঠিক চলছে কিনা দেখা

সার্ভারে ঢুকে `~/server` ফোল্ডার থেকে এগুলো চালান:

```bash
curl https://trambulance-map.duckdns.org/health        # "ok" দেখালে HTTPS চালু
sudo docker compose ps                                  # তিনটা সার্ভিসই "running" থাকা উচিত
sudo docker compose logs -f nominatim                   # ঠিকানা খোঁজার ডাটাবেস কতদূর এগোলো
sudo docker compose logs --tail 50 caddy                # HTTPS সার্টিফিকেটের কোনো সমস্যা থাকলে এখানে দেখাবে
tail -50 update.log                                     # সাপ্তাহিক আপডেটের রিপোর্ট
df -h /                                                 # ডিস্কে কতটা জায়গা খালি আছে
```

## সাপ্তাহিক আপডেট

প্রতি রবিবার ভোর ৩টায় (বাংলাদেশ সময়) সার্ভার নিজে থেকে নতুন রাস্তার ডাটা আর ম্যাপ নামায়। ঠিকানা খোঁজার ডাটা Geofabrik থেকে প্রতিদিন নিজেই আপডেট হয়। হাতে আপডেট চালাতে চাইলে:

```bash
cd ~/server && bash update.sh
```

## Oracle-এর "অলস সার্ভার" নিয়ম

টানা ৭ দিন CPU, নেটওয়ার্ক আর RAM—তিনটার ব্যবহারই ২০%-এর নিচে থাকলে Oracle ফ্রি সার্ভার বন্ধ করে দিতে পারে। এই সার্ভারে রুটের ডাটা আর ঠিকানার ডাটাবেস সবসময় RAM-এ থাকে, তাই সাধারণত RAM-এর ব্যবহার ২০%-এর উপরে থাকে।

এক সপ্তাহ পর Oracle Console-এ **Instance → Metrics**-এ গিয়ে **Memory Utilization** দেখে নিন। কখনো সার্ভার বন্ধ হলেও অ্যাপ পাবলিক সার্ভারে চলে যাবে। তখন Console থেকে **Start** চাপলেই সার্ভার আবার চালু হয়ে যায়।

## সমস্যা হলে

| সমস্যা | সমাধান |
|---|---|
| `curl .../health` কাজ করছে না | ধাপ ৩-এর পোর্ট ৮০/৪৪৩ খোলা হয়েছে কিনা দেখুন। DuckDNS-এ IP ঠিক আছে কিনা দেখুন। |
| Caddy লগে "certificate" error | DuckDNS-এর IP সার্ভারের Public IP-র সাথে মিলছে কিনা দেখুন, তারপর `sudo docker compose restart caddy` চালান। |
| সেটআপ মাঝপথে থেমে গেছে | একই কমান্ড আবার চালান। আগের সেটিংস (`.env`) থেকে যায়। |
| ডিস্ক ভরে গেছে | `sudo docker system prune -f` চালান। |
| অ্যাপে ম্যাপ দেখা যাচ্ছে কিন্তু রাস্তা অন্যরকম | অ্যাপ সম্ভবত পাবলিক সার্ভারে চলে গেছে। `health` চেক করুন। |
