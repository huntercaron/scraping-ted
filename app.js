const puppeteer = require('puppeteer');
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const scrapeSize = 5;

async function scrapeTed(index, browser) {
  try {
    const page = await browser.newPage();
    await page.goto(`http://www.ted.com/talks/view/id/${index}`, { waitUntil: 'networkidle0'});
    const url = await page.url();

    await page.goto(url + "/details")
    const speakerSelector = ".sa";
    await page.waitForSelector(speakerSelector)
    const speakerInfo = await page.evaluate(speakerSelector => {
      const speakerNode = document.querySelector(speakerSelector);
      return {
        speakerLink: speakerNode.href,
        speakerName: speakerNode.firstChild.lastChild.firstChild.firstChild.textContent,
        speakerTitle: speakerNode.firstChild.lastChild.firstChild.lastChild.lastChild.textContent,
        speakerBio: speakerNode.lastChild.textContent,
      }
    }, speakerSelector)


    const transcriptSelector = '.Grid .Grid--with-gutter';
    await page.goto(url + "/transcript")
    await page.waitForSelector(transcriptSelector)

    const talk = {
      index: index,
      speakerInfo: speakerInfo,
      transcript: [],
    }

    
    const links = await page.evaluate(transcriptSelector => {
      const anchors = Array.from(document.querySelectorAll(transcriptSelector));
      return anchors.map(anchor => {
        return {
          time: anchor.children[0].textContent,
          text: anchor.children[1].textContent
        };
      });
    }, transcriptSelector);

    talk.transcript = links;
    
    // fs.writeFile('data.json', JSON.stringify([transcript]), 'utf8', () => {});

    await page.close();
    // console.log(talk.speakerInfo.speakerName)
    return new Promise(resolve => { resolve(talk); });

  } catch (e) {
    // console.log(e);
    return new Promise(reject => { reject(); });
  }
  
};


async function scrapeMultiple(startIndex, browser) {
  let promises = [];

  for (let i = startIndex; i < startIndex+scrapeSize; i++) {
    promises.push(scrapeTed(i, browser));
  }

  const allData = await Promise.all(promises);
  // console.log(allData);
  

  return new Promise(resolve => { resolve(allData) })
}



(async () => {
  for (let i = 1; i <= 2898; i+=scrapeSize) {
    const browser = await puppeteer.launch({
      executablePath: '../Chrome/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
      timeout: 100000,
      args: ['--disable-timeouts-for-profiling']
    });

    // console.log("hey")
    let newData = await scrapeMultiple(i, browser);
    // console.log(allData);

    await browser.close();

    const data = await readFile('data.json', 'utf8');
    const fileData = JSON.parse(data);
    const json = JSON.stringify(fileData.concat(newData));
    await writeFile('data.json', json, 'utf8');
    // console.log("Wrote to file!")
  }
})();