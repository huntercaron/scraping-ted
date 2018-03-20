const puppeteer = require('puppeteer');
const fs = require('fs');

const index = 10;

(async () => {
  const browser = await puppeteer.launch({ executablePath: '../Chrome/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'});
  const page = await browser.newPage();
  await page.goto(`http://www.ted.com/talks/view/id/${index}`, { waitUntil: 'networkidle0'});
  const url = await page.url();

  // save the URL


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

  const transcript = {
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

  transcript.transcript = links;
  
  // fs.writeFile('data.json', JSON.stringify([transcript]), 'utf8', () => {});

  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      let obj = JSON.parse(data);
      
      let foundIndex = obj.findIndex((ele) => {
        return ele.index == index;
      });

      if (foundIndex >= 0) {
        obj[foundIndex] = transcript;
      } else {
        obj.push(transcript);
      }
      
      json = JSON.stringify(obj);
      fs.writeFile('data.json', json, 'utf8', () => {
        console.log("Wrote to file");
      }); // write it back 
    }
  });

  await browser.close();
})();