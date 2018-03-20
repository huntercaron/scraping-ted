const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://www.ted.com/talks/view/id/1');
  await page.screenshot({path: 'example.png'});

  const url = await page.url();
  console.log(url);

  await browser.close();
})();
