from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Verify English Page
        index_path = os.path.abspath("index.html")
        print(f"Navigating to {index_path}")
        page.goto(f"file://{index_path}")

        # Scroll to products to ensure animations trigger (reveal-on-scroll)
        page.locator("#products").scroll_into_view_if_needed()
        page.wait_for_timeout(1000) # Wait for animations

        # Take screenshot of products section
        page.locator("#products").screenshot(path="verification/index_products.png")
        print("Captured verification/index_products.png")

        # Verify Bangla Page
        index_bn_path = os.path.abspath("index_bn.html")
        print(f"Navigating to {index_bn_path}")
        page.goto(f"file://{index_bn_path}")

        page.locator("#products").scroll_into_view_if_needed()
        page.wait_for_timeout(1000)

        page.locator("#products").screenshot(path="verification/index_bn_products.png")
        print("Captured verification/index_bn_products.png")

        browser.close()

if __name__ == "__main__":
    run()
