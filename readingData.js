const fs = require('fs');
const util = require('util');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

(async () => {
  try {
    const file = await readFile('cleanData.json', 'utf8');
    let data = JSON.parse(file);
    
    for (let talk of data) {
      // console.log(talk.transcript[0]);
      console.log(talk.transcript[0].text);
      
    }

  } catch (e) { console.log(e); }
})();