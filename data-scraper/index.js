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
    const type = row.MAP === 'Effectiveness Map' ? 'Effectiveness' : (row.MAP === 'Implementation Map' ? 'Implementation study' : row.MAP);

    const properties = {
      id: row.ID,
      type: type,
      studyDesign: getColumnGroup(row, config.studyDesign),
      title: row.Title.trim(),
      year: row.Year.trim(),
      yearGroup: !_.isEmpty(row.Year.trim()) ? getYearGroup(row.Year.trim()) : "",
      url: row.URL.trim(),
      authors: row.Authors.split(";").map(n => n.trim()).filter(n => n),
      locations: row.Locations.split(";").map(n => n.trim()).filter(n => n),

      /* FILTER INFORMATION */
      interventionCategories: getColumnGroup(row, config.interventionCategories),
      populationGroups: getColumnGroup(row, config.populationGroups),
    }

    return {
      type: "Feature",
      properties: properties
    }
  });

  getGeometries(entries)
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
  const hasLocations = !_.isEmpty(locations);

  const promise = new Promise((resolve, reject) => {

    if(hasLocations) {
      const queryPromises = locations.map((location) => geocode(location).catch(loc => geocode(loc).catch(l => geocode(l))));

      Promise.all(queryPromises)
        .then((results) => {
          console.log(`${entry.properties.id} located.`)
          entry.geometry = getGeometryPoints(results)
          resolve(entry);
        })
        .catch((location) => {
          console.log(`${entry.properties.id} has errors. (${location} failed to geocode)`);
        });
    }
    else {
      entry.geometry = null;
      resolve(entry);
    }
  });

  return promise;
}

function geocode(location) {
  console.error(`Fetching ${location}...`);

  return new Promise((resolve, reject) => {
    googleMapsClient.geocode({ address: location }).asPromise()
    .then(response => resolve(response.json.results))
    .catch(error => {
      console.error(`Failed to geocode ${location}, will retry.`, error);
      reject(location);
    })
  });
}

function getGeometryPoints(results) {
  const hasMultipleGeometries = results.length > 1;

  if(hasMultipleGeometries) {
    return {
      type: "GeometryCollection",
      geometries: results.map(result => getGeometryPoint(result[0]))
    };
  }
  else {
    return getGeometryPoint(results[0][0]);
  }
}

function getGeometryPoint(result) {
  let { lng, lat } = result.geometry.location;
  const isApproximate = result.geometry.location_type === "APPROXIMATE";

  if(isApproximate) {
    lng = disperseCoordinate(lng, 0.05);
    lat = disperseCoordinate(lat, 0.05);
  }
  else {
    lng = disperseCoordinate(lng, 0.01);
    lat = disperseCoordinate(lat, 0.01);
  }

  return {
    type: "Point",
    coordinates: [lng, lat]
  }
}

function disperseCoordinate(coordinate, radius) {
  return coordinate + getRand(-radius, radius);
}

function getRand(min, max) {
  return Math.random() * (max - min) + min;
}

function getYearGroup(year) {
  const fromYear = Math.floor(year/10 *2)/2 *10;
  const toYear = fromYear + 4;

  return `${fromYear} – ${toYear}`;
}
