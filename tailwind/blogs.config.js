// Tailwind settings for blogs.html (moved out of the page's inline script).
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "brand": {
          "dark": "#0a192f",
          "light": "#112240",
          "lighter": "#233554",
          "green": "#64ffda",
          "greenDim": "rgba(100, 255, 218, 0.1)",
          "text": "#ccd6f6",
          "heading": "#e6f1ff"
        }
      },
      "fontFamily": {
        "sans": [
          "Inter",
          "Roboto",
          "sans-serif"
        ],
        "display": [
          "Cinzel",
          "serif"
        ],
        "mono": [
          "JetBrains Mono",
          "monospace"
        ],
        "serif": [
          "Cormorant Garamond",
          "serif"
        ]
      },
      "animation": {
        "spin-slow": "spin 25s linear infinite",
        "float": "float 8s ease-in-out infinite"
      },
      "keyframes": {
        "float": {
          "0%, 100%": {
            "transform": "translateY(0)"
          },
          "50%": {
            "transform": "translateY(-10px)"
          }
        }
      }
    }
  },
  "content": [
    "./blogs.html",
    "./*.js",
    "./js/*.js"
  ]
};
