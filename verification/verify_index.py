from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 3000}) # Tall viewport to see sections

        # Verify index.html
        print("Verifying index.html...")
        page.goto("file://" + os.path.abspath("index.html"))

        # Check Navbar
        page.screenshot(path="verification/index_full.png")

        # 1. Navbar check
        navbar = page.locator("#navbar")
        navbar_text = navbar.inner_text()
        print(f"Navbar text: {navbar_text}")
        if "ABOUT US" in navbar_text and "CONTACTS" not in navbar_text and "FOUNDERS" not in navbar_text:
            print("PASS: Navbar updated correctly (ABOUT US present, CONTACTS/FOUNDERS absent)")
        else:
            print("FAIL: Navbar check failed")

        # 2. Products Header
        products = page.locator("#products")
        products_text = products.inner_text()
        if "Engineered for the unique demands" not in products_text and "View Full Specifications" not in products_text:
             print("PASS: Products header text removed")
        else:
             print("FAIL: Products header check failed")

        # 3. Blog More Button
        blog_btn = page.locator("#blogs a:has-text('More')")
        if blog_btn.count() > 0:
             print("PASS: Blog 'More' button found")
        else:
             print("FAIL: Blog 'More' button NOT found")

        # Verify index_bn.html
        print("\nVerifying index_bn.html...")
        page.goto("file://" + os.path.abspath("index_bn.html"))
        page.screenshot(path="verification/index_bn_full.png")

        # 1. Navbar check
        navbar_bn = page.locator("#navbar")
        navbar_bn_text = navbar_bn.inner_text()
        print(f"Navbar BN text: {navbar_bn_text}")
        # "আমাদের সম্পর্কে" should be there, "যোগাযোগ" should NOT be button (but contact page link might be text?)
        # Wait, I replaced CONTACTS button with ABOUT US button.
        # "আমাদের সম্পর্কে" is "About Us".
        if "আমাদের সম্পর্কে" in navbar_bn_text and "প্রতিষ্ঠাতা" not in navbar_bn_text:
             print("PASS: Navbar BN updated correctly")
        else:
             print("FAIL: Navbar BN check failed")

        # 3. Blog More Button
        blog_bn_btn = page.locator("#blogs a:has-text('আরও দেখুন')")
        if blog_bn_btn.count() > 0:
             print("PASS: Blog BN 'More' button found")
        else:
             print("FAIL: Blog BN 'More' button NOT found")

        browser.close()

if __name__ == "__main__":
    run()
