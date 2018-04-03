const fs = require('fs');
const util = require('util');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

(async () => {
  try {
    const data = await readFile('cleanData.json', 'utf8');
    let fileData = JSON.parse(data);
    let moddedData = [];
    
    for (let i in fileData) {
      let talk = fileData[i];

      let transcriptTimes = talk.transcript.map(({ time }) => time);
      let transcriptText = talk.transcript.map(({ text }) => text);


      // for (let line of talk.transcript) {
      //   newTranscript.push({
      //     time: {
      //       S: line.time
      //     },
      //     text: {
      //       S: line.text
      //     }
      //   })
      // }


      moddedData.push({
        index: talk.index,
        speakerInfo: talk.speakerInfo,
        transcriptText,
        transcriptTimes
      });

      if (i > 4) {
        break;
      }
    }

    // for (let i in cleanData) {
    //   console.log(cleanData[i].speakerInfo.speakerName);
    // }
    
    const tedData = { tedData: moddedData };

    const json = JSON.stringify(tedData);
    await writeFile('testData.json', json, 'utf8');
    console.log("wrote modded data to file :)")

  } catch(e) { console.log(e); }
})();

