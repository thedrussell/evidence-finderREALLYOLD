import React, { Component } from 'react';
import { Marker, Popup } from 'react-map-gl';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import './Feature.css';

import FeatureItem from './FeatureItem';

class Feature extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }
  _getFeatureItems() {
    const { geometry } = this.props;

    let markers;

    switch(geometry.type) {
      case "Point":
         markers = this._renderFeatureItem(geometry.coordinates[0], geometry.coordinates[1]);
         break;
      case "GeometryCollection":
        markers = geometry.geometries.map((point) => this._renderFeatureItem(point.coordinates[0], point.coordinates[1])).flat();
        break;
      default:
        break;
    }

    return markers;
  }
  _renderFeatureItem(latitude, longitude) {
    const { properties, zoom } = this.props;

    return (
      <FeatureItem
        key={latitude+longitude}
        latitude={latitude}
        longitude={longitude}
        zoom={zoom}
        {...properties}
      />
    );
  }
  render() {
    return (
      <div className="Feature">
        {this._getFeatureItems()}
      </div>
    )
  }
}

Feature.propTypes = {
  properties: PropTypes.object.isRequired,
  geometry: PropTypes.object.isRequired,
  zoom: PropTypes.number.isRequired,
}

export default Feature;
