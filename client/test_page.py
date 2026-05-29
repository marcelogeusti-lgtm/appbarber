import sys
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Listen for console messages
        def log_console(msg):
            print(f"[CONSOLE] {msg.type}: {msg.text}")
        page.on("console", log_console)
        
        # Listen for errors
        page.on("pageerror", lambda err: print(f"[ERROR] {err}"))
        
        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        
        print("Taking screenshot...")
        page.screenshot(path="c:/Users/wanie/Downloads/MARCELO/EU/App Barbeiro/client/public/debug-screenshot.png", full_page=True)
        
        # Check height of body and main
        height = page.evaluate("() => document.body.scrollHeight")
        print(f"Scroll height: {height}px")
        
        browser.close()

if __name__ == "__main__":
    run()
