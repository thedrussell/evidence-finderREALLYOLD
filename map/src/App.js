import React, { Component } from 'react';
import MapGL, { Popup } from 'react-map-gl';
import isEmpty from 'lodash/isEmpty';
import groupBy from 'lodash/groupBy';
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import Filters from './Filters';
import { fromJS } from 'immutable';

import { defaultMapStyle, dataLayers } from './data/map-style';
const geoJSON = require('./data/geo.json');

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapStyle: defaultMapStyle,//"mapbox://styles/rc3/cjffxvy9wb3ou2snutp645m00/",
      viewport: {
        latitude: 52,
        longitude: 0,
        zoom: 4,
        minZoom: 2,
        bearing: 0,
        pitch: 0
      },
      selectedFeature: null
    };

    this.handleMapClicked = this._handleMapClicked.bind(this);
    this.handlePopupClose = this._handlePopupClose.bind(this);

    this.onViewportChange = this._onViewportChange.bind(this);
    this.updateData = this._updateData.bind(this);

    this.popupTimeout = null;
  }
  _onViewportChange(viewport) {
    this.setState({ viewport });
  }
  _getPopup(selectedFeature) {
    const { geometry, properties } = selectedFeature;

    const { type, title, url, year, authors, design } = properties;
    const { coordinates } = geometry;

    const designArr = JSON.parse(design);

    const hasUrl = !isEmpty(url);
    const hasDesign = !isEmpty(designArr);

    const stringifiedDesign = hasDesign && `, ${designArr.join(', ')}`;

    const content =
      <div className="Popup-Content">
        <h2>{type}{stringifiedDesign}</h2>
        <h1>
          {hasUrl ? <a href={url} target="_blank"rel=" noopener noreferrer">{title}</a> : title}
        </h1>
        <h3>
          <b>{year}</b><br/>
          {authors}
        </h3>
      </div>

    return (
      <Popup
        longitude={coordinates[0]}
        latitude={coordinates[1]}
        sortByDepth={true}
        closeButton={true}
        closeOnClick={true}
        onClose={this.handlePopupClose}
      >
        {content}
      </Popup>
    );
  }
  render() {
    const { viewport, mapStyle, selectedFeature } = this.state;
    const showPopup = !isEmpty(selectedFeature);

    return (
      <div className="App">
        <MapGL
          {...viewport}
          width="100%"
          height="100%"
          mapStyle={mapStyle}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={this.onViewportChange}
          onClick={this.handleMapClicked}
        >
          {showPopup && this._getPopup(selectedFeature)}
        </MapGL>

        <Filters
          updateData={this.updateData}
        />
      </div>
    );
  }
  componentDidMount() {
    this._loadData(geoJSON);
  }

  _handleMapClicked(event) {
    const { features } = event;
    const selectedFeature = !isEmpty(features) && features.find(f => f.source === 'implementationStudiesByLocation' || f.source === 'effectivenessStudiesByLocation');

    this.setState({ selectedFeature: selectedFeature });
  }
  _handlePopupClose() {
    clearTimeout(this.popupTimeout);

    this.popupTimeout = setTimeout(() => {
      this.setState({ selectedFeature: null });
    }, 100);
  }
  _loadData(geoJSON) {
    let typeGroups = groupBy(geoJSON.features, item => item.properties.type);
    Object.keys(typeGroups).forEach((key) => isEmpty(key) && delete typeGroups[key]);

    let implementationFeatureCollection = Object.assign({}, geoJSON);
    implementationFeatureCollection.features = typeGroups['Implementation study'];

    let effectivenessFeatureCollection = Object.assign({}, geoJSON);
    effectivenessFeatureCollection.features = typeGroups['Effectiveness study'];

    let mapStyle = defaultMapStyle
      .setIn(['sources', 'implementationStudiesByLocation'], fromJS({ type: 'geojson', data: implementationFeatureCollection }))
      .set('layers', defaultMapStyle.get('layers').push(dataLayers.implementation))

    mapStyle = mapStyle
      .setIn(['sources', 'effectivenessStudiesByLocation'], fromJS({ type: 'geojson', data: effectivenessFeatureCollection }))
      .set('layers', mapStyle.get('layers').push(dataLayers.effectiveness))

    this.setState({ mapStyle });
  }
  _updateData(filters) {
    // const { mapStyle, data } = this.state;

    // filter data

    // update
    // const newMapStyle = mapStyle
    //   // Add geojson source to map
    //   .setIn(['sources', 'studiesByLocation'], fromJS({ type: 'geojson', data: geoJSON }))

    // this.setState({ mapStyle: newMapStyle, data });
  }
}

export default App;
