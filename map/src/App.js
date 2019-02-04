import React, { Component } from 'react';
import MapGL, { Popup } from 'react-map-gl';
import isEmpty from 'lodash/isEmpty';
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import Feature from './Feature';
import Filters from './Filters';
import { fromJS } from 'immutable';

import { defaultMapStyle } from './data/map-style';
const geoJSON = require('./data/geo.json');

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapStyle: defaultMapStyle,//"mapbox://styles/rc3/cjffxvy9wb3ou2snutp645m00/",
      viewport: {
        latitude: 38.88,
        longitude: -98,
        zoom: 3,
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
  }
  _onViewportChange(viewport) {
    this.setState({ viewport });
  }
  _getPopup(selectedFeature) {
    const { geometry, properties } = selectedFeature;

    const { title, url, year } = properties;
    const { coordinates } = geometry;

    const hasUrl = !isEmpty(url);

    const content =
      <div className="Popup-Content">
        {year}<br/>
        {hasUrl ? <a href={url} target="_blank">{title}</a> : {title}}
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
    this._loadData();
  }

  _handleMapClicked(event) {
    const { features } = event;
    const selectedFeature = !isEmpty(features) && features.find(f => f.source === 'studiesByLocation');

    this.setState({ selectedFeature: selectedFeature });
  }
  _handlePopupClose() {
    this.setState({ selectedFeature: null });
  }
  _loadData() {
    const mapStyle = defaultMapStyle
      // Add geojson source to map
      .setIn(['sources', 'studiesByLocation'], fromJS({ type: 'geojson', data: geoJSON }))

    this.setState({ mapStyle, data: geoJSON });
  }
  _updateData(filters) {
    const { mapStyle, data } = this.state;

    // filter data

    // update
    // const newMapStyle = mapStyle
    //   // Add geojson source to map
    //   .setIn(['sources', 'studiesByLocation'], fromJS({ type: 'geojson', data: geoJSON }))

    // this.setState({ mapStyle: newMapStyle, data });
  }
}

export default App;
