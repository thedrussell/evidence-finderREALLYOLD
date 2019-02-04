import React, { Component } from 'react';
import { Marker, Popup } from 'react-map-gl';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import './FeatureItem.css';

const icnMarker = require('./assets/icn-marker.svg')

class FeatureItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showPopup: false
    };

    this.handleMarkerClick = this._handleMarkerClick.bind(this);
    this.handlePopupClose = this._handlePopupClose.bind(this);
  }
  render() {
    const { latitude, longitude, zoom, title, url } = this.props;
    const { showPopup } = this.state;

    const hasPopup = !isEmpty(title);
    const hasUrl = !isEmpty(url);

    const marker =
      <Marker
        key={latitude+longitude}
        latitude={latitude}
        longitude={longitude}
        offsetLeft={0}
        offsetTop={0}
      >
        <div
          className="FeatureItem-Marker"
          onClick={this.handleMarkerClick}
          style={{ transform: `scale(${Math.sqrt(zoom)})`}}
        >
          <img src={icnMarker} />
        </div>
      </Marker>;

      const popup = hasPopup &&
        <Popup
          latitude={latitude}
          longitude={longitude}
          sortByDepth={true}
          closeButton={true}
          closeOnClick={true}
          onClose={this.handlePopupClose}
        >
          {hasUrl ? <a href={url} target="_blank">{title}</a> : {title}}
        </Popup>;

    return (
      <div className="FeatureItem">
        {marker}
        {showPopup && popup}
      </div>
    )
  }
  _handleMarkerClick() {
    this.setState({ showPopup: true });
  }
  _handlePopupClose() {
    this.setState({ showPopup: false });
  }
}

FeatureItem.propTypes = {
  longitude: PropTypes.number.isRequired,
  latitude: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  title: PropTypes.string,
  url: PropTypes.string,
}

export default FeatureItem;
