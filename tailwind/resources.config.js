// Tailwind settings for resources.html (moved out of the page's inline script).
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "emerald": {
          "400": "#34d399",
          "500": "#10b981",
          "900": "#064e3b"
        },
        "slate": {
          "800": "#1e293b",
          "900": "#0f172a",
          "950": "#020617"
        }
      },
      "fontFamily": {
        "sans": [
          "Inter",
          "sans-serif"
        ],
        "display": [
          "Cinzel",
          "serif"
        ]
      }
    }
  },
  "content": [
    "./resources.html",
    "./*.js",
    "./js/*.js"
  ]
};
