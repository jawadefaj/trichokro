from playwright.sync_api import sync_playwright
import os

def check_pages():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Check contact_zh.html for font usage (subpage check)
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/contact_zh.html")

        # Take a screenshot of the Chinese page
        page.screenshot(path="verification/contact_zh.png")

        # Check for Noto Sans SC in computed style of body
        font_family = page.eval_on_selector("body", "el => getComputedStyle(el).fontFamily")
        print(f"Contact ZH Body Font Family: {font_family}")

        # Check for favicon
        favicon = page.get_attribute("link[rel='icon']", "href")
        print(f"Contact ZH Favicon: {favicon}")

        # Check for lang attribute
        lang = page.get_attribute("html", "lang")
        print(f"Contact ZH Lang: {lang}")

        browser.close()

if __name__ == "__main__":
    check_pages()
