# Evidence Finder: Data Scraper

Download Evidence Finder data from a spreadsheet, fetch geolocation coordinates and format the data into a `geojson`.

### Installation
This project assumes that [this Google Spreadsheet](https://docs.google.com/spreadsheets/d/1gt0gMD9VvnYd4UKA1v5KA1O0wl1Orxr-beCTjpud6uU/) is published as a CSV and structured as of February X, 2019.

To install all code related packages, open terminal in this folder and run:
```
npm install
```

### Instructions

1. Create a [Google Maps API key](https://developers.google.com/maps/documentation/geocoding/get-api-key) and enable the Geocoding API
2. Create a file called `.env` in this folder and store the key like this:
```
GOOGLE_MAPS_API_KEY=secret-key-goes-here
```
3. Open terminal and run
```
npm start
```
