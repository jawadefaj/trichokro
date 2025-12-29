from playwright.sync_api import sync_playwright
import os

def verify_experience():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use desktop size
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")
        page.wait_for_load_state("networkidle")

        print("Checking for experience.js script...")
        script = page.locator("script[src='js/experience.js']")
        if script.count() > 0:
            print("SUCCESS: js/experience.js found.")
        else:
            print("FAILURE: js/experience.js not found.")

        print("Checking for Typing Effect...")
        # The typing effect adds 'typing-active' class and then removes it
        # We might miss it if it's fast, but we can check if the H1 has the class 'type-me'
        h1 = page.locator("h1.type-me")
        if h1.count() > 0:
            print("SUCCESS: H1 has 'type-me' class.")
        else:
            print("FAILURE: H1 missing 'type-me' class.")

        print("Checking Intro Overlay...")
        # Check if overlay exists (it might be hidden after 2.5s)
        # We can try to catch it or check if it was added to DOM
        # Since we waited networkidle, it might already be gone or fading.
        # Let's check sessionStorage
        val = page.evaluate("sessionStorage.getItem('introPlayed')")
        print(f"SessionStorage introPlayed: {val}")

        # Take screenshot of home
        page.screenshot(path="verification/home_experience.png")
        print("Saved verification/home_experience.png")

        print("Checking New Pages...")
        # Engineering
        page.goto(f"file://{cwd}/engineering.html")
        page.wait_for_load_state("networkidle")
        if "Engineering Excellence" in page.title():
            print("SUCCESS: Engineering page loaded.")
        else:
            print("FAILURE: Engineering page title mismatch.")
        page.screenshot(path="verification/engineering_page.png")

        # Why Us
        page.goto(f"file://{cwd}/why.html")
        page.wait_for_load_state("networkidle")
        if "Why TriChokro?" in page.title():
            print("SUCCESS: Why Us page loaded.")
        else:
            print("FAILURE: Why Us page title mismatch.")
        page.screenshot(path="verification/why_page.png")

        browser.close()

if __name__ == "__main__":
    verify_experience()
