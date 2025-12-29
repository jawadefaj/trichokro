from playwright.sync_api import sync_playwright
import os

def verify_changes():
    with sync_playwright() as p:
        # Use a mobile viewport to trigger mobile layouts
        browser = p.chromium.launch(headless=True)
        # Pixel 5 emulation
        context = browser.new_context(viewport={"width": 393, "height": 851}, user_agent="Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36")
        page = context.new_page()

        # Get absolute path
        cwd = os.getcwd()

        print("Checking index.html...")
        page.goto(f"file://{cwd}/index.html")
        page.wait_for_load_state("networkidle")

        # Check if mobile menu button exists and doesn't have animation class
        menu_btn = page.locator("#mobile-menu-btn")
        if menu_btn.is_visible():
            classes = menu_btn.get_attribute("class")
            print(f"Index menu button classes: {classes}")
            if "animate-float-subtle" not in classes:
                print("SUCCESS: Animation removed from index.html menu button")
            else:
                print("FAILURE: Animation still present on index.html menu button")

            # Open menu
            menu_btn.click()
            page.wait_for_timeout(500)
            page.screenshot(path="verification/index_mobile_menu.png")
            print("Screenshot saved: verification/index_mobile_menu.png")
        else:
            print("FAILURE: Mobile menu button not found on index.html")

        print("Checking contact.html...")
        page.goto(f"file://{cwd}/contact.html")
        page.wait_for_load_state("networkidle")

        # Check for new mobile menu button on contact page
        contact_menu_btn = page.locator("#mobile-menu-btn")
        if contact_menu_btn.is_visible():
            print("SUCCESS: Mobile menu button found on contact.html")
            contact_menu_btn.click()
            page.wait_for_timeout(500)
            # Verify menu overlay is visible
            mobile_menu = page.locator("#mobile-menu")
            # In contact.html I removed opacity-0 on click, let's verify visibility
            if mobile_menu.is_visible():
                classes = mobile_menu.get_attribute("class")
                if "opacity-0" not in classes:
                     print("SUCCESS: Mobile menu opened on contact.html")
                else:
                     print("FAILURE: Mobile menu did not open (opacity-0 still present)")

            page.screenshot(path="verification/contact_mobile_menu.png")
            print("Screenshot saved: verification/contact_mobile_menu.png")
        else:
            print("FAILURE: Mobile menu button not found on contact.html")

        browser.close()

if __name__ == "__main__":
    verify_changes()
