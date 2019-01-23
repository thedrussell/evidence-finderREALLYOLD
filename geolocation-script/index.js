var config = require('./config.json');

var https = require('https');
var fs = require('fs');
var Papa = require('papaparse');
var _ = require('lodash');

var rawJSON;

https.get(config.googleSpreadsheetCsvUrl, function(response) {
    console.log("data received.");

    Papa.parse(response, {
      header: false,
      delimiter: ",",
      complete: function(parsed) {
        console.log("raw data parsed.");

        // rawJSON = parsed.data.slice();
        cleanUpRows(parsed.data);
      }
    });
  })
  .on('error', function(err) { // Handle errors
    console.error(err);
  });

function cleanUpRows(json) {
  console.log("cleaning up rows...");

  // remove first and second row
  json.splice(0, 2);

  // remove fourth row
  json.splice(1, 1);

  Papa.parse(Papa.unparse(json), {
      header: true,
      complete: function(response) {
        console.log("rows cleaned.");

        processRows(response.data);
      }
  });
}

function processRows(rows) {
  console.log("processing rows...");

  const json = rows.map(function(row) {
    return {
      id: row.ID,
      title: row.Title,
      year: row.Year,
      url: row.URL,
      types: getTypes(row),
    }
  });

  console.log("writing to file...", json[0]);

  fs.writeFile(__dirname + '/data/data.json', JSON.stringify(json), function(err) {
    if (err) {
      console.error(err);
    }
    else {
      //file written successfully
      console.log("done!");
    }
  })
}

function getTypes(row) {
  const types = config.studyTypes.reduce(function(typesArr, studyType) {
    const hasStudyType = !_.isEmpty(row[studyType]);
    hasStudyType && types.push(studyType);

    return typesArr;
  }, []);

  return types;
}
