import puppeteer, { Browser, BrowserContext, Cookie, Page } from "puppeteer";
import { PuppeteerExtra } from "puppeteer-extra";


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    const puppeteerExtra = require("puppeteer-extra");
    const stealthPlugin = require("puppeteer-extra-plugin-stealth");
    puppeteerExtra.use(stealthPlugin());

    const launchOptions = {
        headless: false, // Change to false to see the browser
        slowMo: 100, // Slows down operations by 100ms
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--window-size=1920,1080", // Set window size
            "--start-maximized" // Start with maximized window
        ],
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        defaultViewport: {
            width: 1420,
            height: 820
        }
    };

    try {
        const browser: Browser = await puppeteerExtra.launch(launchOptions);
        const page: Page = await browser.newPage();
    
        await page.goto("https://xiaohongshu.com/explore", {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        // Wait for the qr code qrcode force-light
        await page.waitForSelector('.qrcode.force-light');
        

        console.log('Waiting for login...');
        // delay for 10 seconds to login
        await delay(10000);
        // Wait for the sections to load
        await page.waitForSelector('#exploreFeeds .note-item');
    
        // Get all sections
        const sections = await page.$$('#exploreFeeds .note-item');
        console.log('Found', sections.length, 'sections');
    
        for (const section of sections) {
            // Extract the inner text of the section to check for keywords
            const sectionText = await page.evaluate((el) => {
                return (el as HTMLElement).innerText; // Cast to HTMLElement to access innerText
            }, section);
    
            if (sectionText.includes('英语') || sectionText.includes('口语') || sectionText.includes('新概念')) {
                console.log('Found matching section with text:', sectionText);
    
                // Get a link with class 'cover ld mask' inside the section
                const link = await section.$('.cover.ld.mask');
                if (!link) {
                    console.log('Link not found');
                    continue;
                }
                // Click on the link
                await link.click();
                console.log('Clicked on the link');
 
                await page.waitForSelector('.interaction-container');
                await page.waitForSelector('.btn.submit.gray');
                // fill in the comment
                
                // await for with <div data-v-b91d006a class="inner">
                await page.waitForSelector('div[data-v-b91d006a].inner');

                // click div[data-v-b91d006a].inner
                const inner = await page.$('div[data-v-b91d006a].inner');
                delay(2000 * (0.5 + Math.random()));
                if (inner) {
                    await inner.click();
                    console.log('Clicked on the inner');
                } else {
                    console.log('Inner not found');
                }

                // Wait for content textarea to be available
                await page.waitForSelector('#content-textarea');

                // Fill content using evaluateHandle for contenteditable
                await page.evaluate((text) => {
                    const element = document.querySelector('#content-textarea');
                    if (element) {
                        element.textContent = text;
                        // Trigger input event to simulate typing
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, '给你推荐一个特别好用影子跟读网站，hispeaking.com，沉浸式跟读，体验特别不错');

                // Verify content was entered
                const content = await page.$eval('#content-textarea', el => el.textContent);
                console.log('Content entered:', content);
                await delay(2000 * (0.5 + Math.random()));
                    
                const submitButton = await page.$('.btn.submit');
                if (!submitButton) {
                    console.log('Submit button not found');
                    continue;
                }
                // Click on the submit button
                await submitButton.click();
                console.log('Clicked on the submit button');
        
                // Wait for 3 minutes using delay function
                console.log('Waiting for 5s to avoid detection...');
                await delay(5000 * (0.5 + Math.random()));

                // Go back to the previous page
                // await page.goBack();
                
                await page.waitForSelector('.close.close-mask-dark');

                const closeBtn = await page.$('.close.close-mask-dark');
                if (closeBtn) {
                    await closeBtn.click();
                    console.log('Went back to the previous page');
                } else {
                    console.log('Close button not found');
                }
                await delay(2000 * (0.5 + Math.random()));
            }
                       
        }
  
        console.log("Done!");
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

main().catch(console.error);