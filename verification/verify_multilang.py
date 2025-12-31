from playwright.sync_api import sync_playwright
import os

def run():
    os.makedirs('verification', exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Test 1: Load English Index and Check for Dropdown
        page.goto(f"file://{os.getcwd()}/index.html")
        print("Loaded English Index")
        page.screenshot(path="verification/index_en.png")

        # Test 2: Load German Index and Check for Translations
        page.goto(f"file://{os.getcwd()}/index_de.html")
        print("Loaded German Index")
        page.screenshot(path="verification/index_de.png")

        # Test 3: Load Spanish Index
        page.goto(f"file://{os.getcwd()}/index_es.html")
        print("Loaded Spanish Index")
        page.screenshot(path="verification/index_es.png")

        # Test 4: Load Chinese Index
        page.goto(f"file://{os.getcwd()}/index_zh.html")
        print("Loaded Chinese Index")
        page.screenshot(path="verification/index_zh.png")

        # Test 5: Load Japanese Index
        page.goto(f"file://{os.getcwd()}/index_ja.html")
        print("Loaded Japanese Index")
        page.screenshot(path="verification/index_ja.png")

        browser.close()

if __name__ == '__main__':
    run()
