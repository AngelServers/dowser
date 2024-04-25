import Taiwan from "svg-maps/packages/world/index";
import { SVGMap } from "react-svg-map";
import "react-svg-map/lib/index.css";

import "./map.css";

MapSelector.defaultProps = {
  selectedCountries: [],
};
export default function MapSelector({ selectedCountries }) {
  return (
    <SVGMap
      className="map"
      map={Taiwan}
      isLocationSelected={(country) => {
        if (selectedCountries.includes(country.id)) {
          return true;
        }
      }}
    />
  );
}
