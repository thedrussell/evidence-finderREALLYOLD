import React, { Component } from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import './Filters.css';

class Filters extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: {}
    };

    this.handleInputChange = this._handleInputChange.bind(this);
  }
  _getTypes() {
    return this._getValueSet('type').map((value, i) =>
      <label key={i}>
        <input
          name="type"
          value={value}
          type="checkbox"
          onChange={this.handleInputChange}
        />
        {value}
      </label>
    );
  }
  _getYears() {
    return this._getValueSet('year').map((value, i) =>
      <label key={i}>
        <input
          name="year"
          value={value}
          type="checkbox"
          onChange={this.handleInputChange}
        />
        {value}
      </label>
    );
  }
  _getInterventionCategories() {
    return this._getValueSet('interventionCategories').map((value, i) =>
      <label key={i}>
        <input
          name="interventionCategories"
          value={value}
          type="checkbox"
          onChange={this.handleInputChange}
        />
        {value}
      </label>
    );
  }
  _getPopulationGroups() {
    return this._getValueSet('populationGroups').map((value, i) =>
      <label key={i}>
        <input
          name="populationGroups"
          value={value}
          type="checkbox"
          onChange={this.handleInputChange}
        />
        {value}
      </label>
    );
  }
  render() {
    return (
      <div className="Filters">
        <h2>Filters</h2>
        <div className="Filter-Group">
          <h3>Type of study</h3>
          <div className="Filter-GroupList">
            {this._getTypes()}
          </div>
        </div>
        <div className="Filter-Group">
          <h3>Year of publication</h3>
          <div className="Filter-GroupList">
            {this._getYears()}
          </div>
        </div>
        <div className="Filter-Group">
          <h3>Intervention categories</h3>
          <div className="Filter-GroupList">
            {this._getInterventionCategories()}
          </div>
        </div>
        <div className="Filter-Group">
          <h3>Population groups</h3>
          <div className="Filter-GroupList">
            {this._getPopulationGroups()}
          </div>
        </div>
      </div>
    )
  }
  componentDidUpdate() {
    this.props.updateData(this.state.filters);
  }
  _getValueSet(key) {
    const { features } = this.props.data;

    const valueSet = features.reduce((found, feature) => {
      const values = feature.properties[key];
      const valueArr = Array.isArray(values) ? values : [values];

      valueArr.forEach((value) => {
        const isNewValue = !found.includes(value);
        isNewValue && found.push(value)
      });

      return found;
    }, []);

    return valueSet.filter(n => n).sort();
  }
  _handleInputChange(event) {
    const { name, value, checked } = event.target;

    let filters = Object.assign({}, this.state.filters);

    if(checked) {
      let array = filters[name] || [];
      array.push(value);
      filters[name] = array;
    }
    if(!checked) {
      filters[name] = filters[name].filter(filter => filter !== value);
    }

    this.setState({ filters });
  }
}

Filters.propTypes = {
  data: PropTypes.object.isRequired,
  updateData: PropTypes.func.isRequired
}

export default Filters;
