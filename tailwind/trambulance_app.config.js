// Tailwind settings for trambulance_app.html (moved out of the page's inline script).
module.exports = {
  "theme": {
    "extend": {
      "fontFamily": {
        "sans": [
          "Plus Jakarta Sans",
          "sans-serif"
        ]
      },
      "animation": {
        "shimmer": "shimmer 1.6s infinite linear",
        "ping-slow": "ping 2.8s cubic-bezier(0, 0, 0.2, 1) infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "siren-flash": "sirenFlash 0.8s ease-in-out infinite",
        "bounce-gentle": "bounceGentle 1.2s ease-in-out infinite",
        "slideInUp": "slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
      },
      "keyframes": {
        "shimmer": {
          "0%": {
            "transform": "translateX(-120%)"
          },
          "100%": {
            "transform": "translateX(120%)"
          }
        },
        "sirenFlash": {
          "0%, 100%": {
            "opacity": "0.4",
            "transform": "scale(0.95)"
          },
          "50%": {
            "opacity": "1",
            "transform": "scale(1.15)"
          }
        },
        "bounceGentle": {
          "0%, 100%": {
            "transform": "translateY(0)"
          },
          "50%": {
            "transform": "translateY(-6px)"
          }
        },
        "slideInUp": {
          "from": {
            "transform": "translateY(120%)",
            "opacity": "0"
          },
          "to": {
            "transform": "translateY(0)",
            "opacity": "1"
          }
        }
      }
    }
  },
  "content": [
    "./trambulance_app.html",
    "./*.js",
    "./js/*.js"
  ]
};
