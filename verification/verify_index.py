
from playwright.sync_api import sync_playwright
import os

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Open the local file directly using absolute path inside the container
        page.goto('file:///app/index.html')

        # 1. Verify Marquee Section
        try:
            collaboration_section = page.locator('#collaboration')
            collaboration_section.scroll_into_view_if_needed()
            # Wait a bit for animation or layout
            page.wait_for_timeout(1000)
            page.screenshot(path='verification/collaboration_section.png')
            print('Collaboration section screenshot taken.')
        except Exception as e:
            print(f'Error finding collaboration section: {e}')

        # 2. Verify Footer
        try:
            footer = page.locator('footer')
            footer.scroll_into_view_if_needed()
            # Wait a bit
            page.wait_for_timeout(1000)
            page.screenshot(path='verification/footer_section.png')
            print('Footer section screenshot taken.')
        except Exception as e:
            print(f'Error finding footer: {e}')

        browser.close()

if __name__ == '__main__':
    verify_changes()
