import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import './Filters.css';

class Filters extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }
  render() {
    return (
      <div className="Filters">
      </div>
    )
  }
}

Filters.propTypes = {
  updateData: PropTypes.func.isRequired
}

export default Filters;
