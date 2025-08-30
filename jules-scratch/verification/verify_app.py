import os
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This script performs a basic smoke test on the Piano XL application
    to ensure it loads correctly after the refactoring.
    """
    # Capture console logs to help with debugging
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    # 1. Arrange: Navigate to the local server URL.
    page.goto('http://localhost:8000/GENIUS%20PEACE%2011.html')

    # 2. Act & Assert: Wait for the main components to be visible.
    piano_section = page.locator('#piano-section')
    expect(piano_section).to_be_visible(timeout=10000)

    controls_row = page.locator('.controls-row')
    expect(controls_row).to_be_visible()

    expect(page.locator('.white-key')).to_have_count(7)
    expect(page.locator('.black-key')).to_have_count(5)

    # Click the 'OCT' button and check for the 'selected' class
    page.locator('#oct-btn').click()

    page.wait_for_timeout(100)

    expect(page.locator('#oct-btn')).to_have_class('control-btn oct-btn selected')

    # 3. Screenshot: Capture the final state for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")

# Boilerplate to run the verification function
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()
