import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import './Filters.css';

class Filters extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: []
    };

    this.handleInputChange = this._handleInputChange.bind(this);
  }
  _getTypes() {
    const { filters } = this.state;

    return this._getValueSet('type').map((value, i) => {
      const isActive = filters.map(filter => filter.value === value).includes(true);
      return (
        <label key={i}>
          <input
            name="type"
            value={value}
            type="checkbox"
            onChange={this.handleInputChange}
            checked={isActive}
          />
          {value}
        </label>
      );
    });
  }
  _getYears() {
    const { filters } = this.state;

    return this._getValueSet('year').map((value, i) => {
      const isActive = filters.map(filter => filter.value === value).includes(true);
      return (
        <label key={i}>
          <input
            name="year"
            value={value}
            type="checkbox"
            onChange={this.handleInputChange}
            checked={isActive}
          />
          {value}
        </label>
      );
    });
  }
  _getInterventionCategories() {
    const { filters } = this.state;

    return this._getValueSet('interventionCategories').map((value, i) => {
      const isActive = filters.map(filter => filter.value === value).includes(true);
      return (
        <label key={i}>
          <input
            name="interventionCategories"
            value={value}
            type="checkbox"
            onChange={this.handleInputChange}
            checked={isActive}
          />
          {value}
        </label>
      );
    });
  }
  _getPopulationGroups() {
    const { filters } = this.state;

    return this._getValueSet('populationGroups').map((value, i) =>{
      const isActive = filters.map(filter => filter.value === value).includes(true);
      return (
        <label key={i}>
          <input
            name="populationGroups"
            value={value}
            type="checkbox"
            onChange={this.handleInputChange}
            checked={isActive}
          />
          {value}
        </label>
      );
    });
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
  shouldComponentUpdate(nextProps, nextState) {
    const hasUpdatedFilters = nextState.filters.length !== this.state.filters.length

    hasUpdatedFilters && this.props.filterData(nextState.filters);

    return true;
  }
  _getValueSet(key) {
    const data = Object.assign({}, this.props.data);

    const valueSet = data.features.reduce((found, feature) => {
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
    let filters = this.state.filters.slice();

    const newFilter = {
      name: name,
      value: value
    }

    if(checked) {
      filters.push(newFilter);
    }
    if(!checked) {
      filters = filters.filter(filter => !isEqual(filter, newFilter));
    }

    this.setState({ filters });
  }
}

Filters.propTypes = {
  data: PropTypes.object.isRequired,
  filterData: PropTypes.func.isRequired
}

export default Filters;
