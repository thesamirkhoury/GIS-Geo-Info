import React, { useState } from "react";
import Map, { NavigationControl, Source, Layer, Popup } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import geoJson from "../countries.geojson";

function MapComponent() {
  // api request fileds
  let fields =
    "area,capital,latlng,car,currencies,flags,idd,languages,name,population,tld";
  //state
  const [clickedCountryISO, setClickedCountryISO] = useState(null);
  const [countryData, setCountryData] = useState(null);

  //map style
  const borderLayerStyle = {
    id: "counties-border",
    type: "line",
    paint: {
      "line-color": "blue",
      "line-width": 1.25,
    },
  };
  const fillLayerStyle = {
    id: "countries",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        ["==", ["get", "ISO2"], clickedCountryISO], // Check if the Data property matches the clickedFeatureData
        "red", // Color when the feature is clicked
        "transparent", // Default color
      ],
      "fill-opacity": 0.5,
    },
  };

  // map click handler
  async function handleMapClick(e) {
    if (e.features[0]) {
      let ISO2 = e.features[0].properties.ISO2;

      // highlight the select country
      setClickedCountryISO(ISO2);

      //get data
      let response = await fetch(
        `${process.env.REACT_APP_COUNTRIES_API}/${ISO2}?fields=${fields}`
      );
      if (response.ok) {
        let json = await response.json();
        setCountryData(json);
      } else {
        setClickedCountryISO(null);
      }
    } else {
      // remove the highlighted area
      setClickedCountryISO(null);
    }
  }

  return (  
    <Map
      mapLib={maplibregl}
      initialViewState={{
        latitude: 0,
        longitude: 0,
        zoom: 1.25,
      }}
      style={{ width: "100%", height: " 100vh" }}
      mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_TILER_KEY}`}
      interactiveLayerIds={["countries"]}
      onClick={handleMapClick}
    >
      <Source id="geoJson" type="geojson" data={geoJson}>
        <Layer {...fillLayerStyle} />
        <Layer {...borderLayerStyle} />
      </Source>
      <NavigationControl position="top-left" />
      {countryData && (
        <Popup
          maxWidth="none"
          latitude={Number(countryData.latlng[0])}
          longitude={Number(countryData.latlng[1])}
          onClose={() => {
            setCountryData(null);
          }}
        >
          <div>
            <h1>{countryData.name.common}</h1>
            <p>Official name: {countryData.name.official}</p>
            <p>Capital: {countryData.capital}</p>
            <p>Area: {countryData.area}</p>
            <p>Population estimate: {countryData.population}</p>
            <p>
              Currency:{" "}
              {Object.values(countryData.currencies).map(
                (currency) => currency.name
              )}
            </p>
            <p>
              Languages Spoken:{" "}
              {Object.values(countryData.languages).map(
                (language) => `${language}, `
              )}
            </p>
            <p>
              Country Call Code: {countryData.idd.root}
              {countryData.idd.suffixes[0]}
            </p>
            <p>Driving on the {countryData.car.side} side</p>
            <p>Internet domain (TLD) : {countryData.tld}</p>
            <img
              width="50%"
              src={countryData.flags.png}
              alt={countryData.flags.alt}
              className="flag"
            />
          </div>
        </Popup>
      )}
    </Map>
  );
}

export default MapComponent;
