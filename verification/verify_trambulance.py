from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 2000})
        page = context.new_page()

        # Check English Page
        print("Checking trambulance.html...")
        page.goto(f"file://{os.getcwd()}/trambulance.html")

        # Engineering Section
        print("Capturing Engineering Section (EN)...")
        eng_section = page.locator("#tramb-engineering")
        if eng_section.count() > 0:
            eng_section.screenshot(path="verification/trambulance_engineering_en.png")
            print("Captured verification/trambulance_engineering_en.png")
        else:
            print("Error: #tramb-engineering not found in EN")

        # App Section
        print("Capturing App Section (EN)...")
        app_section = page.locator("#tramb-app")
        if app_section.count() > 0:
            app_section.screenshot(path="verification/trambulance_app_en.png")
            print("Captured verification/trambulance_app_en.png")
        else:
            print("Error: #tramb-app not found in EN")

        # Check Bengali Page
        print("Checking trambulance_bn.html...")
        page.goto(f"file://{os.getcwd()}/trambulance_bn.html")

        # Engineering Section
        print("Capturing Engineering Section (BN)...")
        eng_section_bn = page.locator("#tramb-engineering")
        if eng_section_bn.count() > 0:
            eng_section_bn.screenshot(path="verification/trambulance_engineering_bn.png")
            print("Captured verification/trambulance_engineering_bn.png")
        else:
            print("Error: #tramb-engineering not found in BN")

        # App Section
        print("Capturing App Section (BN)...")
        app_section_bn = page.locator("#tramb-app")
        if app_section_bn.count() > 0:
            app_section_bn.screenshot(path="verification/trambulance_app_bn.png")
            print("Captured verification/trambulance_app_bn.png")
        else:
            print("Error: #tramb-app not found in BN")

        browser.close()

if __name__ == "__main__":
    run()
