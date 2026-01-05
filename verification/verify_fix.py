
from playwright.sync_api import sync_playwright

def verify_mobile_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a mobile device (e.g., iPhone 12 Pro)
        context = browser.new_context(
            viewport={'width': 390, 'height': 844},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
        )
        page = context.new_page()

        # Load local index.html using file:// protocol
        import os
        cwd = os.getcwd()
        page.goto(f'file://{cwd}/index.html')

        # Scroll to bottom to reveal scroll-to-bottom button if necessary
        # But wait, it's visible when NOT at bottom?
        # "visible only when NOT at bottom" -> logic in index.html:
        # if (!isAtBottom && window.scrollY > 300) -> remove opacity-0

        # Scroll down a bit
        page.evaluate('window.scrollTo(0, 500)')

        # Wait for button to become visible
        page.wait_for_selector('#scroll-to-bottom', state='visible')

        # Take screenshot
        page.screenshot(path='verification/mobile_fix.png')

        # Verify classes
        btn = page.locator('#scroll-to-bottom')
        classes = btn.get_attribute('class')
        print(f'Classes: {classes}')

        browser.close()

if __name__ == '__main__':
    verify_mobile_fix()
