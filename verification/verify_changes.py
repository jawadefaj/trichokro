from playwright.sync_api import sync_playwright
import os

def check_pages():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Check index_zh.html for font usage
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index_zh.html")

        # Take a screenshot of the Chinese page
        page.screenshot(path="verification/index_zh.png")

        # Check for Noto Sans SC in computed style of body
        font_family = page.eval_on_selector("body", "el => getComputedStyle(el).fontFamily")
        print(f"Index ZH Body Font Family: {font_family}")

        # Check for favicon
        favicon = page.get_attribute("link[rel='icon']", "href")
        print(f"Index ZH Favicon: {favicon}")

        # Check index.html for favicon
        page.goto(f"file://{cwd}/index.html")
        favicon_en = page.get_attribute("link[rel='icon']", "href")
        print(f"Index EN Favicon: {favicon_en}")

        browser.close()

if __name__ == "__main__":
    check_pages()
