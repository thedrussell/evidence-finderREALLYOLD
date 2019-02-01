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
        cleanUpRows(parsed.data)
          .then(rows => getFeatures(rows));
      }
    });
  })
  .on('error', function(err) {
    console.error(err);
  });

function cleanUpRows(json) {
  console.log("cleaning up rows...");

  const promise = new Promise(resolve => {

    json.splice(0, 2);   // remove first and second row
    json.splice(1, 1);   // remove fourth row

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

function getFeatures(rows) {
  console.log("getting features...");

  const entries = rows.map(function(row) {
    const properties = {
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

    return {
      type: "Feature",
      properties: properties
    }
  });

  getGeometries(entries)//.slice(0,5))
    .then((features) => {
      const json = {
        type: "FeatureCollection",
        features: features
      }

      saveData(json)
    });
}

function saveData(json) {
  console.log("writing to file...");

  fs.writeFile(__dirname + '/../map/src/data/geo.json', JSON.stringify(json), function(err) {
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

function getGeometries(entries) {
  const geolocationPromises = entries.map((entry) => getGeometry(entry));

  return Promise.all(geolocationPromises);
}

function getGeometry(entry) {

  const { locations } = entry.properties;

  const locationArr = locations.split(";").filter(n => n).map(n => n.trim());
  const hasLocations = !_.isEmpty(locationArr);

  const promise = new Promise((resolve, reject) => {

    if(hasLocations) {
      const queryPromises = locationArr.map((location) => queryAPI(location));

      Promise.all(queryPromises)
        .then((results) => {
          const hasMultipleGeometries = results.length > 1;

          if(hasMultipleGeometries) {
            entry.geometry = {
              type: "GeometryCollection",
              geometries: results.map(result => storeGeometry(result[0]))
            };
          }
          else {
            entry.geometry = storeGeometry(results[0][0]);
          }
          resolve(entry);
        })
        .catch(error => console.error(error));
    }
    else {
      entry.geometry = null;
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

function storeGeometry(result) {
  const { lat, lng } = result.geometry.location;

  return {
    type: "Point",
    coordinates: [lat, lng]
  }
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
