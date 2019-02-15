import React, { Component } from 'react';
import MapGL, { Popup, NavigationControl, FlyToInterpolator } from 'react-map-gl';
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
      data: geoJSON,
      viewport: {
        latitude: 52,
        longitude: 0,
        zoom: 4,
        minZoom: 2,
        bearing: 0,
        pitch: 0
      },
      selectedFeature: null,
      doUpdateMap: false,
    };

    this.handleMapClicked = this._handleMapClicked.bind(this);
    this.handlePopupClose = this._handlePopupClose.bind(this);

    this.onViewportChange = this._onViewportChange.bind(this);
    this.filterData = this._filterData.bind(this);

    this.popupTimeout = null;
  }
  _onViewportChange(viewport) {
    this.setState({ viewport: {...this.state.viewport, ...viewport}});
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
    const hasData = !isEmpty(data);
    const showPopup = !isEmpty(selectedFeature);

    return (
      <div className="App">
        <Filters
          data={data}
          filterData={this.filterData}
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
    this._loadMapData();
  }
  componentDidUpdate() {
    const { doUpdateMap } = this.state;
    doUpdateMap && this._updateMapData();
  }
  _handleMapClicked(event) {
    const { features } = event;
    const selectedFeature = !isEmpty(features) && features.find(f => f.source === 'implementationStudiesByLocation' || f.source === 'effectivenessStudiesByLocation');

    const hasFeature = !isEmpty(selectedFeature);

    if(hasFeature) {
      this.setState({ selectedFeature: selectedFeature });
      this._goToViewport(selectedFeature.geometry.coordinates)
    }
  }
  _goToViewport(coordinates) {
    this._onViewportChange({
      longitude: coordinates[0],
      latitude: coordinates[1],
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 200
    })
  }
  _handlePopupClose() {
    clearTimeout(this.popupTimeout);

    this.popupTimeout = setTimeout(() => {
      this.setState({ selectedFeature: null });
    }, 100);
  }
  _filterData(filters) {
    let data = Object.assign({}, geoJSON);

    const hasFilters = filters.length > 0;

    if(hasFilters) {
      const filteredFeatures = data.features.reduce((filteredFeaturesArr, feature) => {
        const { properties } = feature;

        // --------
        // check if matches ALL filters <-- use if filters are dynamic
        const isExcluded = filters
          .map(filter => properties[filter.name].includes(filter.value))
          .includes(false);

        !isExcluded && filteredFeaturesArr.push(feature);
        // --------
        // // check if matches ANY filter <-- use if filters are static
        // const isIncluded = filters
        //   .map(filter => properties[filter.name].includes(filter.value))
        //   .includes(true);
        //
        // isIncluded && filteredFeaturesArr.push(feature);
        // --------

        return filteredFeaturesArr;
      }, []);

      data.features = filteredFeatures;
    }

    this.setState({ data, doUpdateMap: true });
  }
  _updateMapData() {
    const { mapStyle, data } = this.state;
    const featureCollections = this._getFeatureCollections(data)

    const newMapStyle = mapStyle
      .setIn(['sources', 'implementationStudiesByLocation'], fromJS({ type: 'geojson', data: featureCollections.implementation }))
      .setIn(['sources', 'effectivenessStudiesByLocation'], fromJS({ type: 'geojson', data: featureCollections.effectiveness }))

    this.setState({ mapStyle: newMapStyle, doUpdateMap: false });
  }
  _loadMapData() {
    const featureCollections = this._getFeatureCollections(geoJSON);

    let mapStyle = defaultMapStyle
      .setIn(['sources', 'implementationStudiesByLocation'], fromJS({ type: 'geojson', data: featureCollections.implementation }))
      .set('layers', defaultMapStyle.get('layers').push(dataLayers.implementation))

    mapStyle = mapStyle
      .setIn(['sources', 'effectivenessStudiesByLocation'], fromJS({ type: 'geojson', data: featureCollections.effectiveness }))
      .set('layers', mapStyle.get('layers').push(dataLayers.effectiveness))

    this.setState({ mapStyle, data: geoJSON });
  }
  _getFeatureCollections(data) {

    const implementationFeatures = data.features.filter(n => n.properties.type === 'Implementation study');
    let implementationFeatureCollection = Object.assign({}, geoJSON);
    implementationFeatureCollection.features = implementationFeatures;

    const effectivenessFeatures = data.features.filter(n => n.properties.type === 'Effectiveness');
    let effectivenessFeatureCollection = Object.assign({}, geoJSON);
    effectivenessFeatureCollection.features = effectivenessFeatures;

    return {
      implementation: implementationFeatureCollection,
      effectiveness: effectivenessFeatureCollection
    }
  }
}

export default App;
