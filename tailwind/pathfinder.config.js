// Tailwind settings for pathfinder.html (moved out of the page's inline script).
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "brand": {
          "dark": "#02040a",
          "light": "#0a101f",
          "lighter": "#1e293b",
          "green": "#00e5ff",
          "greenDim": "rgba(0, 229, 255, 0.1)",
          "orange": "#ff6d00",
          "text": "#e2e8f0",
          "heading": "#f8fafc"
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
        "spin-slow": "spin 15s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.6s ease-out",
        "fade-in": "fade-in 0.8s ease-out"
      },
      "keyframes": {
        "float": {
          "0%, 100%": {
            "transform": "translateY(0)"
          },
          "50%": {
            "transform": "translateY(-20px)"
          }
        },
        "pulse-glow": {
          "0%, 100%": {
            "boxShadow": "0 0 20px rgba(0, 229, 255, 0.3)"
          },
          "50%": {
            "boxShadow": "0 0 40px rgba(0, 229, 255, 0.6)"
          }
        },
        "slide-up": {
          "from": {
            "transform": "translateY(30px)",
            "opacity": "0"
          },
          "to": {
            "transform": "translateY(0)",
            "opacity": "1"
          }
        },
        "fade-in": {
          "from": {
            "opacity": "0"
          },
          "to": {
            "opacity": "1"
          }
        }
      }
    }
  },
  "content": [
    "./pathfinder.html",
    "./*.js",
    "./js/*.js"
  ]
};
