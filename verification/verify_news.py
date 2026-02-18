import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        # Check index.html
        print("Checking index.html...")
        page.goto(f"file://{os.path.abspath('index.html')}")
        # Wait for the Blogs & News section
        section = page.locator("#blogs")
        section.scroll_into_view_if_needed()
        page.wait_for_timeout(2000) # Wait for animations to settle
        section.screenshot(path="news_section_element_en.png")
        print("Screenshot saved to news_section_element_en.png")

        # Check index_bn.html
        print("Checking index_bn.html...")
        page.goto(f"file://{os.path.abspath('index_bn.html')}")
        # Wait for the Blogs & News section
        section = page.locator("#blogs")
        section.scroll_into_view_if_needed()
        page.wait_for_timeout(2000) # Wait for animations to settle
        section.screenshot(path="news_section_element_bn.png")
        print("Screenshot saved to news_section_element_bn.png")

        browser.close()

if __name__ == "__main__":
    run()
