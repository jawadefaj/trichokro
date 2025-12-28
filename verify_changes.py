import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Verify index.html footer and back to top
        cwd = os.getcwd()
        print(f"Checking index.html...")
        await page.goto(f'file://{cwd}/index.html')
        
        # Scroll to bottom to see footer and back-to-top button
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        # Wait a bit for any animations
        await page.wait_for_timeout(1000) 
        
        await page.screenshot(path='index_footer_check.png')
        print("Captured index_footer_check.png")

        # Verify founder.html footer
        print(f"Checking founder.html...")
        await page.goto(f'file://{cwd}/founder.html')
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(1000)
        await page.screenshot(path='founder_footer_check.png')
        print("Captured founder_footer_check.png")

        # Verify contact.html buttons
        print(f"Checking contact.html...")
        await page.goto(f'file://{cwd}/contact.html?id=rownak') # Use an ID to trigger rendering if needed
        # Wait for potential JS rendering
        await page.wait_for_timeout(1000)
        await page.screenshot(path='contact_check.png')
        print("Captured contact_check.png")

        await browser.close()

asyncio.run(run())
