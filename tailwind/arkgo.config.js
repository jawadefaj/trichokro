// Tailwind settings for arkgo.html (moved out of the page's inline script).
module.exports = {
  "theme": {
    "extend": {
      "fontFamily": {
        "display": [
          "Space Grotesk",
          "Inter",
          "sans-serif"
        ],
        "sans": [
          "Inter",
          "system-ui",
          "sans-serif"
        ],
        "mono": [
          "JetBrains Mono",
          "ui-monospace",
          "monospace"
        ]
      },
      "colors": {
        "arkDark": "#090b10",
        "arkSurface": "#11151f",
        "arkPanel": "#161b26",
        "arkRed": "#e11d48",
        "arkCyan": "#38bdf8",
        "arkAmber": "#f59e0b",
        "arkGreen": "#10b981"
      }
    }
  },
  "content": [
    "./arkgo.html",
    "./*.js",
    "./js/*.js"
  ]
};
