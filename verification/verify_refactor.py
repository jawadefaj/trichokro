from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load local file
        path = os.path.abspath("index.html")
        page.goto(f"file://{path}")

        # Wait for loader to disappear (logic in main.js)
        # Loader ID is 'loader'
        # It should fade out.

        # Check if console has errors
        page.on("console", lambda msg: print(f"Console log: {msg.text}"))

        # Wait for page to stabilize
        page.wait_for_timeout(3000)

        # Check if tabs are working (main.js handles switchTab)
        # Click a tab
        page.click("text=Mission & Vision")
        page.wait_for_timeout(1000)

        # Screenshot
        page.screenshot(path="verification/index_refactored.png")

        # Verify if gallery script loaded (check if gallery element exists)
        if page.query_selector("#gallery"):
            print("Gallery section found.")

        print("Verification script finished.")
        browser.close()

if __name__ == "__main__":
    run()
