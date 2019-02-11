import React, { Component } from 'react';
import MapGL, { Popup, NavigationControl } from 'react-map-gl';
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
      mapStyle: defaultMapStyle,
      data: {},
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

    const { type, title, url, year, authors, studyDesign } = properties;
    const { coordinates } = geometry;

    const authorsArr = JSON.parse(authors);
    const hasAuthors = !isEmpty(authorsArr);
    const stringifiedAuthors = hasAuthors && `${authorsArr.join('; ')}`;

    const studyDesignArr = JSON.parse(studyDesign);
    const hasStudyDesign = !isEmpty(studyDesignArr);
    const stringifiedStudyDesign = hasStudyDesign && `, ${studyDesignArr.join(', ')}`;

    const hasUrl = !isEmpty(url);

    const content =
      <div className="Popup-Content">
        <h2>{type}{stringifiedStudyDesign}</h2>
        <h1>
          {hasUrl ? <a href={url} target="_blank"rel=" noopener noreferrer">{title}</a> : title}
        </h1>
        <h3>
          <b>{year}</b><br/>
          {stringifiedAuthors}
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
    const { viewport, mapStyle, selectedFeature, data } = this.state;
    const showPopup = !isEmpty(selectedFeature);

    return (
      <div className="App">
        <Filters
          data={data}
          updateData={this.updateData}
        />
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
          <div className="NavigationControl">
            <NavigationControl
              onViewportChange={this.onViewportChange}
              showCompass={false}
            />
          </div>
        </MapGL>

      </div>
    );
  }
  componentWillMount() {
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
    this._setData(geoJSON);
  }
  _updateData(filters) {
    const data = Object.assign({}, this.state.data);
    // console.log(data);

    console.log(filters);
    // const { mapStyle, data } = this.state;

    // filter data

    // update
    // const newMapStyle = mapStyle
    //   // Add geojson source to map
    //   .setIn(['sources', 'studiesByLocation'], fromJS({ type: 'geojson', data: geoJSON }))

    // this.setState({ mapStyle: newMapStyle, data });
  }
  _setData(data) {
    let typeGroups = groupBy(data.features, item => item.properties.type);
    Object.keys(typeGroups).forEach((key) => isEmpty(key) && delete typeGroups[key]);

    let implementationFeatureCollection = Object.assign({}, data);
    implementationFeatureCollection.features = typeGroups['Implementation study'];

    let effectivenessFeatureCollection = Object.assign({}, data);
    effectivenessFeatureCollection.features = typeGroups['Effectiveness study'];

    let mapStyle = defaultMapStyle
      .setIn(['sources', 'implementationStudiesByLocation'], fromJS({ type: 'geojson', data: implementationFeatureCollection }))
      .set('layers', defaultMapStyle.get('layers').push(dataLayers.implementation))

    mapStyle = mapStyle
      .setIn(['sources', 'effectivenessStudiesByLocation'], fromJS({ type: 'geojson', data: effectivenessFeatureCollection }))
      .set('layers', mapStyle.get('layers').push(dataLayers.effectiveness))

    this.setState({ mapStyle, data: data });
  }
}

export default App;
