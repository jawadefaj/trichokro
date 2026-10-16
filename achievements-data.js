/* ======================================================================
   TRICHOKRO ACHIEVEMENTS: the one file to edit.
   Both achievements.html and achievement-details.html read from here.

   To add an achievement: copy one block, give it a unique id, and put it
   in date order. "type" decides the filter it shows under:
     "win"       titles and awards
     "funding"   grants and funds
     "selection" finalist, top-N and programme selections

   Links go in three groups:
     news   articles that mention TriChokro
     event  official pages about the competition or programme
     ours   TriChokro blog posts, Facebook posts, videos
   Each link: { title: "...", source: "...", url: "https://..." }
   Empty groups are hidden automatically.
   ====================================================================== */

window.TC_ACHIEVEMENTS = [
  {
    id: "uihp-champion",
    year: 2025, date: "July 2025", place: "Dhaka, Bangladesh",
    type: "win",
    title: "Champion, University Innovation Hub Program",
    short: "Champion of UIHP, run by the ICT Division and BUET, with funding from BUET Alumni and private investors.",
    org: "ICT Division and BUET",
    image: "images/logo-uihp.jpg", imageFit: "banner",
    story: [
      "Project TriChokro was crowned champion of the University Innovation Hub Program (UIHP), an initiative run by the ICT Division and BUET.",
      "The win brought essential funding from BUET Alumni and private investors to keep building the Trambulance."
    ],
    facts: ["Champion", "Alumni and investor funding"],
    links: {
      news: [],
      event: [
        { title: "University Innovation Hub Program", source: "Bangladesh Hi-Tech Park Authority", url: "https://deied.bhtpa.gov.bd/programs" }
      ],
      ours: [
        { title: "Victory at UIHP: 80,000 BDT grant", source: "TriChokro blog", url: "https://trichokro.com/blog.html?post=uihp" }
      ]
    }
  },
  {
    id: "sofe-national-champion",
    year: 2025, date: "November 2025", place: "Bangladesh",
    type: "win",
    title: "National Champion, Speak Out for Engineers",
    short: "Praised for the 3D-designed truss chassis and the origami-inspired aerodynamic hood.",
    org: "Institution of Mechanical Engineers (IMechE)",
    image: "images/sofe-national-champion.jpg",
    prize: "€300",
    story: [
      "Trambulance was named National Champion of Speak Out for Engineers (SofE) Bangladesh, organised by the Institution of Mechanical Engineers.",
      "Judges singled out its technical work, in particular the 3D-designed truss chassis and the aerodynamic, origami-inspired hood system. A. A. M. Rownak Shahriar Ruhan presented for the team."
    ],
    facts: ["National Champion", "€300 prize"],
    links: {
      news: [],
      event: [ { title: "Institution of Mechanical Engineers", source: "imeche.org", url: "https://www.imeche.org" } ],
      ours: [ { title: "TriChokro wins SOfE Final 2025", source: "TriChokro blog", url: "https://trichokro.com/blog.html?post=sofe" } ]
    }
  },
  {
    id: "first-flight-grant",
    year: 2026, date: "January 2026", place: "North Carolina, USA",
    type: "funding",
    title: "$3,500 grant from First Flight Venture Center",
    short: "International backing for Trambulance as a high-science, high-impact startup.",
    org: "First Flight Venture Center (FFVC)",
    image: "images/logo-first-flight.png", imageFit: "logo",
    prize: "$3,500",
    story: [
      "Trambulance secured a $3,500 grant from the First Flight Venture Center, North Carolina's leading science incubator.",
      "The grant recognises the project as a high-science, high-impact startup and was TriChokro's first international funding."
    ],
    facts: ["$3,500 grant", "First international funding"],
    links: {
      news: [], event: [],
      ours: [ { title: "3,500 USD from First Flight Venture", source: "TriChokro blog", url: "https://trichokro.com/blog.html?post=ffvc" } ]
    }
  },
  {
    id: "buet-alumni-fund",
    year: 2026, date: "Early 2026", place: "BUET, Dhaka",
    type: "funding",
    title: "BUET Alumni fund for the South Asia final",
    short: "Travel support for the regional final, plus a pledge of further help from the DSW office.",
    org: "BUET and the Directorate of Students' Welfare",
    image: "images/buet-alumni-fund.jpg",
    prize: "৳20,000",
    story: [
      "BUET awarded a ৳20,000 Alumni fund to cover costs for the South Asia regional final.",
      "The DSW office also pledged further help and financial support to grow TriChokro as a student startup."
    ],
    facts: ["৳20,000 fund", "DSW support"],
    gallery: ["images/trambulance-prototype-buet.jpg"],
    links: {
      news: [],
      event: [ { title: "Bangladesh University of Engineering and Technology", source: "buet.ac.bd", url: "https://www.buet.ac.bd" } ],
      ours: []
    }
  },
  {
    id: "south-asia-runner-up",
    year: 2026, date: "3 March 2026", place: "Maldives",
    type: "win",
    title: "1st Runner-up, South Asia Speak Out for Engineers",
    short: "Rownak Shahriar Ruhan represented Bangladesh and placed second in the region.",
    org: "IMechE South Asia regional final",
    image: "images/south-asia-runnerup-maldives.jpg",
    prize: "€300",
    story: [
      "Representing Bangladesh as national winner, Rownak Shahriar Ruhan presented the Trambulance at the IMechE South Asia Speak Out for Engineers final in the Maldives and took first runner-up.",
      "Together with the national title, this brought TriChokro's IMechE prize money to €600."
    ],
    facts: ["1st Runner-up", "€300 prize", "€600 total from IMechE"],
    gallery: ["images/imeche-award-ceremony.jpg"],
    links: {
      news: [],
      event: [ { title: "Institution of Mechanical Engineers", source: "imeche.org", url: "https://www.imeche.org" } ],
      ours: []
    }
  },
  {
    id: "hult-national-finalist",
    year: 2026, date: "8 May 2026", place: "KUET, Khulna",
    type: "selection",
    title: "Top 8, Hult Prize Bangladesh National",
    short: "Reached the top 8 of 55 finalist teams at the national round.",
    org: "Hult Prize Bangladesh",
    tile: "Hult Prize",
    story: [ "TriChokro reached the top 8 of 55 finalist teams at the Hult Prize Bangladesh national round, held at KUET." ],
    facts: ["Top 8 of 55"],
    links: {
      news: [],
      event: [ { title: "Hult Prize", source: "hultprize.org", url: "https://www.hultprize.org" } ],
      ours: []
    }
  },
  {
    id: "unido-cleantech-top-30",
    year: 2026, date: "2026", place: "Gazipur, Bangladesh",
    type: "selection",
    title: "Top 30, UNIDO Cleantech sustainability programme",
    short: "Selected for a three-day cleantech bootcamp run by UNIDO with the Government of Norway.",
    org: "UNIDO, with the Government of Norway",
    tile: "UNIDO",
    story: [ "TriChokro was selected among the top 30 teams in a cleantech sustainability competition run by UNIDO with the Government of Norway, and joined a three-day bootcamp in Gazipur." ],
    facts: ["Top 30", "3-day bootcamp"],
    links: {
      news: [],
      event: [ { title: "United Nations Industrial Development Organization", source: "unido.org", url: "https://www.unido.org" } ],
      ours: []
    }
  },
  {
    id: "bangkok-business-challenge",
    year: 2026, date: "21–23 May 2026", place: "Sasin School of Management, Bangkok",
    type: "win", featured: true,
    title: "HRH Princess Maha Chakri Sirindhorn's Sustainability Award",
    event: "Bangkok Business Challenge 2026",
    short: "Sustainability Award and USD 5,000 at Asia's longest-running student startup competition, chosen from 385 teams across 20 countries.",
    org: "Sasin School of Management, Chulalongkorn University, with SCG Chemicals",
    image: "images/bangkok-business-challenge-2026.jpg",
    prize: "$5,000",
    story: [
      "TriChokro Trambulance received HRH Princess Maha Chakri Sirindhorn's Sustainability Award at the Bangkok Business Challenge 2026, along with a cash prize of USD 5,000.",
      "Now in its 24th year, the Bangkok Business Challenge is Asia's longest-running student startup competition. This year 385 teams from 83 universities in 20 countries applied. TriChokro advanced through the semi-finals of 20 teams to the final round, held at Sasin School of Management, Chulalongkorn University, from 21 to 23 May 2026."
    ],
    facts: ["Sustainability Award", "$5,000 prize", "385 teams, 20 countries"],
    links: {
      news: [
        { title: "Bangkok Business Challenge 2026 honors global student innovators with royal awards", source: "Chulalongkorn University", url: "https://www.chula.ac.th/en/news/410126/" },
        { title: "University of Texas at Austin's Imagine Devices wins Bangkok Business Challenge 2026", source: "Sasin School of Management", url: "https://www.sasin.edu/content/news/university-of-texas-at-austins-imagine-devices-wins-bangkok-business-challenge-2026-powered-by-scgc" },
        { title: "Global Competition Winner of the Bangkok Business Challenge 2026", source: "SCG Chemicals", url: "https://www.scgchemicals.com/en/articles/news/global-competition-winner-bangkok-business-challenge-2026-powered-scgc" },
        { title: "Imagine Devices: Global Competition Winner of the Bangkok Business Challenge 2026 (press release)", source: "Polymerupdate", url: "https://www.polymerupdate.com/PressRelease/Details/41000" },
        { title: "Bangkok Business Challenge 2026 winners announced (press release)", source: "ThaiPR.net", url: "https://www.thaipr.net/?p=3725757" }
      ],
      event: [
        { title: "Global Competition 2026 winners announcement", source: "Bangkok Business Challenge", url: "https://bbc.sasin.edu/2026/content/global-competition-2026-winner-team-imagine-devices-from-the-university-of-texas-at-austin-united-states-of-america" },
        { title: "Sasin and SCGC present BBC 2026: the 20 semi-finalist teams", source: "Sasin School of Management", url: "https://www.sasin.edu/content/news/sasin-scgc-present-bbc2026" },
        { title: "Sasin and SCGC launch Bangkok Business Challenge 2026", source: "SCG Chemicals", url: "https://www.scgchemicals.com/en/articles/news/sasin-scgc-launch-bangkok-business-challenge-2026-accelerate-sustainable-impact-driven-startups" },
        { title: "Royal award ceremony for Bangkok Business Challenge 2026 (Thai)", source: "Chulalongkorn University", url: "https://www.chula.ac.th/news/409547/" }
      ],
      ours: [
        { title: "Bangkok Business Challenge on Facebook", source: "facebook.com", url: "https://www.facebook.com/bangkokbusinesschallenge" }
      ]
    }
  },
  {
    id: "uihp-innovation-challenge-2026",
    year: 2026, date: "June 2026", place: "Bangladesh",
    type: "win",
    title: "Most Creative and Impactful Idea, UIHP Innovation Challenge 2026",
    short: "Award at the national round of the University Innovation Hub Program's Innovation Challenge.",
    org: "University Innovation Hub Program (UIHP)",
    image: "images/logo-uihp.jpg", imageFit: "banner",
    story: [
      "TriChokro Automotives received the Most Creative and Impactful Idea Award at the national round of the UIHP Innovation Challenge 2026.",
      "It is TriChokro's second UIHP honour, a year after winning the programme's championship in July 2025."
    ],
    facts: ["Most Creative and Impactful Idea", "National round"],
    links: {
      news: [],
      event: [ { title: "University Innovation Hub Program", source: "Bangladesh Hi-Tech Park Authority", url: "https://deied.bhtpa.gov.bd/programs" } ],
      ours: []
    }
  },
  {
    id: "koica-ice-top-40",
    year: 2026, date: "August 2026", place: "University of Dhaka",
    type: "selection",
    title: "Top 40, entrepreneurship programme by ICE Center DU and KPC",
    short: "Selected for the next phase: a four-month entrepreneurship course at the University of Dhaka.",
    org: "ICE Center, University of Dhaka, and Korea Productivity Center, with KOICA",
    tile: "ICE × KPC",
    story: [
      "TriChokro Automotives was placed in the top 40 of an idea competition and selected for the next phase: a four-month entrepreneurship course developed jointly by the Innovation, Creativity and Entrepreneurship (ICE) Center at the University of Dhaka and the Korea Productivity Center (KPC).",
      "TriChokro's founders and members will attend the classes on the University of Dhaka campus."
    ],
    facts: ["Top 40", "4-month course"],
    links: { news: [], event: [], ours: [] }
  },
  {
    id: "first-capital-startup-nation",
    year: 2026, date: "August 2026", place: "Bangladesh",
    type: "selection",
    title: "Top 25 Startups, First Capital Startup Nation 2026",
    short: "Selected in Bangladesh's Top 50, then advanced to the Top 25 after the next evaluation.",
    org: "First Capital Startup Nation 2026",
    tile: "Top 25",
    story: [
      "First Capital Startup Nation 2026 selects promising emerging startups in Bangladesh through several rounds of evaluation.",
      "TriChokro Automotives was first chosen as one of Bangladesh's Top 50 Startups, then advanced to the Top 25 after the next round. The team is now preparing for the next stage."
    ],
    facts: ["Top 50", "Top 25", "Next stage ahead"],
    links: { news: [], event: [], ours: [] }
  },
  {
    id: "world-startup-championship",
    year: 2026, date: "20–23 August 2026", place: "Expo Centre, Lahore, Pakistan",
    type: "selection",
    title: "Finalist, World Startup Championship 2026",
    short: "Selected as a finalist at SEE Pakistan 2026, which drew more than 4,000 startups from 300 universities.",
    org: "SEE Pakistan 2026",
    tile: "WSC 2026",
    story: [
      "TriChokro Automotives was selected to attend the World Startup Championship 2026 in Lahore as a finalist.",
      "The championship is the highlight of the SEE Pakistan Entrepreneurial Expo, which selected from more than 4,000 startups across 300 universities. The finals ran from 20 to 23 August 2026 at the Expo Centre, Lahore."
    ],
    facts: ["Finalist", "4,000+ startups"],
    links: {
      news: [],
      event: [
        { title: "SEE Pakistan", source: "seepakistan.com.pk", url: "https://seepakistan.com.pk" },
        { title: "World Startup Championship 2026 overview", source: "fundsforNGOs", url: "https://www2.fundsforngos.org/innovation/applications-open-for-world-startup-championship-2026-pakistan/" }
      ],
      ours: []
    }
  }
];

/* Display order is by date. UNIDO's exact date is unknown; it sits after Hult for now. */
window.TC_TYPES = { win: "Awards", funding: "Grants & funding", selection: "Selections" };
