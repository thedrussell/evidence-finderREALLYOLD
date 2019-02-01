var config = require('./config.json');

var https = require('https');
var fs = require('fs');
var Papa = require('papaparse');
var _ = require('lodash');

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise
});

https.get(config.googleSpreadsheetCsvUrl, function(response) {
    console.log("data received.");

    Papa.parse(response, {
      header: false,
      delimiter: ",",
      complete: function(parsed) {
        console.log("raw data parsed.");
        cleanUpRows(parsed.data).then(rows => processRows(rows));
      }
    });
  })
  .on('error', function(err) {
    console.error(err);
  });

function cleanUpRows(json) {
  console.log("cleaning up rows...");

  const promise = new Promise(resolve => {

    json.splice(0, 2)   // remove first and second row
        .splice(1, 1);  // remove fourth row

    Papa.parse(Papa.unparse(json), {
        header: true,
        complete: function(response) {
          console.log("rows cleaned.");
          resolve(response.data);
        }
    });

  });

  return promise;
}

function processRows(rows) {
  console.log("processing rows...");

  const entries = rows.map(function(row) {
    return {
      /* CORE */
      id: row.ID,
      type: row.MAP,
      title: row.Title,
      year: row.Year,
      url: row.URL,

      /* CONTEXT */
      locations: row.Locations,

      /* FILTER INFORMATION */
      design: getColumnGroup(row, config.studyTypes),
      populationGroups: getColumnGroup(row, config.populationGroups),
    }
  });

  getGeolocations(entries).then((json) => saveData(json));
}

function saveData(json) {
  console.log("writing to file...");

  fs.writeFile(__dirname + '/../data/data.json', JSON.stringify(json), function(err) {
    if(err) {
      console.error(err);
    }
    else {
      console.log("file written successfully!");
    }
  });
}

function getColumnGroup(row, keys) {
  const group = keys.reduce(function(arr, key) {
    const hasValue = !_.isEmpty(row[key]);
    hasValue && arr.push(key);

    return arr;
  }, []);

  return group;
}

function getGeolocations(entries) {
  const geolocationPromises = entries.map((entry) => getGeolocation(entry));

  return Promise.all(geolocationPromises);
}

function getGeolocation(entry) {

  const { locations } = entry;

  const locationArr = locations.split(";").filter(n => n).map(n => n.trim());
  const hasLocations = !_.isEmpty(locationArr);

  const promise = new Promise((resolve, reject) => {

    if(hasLocations) {
      const queryPromises = locationArr.map((location) => queryAPI(location));

      Promise.all(queryPromises)
        .then((results) => {
          entry.locations = results.map(result => result);
          resolve(entry);
        })
        .catch(error => console.error(error));
    }
    else {
      entry.locations = [];
      resolve(entry);
    }
  });

  return promise;
}

function queryAPI(location) {
  return new Promise((resolve, reject) => {
    googleMapsClient.geocode({ address: location }).asPromise()
    .then(response => resolve(response.json.results))
    .catch(error => reject(error))
  });
}

// function getAddresses(city, country, region) {
//   let addresses = [];
//
//   const cities = city.split(";").filter(n => n);
//   const countries = country.split(";").filter(n => n);
//   const regions = region.split(";").filter(n => n);
//
//   const hasManyCities = cities.length > 1;
//   const hasManyCountries = countries.length > 1;
//   const hasManyRegions = regions.length > 1;
//
//   if(hasManyCities) {
//     cities.forEach((city) => {
//       addresses.push(`${city}, ${countries[0]}`)
//     });
//
//     return addresses;
//   }
//
//   if(hasManyCountries) {
//
//   }


  // if has city

    // if has multiple cities

      // for each

        // city + first country
        // return location

    // else

      // city + first country
      // return location

  // else if has country

    // if has multiple countries

      // for each

        // country
        // return location

    // else

      // country
      // return location

  // else if has region

    // if has multiple regions

      // for each

        // region
        // return location

    // else

      // region
      // return location

// }

// ALL STUDY TYPES
// "Systematic review",
// "Review of review",
// "Randomised control trial",
// "Cohort",
// "Natural experiment",
// "Regression discontinuity design",
// "Interrupted time series",
// "Instrumental variables",
// "Propensity score matching",
// "Other forms of matching",
// "Difference - in - difference without matching",
// "Before versus after (pre & post)"
