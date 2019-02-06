import { fromJS } from 'immutable';
import MAP_STYLE from './style/style.json';

const defautLayer = fromJS({
      "id": "data",
      "type": "symbol",
      "source": "studiesByLocation",
      "layout": {
          "icon-image": "marker-15",
          "icon-allow-overlap": {
              "base": 1,
              "stops": [[0, true], [22, true]]
          },
          "icon-size": {"base": 1, "stops": [[0, 1], [18, 3]]}
      },
      "paint": {}
  }
);

const implementationLayer = fromJS({
      "id": "implementation-data",
      "type": "symbol",
      "source": "implementationStudiesByLocation",
      "layout": {
          "icon-image": "marker-15-teal",
          "icon-allow-overlap": {
              "base": 1,
              "stops": [[0, true], [22, true]]
          },
          "icon-size": {"base": 1, "stops": [[0, 1], [18, 3]]}
      },
      "paint": {}
  }
);

const effectivenessLayer = fromJS({
      "id": "effectiveness-data",
      "type": "symbol",
      "source": "effectivenessStudiesByLocation",
      "layout": {
          "icon-image": "marker-15-red",
          "icon-allow-overlap": {
              "base": 1,
              "stops": [[0, true], [22, true]]
          },
          "icon-size": {"base": 1, "stops": [[0, 1], [18, 3]]}
      },
      "paint": {}
  }
);

export const dataLayers = {
  default: defautLayer,
  implementation: implementationLayer,
  effectiveness: effectivenessLayer
};

export const defaultMapStyle = fromJS(MAP_STYLE)
