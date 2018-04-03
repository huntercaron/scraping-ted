
const fs = require('fs');
const util = require('util');
const { promisify } = require('util');
const express = require('express')
const app = express()

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


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

app.get('/ted/search/:searchTerm', async (req, res) => {
  try {
    const data = await readFile('cleanData.json', 'utf8');
    let fileData = JSON.parse(data);

    let searchTerm = req.params.searchTerm;

    let talk = fileData[0];

    // let foundLines = talk.transcript.filter(line => {
    //   return (line.text.indexOf(searchTerm) !== -1)
    // })

    let foundLines = talk.transcript.reduce((accumulator, line) => {
      if (line.text.indexOf(searchTerm) !== -1)
        accumulator.push(line.time);
      return accumulator;
    }, [])

    res.send(foundLines);

  } catch (err) {
    console.error(err)
  }
})