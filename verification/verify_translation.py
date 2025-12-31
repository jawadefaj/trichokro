from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Verify index.html (English) has Bangla button
        page.goto('file://' + os.path.abspath('index.html'))
        page.screenshot(path='verification/index_en.png')

        # Verify index_bn.html (Bangla) has English button and translated content
        page.goto('file://' + os.path.abspath('index_bn.html'))
        page.screenshot(path='verification/index_bn.png')

        # Verify founder.html (English) has Bangla button
        page.goto('file://' + os.path.abspath('founder.html'))
        page.screenshot(path='verification/founder_en.png')

        # Verify founder_bn.html (Bangla) has English button and translated content
        page.goto('file://' + os.path.abspath('founder_bn.html'))
        page.screenshot(path='verification/founder_bn.png')

        browser.close()

if __name__ == '__main__':
    run()
