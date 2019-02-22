# Evidence Finder: Data Scraper

Download Evidence Finder data from a spreadsheet, fetch geolocation coordinates and format the data into a `geojson`.

## Setup
This project assumes that [this Google Spreadsheet](https://docs.google.com/spreadsheets/d/1gt0gMD9VvnYd4UKA1v5KA1O0wl1Orxr-beCTjpud6uU/) is published as a CSV and structured as of February X, 2019.

1. Make sure [NodeJS](https://nodejs.org/) is installed.
2. Open terminal and navigate to this folder.
3. If you've just cloned this repository, install all code related packages with:
```
npm install
```
4. Create a [Google Maps API key](https://developers.google.com/maps/documentation/geocoding/get-api-key) and enable the Geocoding API.
5. Create a file called `.env.local` in this folder and store the key like this:
```
GOOGLE_MAPS_API_KEY=secret-key-goes-here
```

## Development
Open terminal, navigate to this folder and run:
```
npm start
```

If everything goes well, it will create a `geo.json` file with and save it into `~/map/src/data/`, ready to be loaded in the Map app.
