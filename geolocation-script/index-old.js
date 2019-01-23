var GoogleSpreadsheet = require("google-spreadsheet");
var creds = require("./client_secret.json");
var fs = require("fs");
var async = require("async");
var asyncLoop = require("node-async-loop");

// Geocoder shenanigans
var NodeGeocoder = require("node-geocoder");
var options = {
  provider: "google",
  httpAdapter: "https", // Default
  apiKey: "AIzaSyCj4tEvicG3r5cwkwdOZCx6Od1KnRAyprs", // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};
var geocoder = NodeGeocoder(options);

// Create a document object using the ID of the spreadsheet - obtained from its URL.
var doc = new GoogleSpreadsheet("1WsZx6lmkCcBMd08FuY-jmKVtRI-0mTsM7C1P69uLbD0");

// Authenticate with the Google Spreadsheets API.
doc.useServiceAccountAuth(creds, function(err) {
  // Get all of the rows from the spreadsheet.

  doc.getRows(1, function(err, rows) {
    let entries = {
      type: "FeatureCollection",
      features: []
    };
    // async function suite here
    function geoCodeIt(entry) {
      return new Promise(resolve => {
        geocoder.geocode(entry.studycontext, function(err, res) {
          if (err) {
            resolve(err);
          }
          if (res) {
            if (res[0].latitude) {
              console.log(res);
              entry.latitude = res[0].latitude;
              entry.longitude = res[0].longitude;
            }
            resolve(entry);
          }
        });
      });
    }

    function geoJsonIt(entry) {
      return new Promise(resolve => {
        entry.geoJson = {
          type: "Feature",
          properties: {
            ID: entry.uniqueid,
            Title: entry.title,
            Author: entry.author,
            Year: entry.year,
            Link: entry.publicationlink,
            Context: entry.studycontext,
            Type: entry.studytype
          },
          geometry: {
            coordinates: [entry.longitude, entry.latitude],
            type: "Point"
          }
        };

        resolve(entry);
      });
    }
    function pushToEntries(entry) {
      return new Promise(resolve => {
        entries.features.push(entry.geoJson);
        resolve(entry);
      });
    }

    async function delayedLog(item) {
      if (item.studycontext) {
        await geoCodeIt(item);
        await geoJsonIt(item);
        await pushToEntries(item);
      }
    }

    async function processArray(array) {
      for (const item of array) {
        await delayedLog(item);
      }
      console.log(entries);
      fs.writeFile("./data/geojson.geojson", JSON.stringify(entries), "utf-8");
      console.log("done");
    }

    processArray(rows);
  });
});
