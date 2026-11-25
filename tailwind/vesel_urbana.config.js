// Tailwind settings for vesel_urbana.html (moved out of the page's inline script).
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "urbana": {
          "DEFAULT": "#f2492e",
          "light": "#ff7a5c",
          "deep": "#b8301a"
        },
        "studio": "#aaabaf"
      },
      "fontFamily": {
        "sans": [
          "Inter",
          "Roboto",
          "system-ui",
          "sans-serif"
        ],
        "mono": [
          "JetBrains Mono",
          "ui-monospace",
          "monospace"
        ]
      }
    }
  },
  "content": [
    "./vesel_urbana.html",
    "./*.js",
    "./js/*.js"
  ]
};
