# Evidence Finder: Map
A React app that loads a geoJSON of Evidence Finder data and displays a filterable, interactive map using MapboxGL.

## Setup
1. Make sure [NodeJS](https://nodejs.org/) is installed.
2. Open terminal and navigate to this folder.
3. If you've just cloned this repository, install all code related packages with:
```
npm install
```
4. Get a [Mapbox Access Token](https://account.mapbox.com/access-tokens/).

## Development
1. Create a file called `.env.local` in this folder and store the Mapbox token like this:
```
REACT_APP_MAPBOX_TOKEN=secret-key-goes-here
```
2. Open terminal, navigate to this folder and run:
```
npm start
```

NOTE: If you edit the map style in Mapbox Studio, export it and copy all files and folders into `/src/data`.

## Deployment
1. Install [Now](https://zeit.co/now) (you need the CLI, it comes with their desktop app as well)
2. Login into your Now account via the desktop app or the CLI
3. In terminal, store your Mapbox token as a Now secret:
```
now secrets add chi-evidence-finder-mapbox-token "secret-key-goes-here"
```
4. Run the following command to build and deploy the map to a Now project `chi-evidence-finder`.
```
npm run deploy
```


---


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
