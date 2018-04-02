const fs = require('fs');
const util = require('util');
const { promisify } = require('util');
var AWS = require('aws-sdk');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const timeout = ms => new Promise(res => setTimeout(res, ms))

AWS.config.update({
  region: "us-east-2",
  endpoint: "https://dynamodb.us-east-2.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

(async () => {
  try {
    const data = await readFile('testData.json', 'utf8');
    let fileData = JSON.parse(data).tedData;

    for (let talk of fileData) {
      let params = {
        TableName: "Ted",
        Item: {
          speakerInfo: talk.speakerInfo,
          transcript: talk.transcript,
          index: talk.index
        }
      }
      
      docClient.put(params, function (err, data) {
        if (err) {
          console.error("Unable to add movie", talk.speakerInfo.speakerName, ". Error JSON:", JSON.stringify(err, null, 2));
        } else {
          console.log("PutItem succeeded:", talk.speakerInfo.speakerName);
        }
      });

      await timeout(500)
    }


  } catch(e) { console.log(e); }
})();

