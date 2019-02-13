import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import cx from 'classnames';
import './Filters.css';

const icnArrow = require('./assets/icn-arrow.svg');

class Filters extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: [],
      isExpanded: false
    };

    this.handleHeaderClick = this._handleHeaderClick.bind(this);
    this.handleInputChange = this._handleInputChange.bind(this);
  }
  shouldComponentUpdate(nextProps, nextState) {
    const hasUpdatedFilters = nextState.filters.length !== this.state.filters.length
    hasUpdatedFilters && this.props.filterData(nextState.filters);

    return true;
  }
  render() {
    const { data } = this.props;
    const { filters, isExpanded } = this.state;

    const className = cx({
      "Filters": true,
      "Filters--expanded": isExpanded
    });

    const header = filters.length > 0 ? `Filters (${filters.length})` : `Filters`;

    return (
      <div className={className}>
        <div className="Filters-Header" onClick={this.handleHeaderClick}>
          <h2>{header}</h2>
          <img className="Filters-Toggle" src={icnArrow} />
        </div>
        {isExpanded &&
          <div className="Filter-Groups">
            <div className="Filter-Group">
              <h3>Type of study</h3>
              <div className="Filter-GroupList">
                {this._getItems("type")}
              </div>
            </div>
            <div className="Filter-Group">
              <h3>Year of publication</h3>
              <div className="Filter-GroupList">
              {this._getItems("yearGroup")}
              </div>
            </div>
            {/*
            <div className="Filter-Group">
              <h3>Intervention categories</h3>
              <div className="Filter-GroupList">
                {this._getItems("interventionCategories")}
              </div>
            </div>
            */}
            <div className="Filter-Group">
              <h3>Population groups</h3>
              <div className="Filter-GroupList">
                {this._getItems("populationGroups")}
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
  _getItems(property) {
    const { filters } = this.state;

    return this._getValueSet(property).map((value, i) =>{
      const isActive = filters.map(filter => filter.value === value).includes(true);
      return (
        <label key={i}>
          <input
            name={property}
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
  _handleHeaderClick() {
    this.setState({ isExpanded: !this.state.isExpanded })
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
