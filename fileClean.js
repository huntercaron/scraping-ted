const fs = require('fs');
const util = require('util');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

(async () => {
  try {
    const data = await readFile('data.json', 'utf8');
    let fileData = JSON.parse(data);
    let cleanData = [];
    
    for (let i in fileData) {
      if (fileData[i] !== null) {
        cleanData.push(fileData[i]);
      }
    }

    for (let i in cleanData) {
      console.log(cleanData[i].speakerInfo.speakerName);
    }
    
    const json = JSON.stringify(cleanData);
    await writeFile('cleanData.json', json, 'utf8');
    console.log("wrote cleaned data to file :)")

  } catch(e) { console.log(e); }
})();

