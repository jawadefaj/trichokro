from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Determine the absolute path to index.html
        cwd = os.getcwd()
        file_path = f"file://{cwd}/index.html"

        print(f"Navigating to {file_path}")
        page.goto(file_path)

        # Wait for gallery to load (it might take a moment if using Promise.all)
        page.wait_for_timeout(2000) # Wait 2 seconds for JS to execute

        # Take screenshot
        screenshot_path = "verification/index_gallery.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        # Also check index_bn.html
        file_path_bn = f"file://{cwd}/index_bn.html"
        print(f"Navigating to {file_path_bn}")
        page.goto(file_path_bn)
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/index_bn_gallery.png", full_page=True)
        print("Screenshot saved to verification/index_bn_gallery.png")

        # Check index_de.html
        file_path_de = f"file://{cwd}/index_de.html"
        print(f"Navigating to {file_path_de}")
        page.goto(file_path_de)
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/index_de_gallery.png", full_page=True)
        print("Screenshot saved to verification/index_de_gallery.png")

        browser.close()

if __name__ == "__main__":
    run()
