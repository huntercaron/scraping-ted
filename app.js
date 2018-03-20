const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ executablePath: '../Chrome/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'});
  const page = await browser.newPage();
  await page.goto('http://www.ted.com/talks/view/id/1', { waitUntil: 'networkidle0'});

  const url = await page.url();
  console.log(url);
  
  const transcriptSelector = '.Grid .Grid--with-gutter';

  await page.goto(url + "/transcript")
  await page.waitForSelector(transcriptSelector)
  // await page.waitForFunction("parseInt(document.querySelectorAll('.Grid .Grid--with-gutter')[10].children[0].textContent) > 0")
  // 
  // await page.screenshot({path: 'example.png', fullPage: true});
  
  const links = await page.evaluate(transcriptSelector => {
    const anchors = Array.from(document.querySelectorAll(transcriptSelector));
    return anchors.map(anchor => {
      console.log(anchor.children);
      
      return {
        time: anchor.children[0].textContent,
        text: anchor.children[1].textContent
      };
      // const title = anchor.textContent.split('|')[0].trim();
      // return `${title} - ${anchor.href}`;
    });
  }, transcriptSelector);

  const h = links;
  

  await browser.close();
})();
