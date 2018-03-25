const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeTed(index) {
  const browser = await puppeteer.launch({ 
    executablePath: '../Chrome/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    timeout: 100000,
    args: ['--disable-timeouts-for-profiling']
    });
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

  await browser.close();
  console.log(talk.speakerInfo.speakerName)

  return new Promise(resolve => { resolve(talk) });
};


const talkCount = 4;

async function scrapeMultiple(startIndex) {
  let promises = [];

  for (let i = startIndex; i <= startIndex+9; i++) {
    promises.push(scrapeTed(i));
  }

  const allData = await Promise.all(promises);

  return new Promise(resolve => { resolve(allData) })
}



(async () => {
  for (let i = 1; i <= 30; i+=9) {
    console.log("hey")
    let allData = await scrapeMultiple(i);
    // console.log(allData);
    
    for (let talk of allData) {
      
      console.log(talk);
    }

    // fs.readFile('data.json', 'utf8', (err, data) => {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     let obj = JSON.parse(data);
    //     obj.push(allData);

    //     json = JSON.stringify(obj);
    //     fs.writeFile('data.json', json, 'utf8', () => {
    //       console.log("Wrote to file");
    //     }); // write it back 
    //   }
    // });
  }
})();