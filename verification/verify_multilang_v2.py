from playwright.sync_api import sync_playwright
import os

def run():
    os.makedirs('verification', exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        # Test 1: Load English Index
        page.goto(f"file://{os.getcwd()}/en/home/index.html")
        print("Loaded English Index")
        page.screenshot(path="verification/index_en.png")
        
        # Test 2: Load German Index
        page.goto(f"file://{os.getcwd()}/de/home/index.html")
        print("Loaded German Index")
        page.screenshot(path="verification/index_de.png")
        
        # Test 3: Load Spanish Index
        page.goto(f"file://{os.getcwd()}/es/home/index.html")
        print("Loaded Spanish Index")
        page.screenshot(path="verification/index_es.png")
        
        # Test 4: Load Chinese Index
        page.goto(f"file://{os.getcwd()}/zh/home/index.html")
        print("Loaded Chinese Index")
        page.screenshot(path="verification/index_zh.png")
        
        # Test 5: Load Japanese Index
        page.goto(f"file://{os.getcwd()}/ja/home/index.html")
        print("Loaded Japanese Index")
        page.screenshot(path="verification/index_ja.png")
        
        # Test 6: Check Internal Link Structure
        # Check if "About Us" link in DE points to ../../de/home/index.html#about (or similar)
        # Note: Nav links might be anchor links if on same page.
        
        browser.close()

if __name__ == '__main__':
    run()
