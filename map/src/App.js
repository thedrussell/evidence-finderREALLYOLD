import React, { Component } from 'react';
import MapGL from 'react-map-gl';
import isEmpty from 'lodash/isEmpty';
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import Feature from './Feature';
import Filters from './Filters';
const geoJSON = require('./data/geo.json');

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapStyle: "mapbox://styles/rc3/cjffxvy9wb3ou2snutp645m00/",
      viewport: {
        latitude: 38.88,
        longitude: -98,
        zoom: 3,
        minZoom: 2,
        bearing: 0,
        pitch: 0
      },
      data: geoJSON
    };

    this.onViewportChange = this._onViewportChange.bind(this);
    this.updateData = this._updateData.bind(this);
  }
  _onViewportChange(viewport) {
    this.setState({ viewport });
  }
  _getFeatures() {
    const { data } = this.state;
    const { zoom } = this.state.viewport;

    return data.features.map((feature, i) => {
      const hasGeometry = !isEmpty(feature.geometry);

      const featureComp = hasGeometry &&
        <Feature
          key={i}
          properties={feature.properties}
          geometry={feature.geometry}
          zoom={zoom}
        />;

      return featureComp;
    }).filter(n => n);
  }
  render() {
    const { viewport, mapStyle } = this.state;
    return (
      <div className="App">
        <MapGL
          {...viewport}
          width="100%"
          height="100%"
          mapStyle={mapStyle}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={this.onViewportChange}
        >
          {this._getFeatures()}
        </MapGL>
        <Filters
          
        />
      </div>
    );
  }
  _updateData(filters) {
    const { data } = this.state;

    // filter data

    this.setState({ data });
  }
}

export default App;
