
const fs = require('fs');
const util = require('util');
const { promisify } = require('util');
const express = require('express')
const cors = require('cors')

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const app = express()


app.use(cors())

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))

app.get('/ted/all', async (req, res) => {
  try {
    const data = await readFile('cleanData.json', 'utf8');
    let fileData = JSON.parse(data);
    
    res.send(fileData[0]);

  } catch(err) {
    console.error(err)
  }
})

// maybe reply with time in minutes
// then time in string
// line
// speaker data and url can be stored on client

async function searchTranscript(transcript, searchTerm) {
  return new Promise(resolve => {
    let lastLine = transcript[transcript.length-1].time;

    let foundLines = transcript.reduce((accumulator, line) => {
      if (line.text.toLowerCase().indexOf(searchTerm) !== -1)
        accumulator.push(line.time);
      return accumulator;
    }, [])

    let transcriptData = {
      foundLines: foundLines,
      lastLine: lastLine
    }

    resolve(transcriptData);
  })
}

app.get('/ted/search/:searchTerm', async (req, res) => {
  try {
    const data = await readFile('cleanData.json', 'utf8');
    const fileData = JSON.parse(data);
    const searchTerm = req.params.searchTerm;
    let talkPromises = [];
    
    for (let i = 0; i < fileData.length; i++) {
      talkPromises.push(searchTranscript(fileData[i].transcript, searchTerm));
    }

    const foundLines = await Promise.all(talkPromises);
    res.send(foundLines);

  } catch (err) {
    console.error(err)
  }
})