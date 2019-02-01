import React, { Component } from 'react';
import MapGL, { Popup } from 'react-map-gl';
import logo from './logo.svg';
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = "pk.eyJ1IjoicmMzIiwiYSI6ImNlTWkwODAifQ.Ekx8PkIebxZdaZxksxz2BA";

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
      }
    };

    this.onViewportChange = this._onViewportChange.bind(this);
  }
  _onViewportChange(viewport) {
    this.setState({ viewport });
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
        />
      </div>
    );
  }
}

export default App;
