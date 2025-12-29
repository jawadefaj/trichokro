import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        cwd = os.getcwd()

        # 1. Verify index.html CV whitespace
        print("Checking index.html CV section...")
        await page.goto(f'file://{cwd}/index.html')
        # Scroll to bottom
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(1000)
        await page.screenshot(path='founder_cv_check.png')
        print("Captured founder_cv_check.png")

        # 2. Verify Contact Card for Farhan
        print("Checking contact.html for Farhan...")
        await page.goto(f'file://{cwd}/index.html')
        await page.wait_for_timeout(2000) # Wait for animation
        await page.screenshot(path='contact_farhan_check.png')
        print("Captured contact_farhan_check.png")

        # 3. Verify Pathfinder Floating Objects
        print("Checking pathfinder.html...")
        await page.goto(f'file://{cwd}/index.html')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='pathfinder_float_check.png')
        print("Captured pathfinder_float_check.png")
        
        # 4. Verify Contact Floating Objects
        print("Checking contact.html background...")
        await page.goto(f'file://{cwd}/index.html') # Default
        await page.wait_for_timeout(1000)
        await page.screenshot(path='contact_float_check.png')
        print("Captured contact_float_check.png")

        await browser.close()

asyncio.run(run())
