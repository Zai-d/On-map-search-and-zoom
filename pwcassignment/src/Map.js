import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import axios from 'axios';
import "./map.css"

mapboxgl.accessToken = 'pk.eyJ1IjoiemFpZGgiLCJhIjoiY2xjZDZwOThyMGF3aTN3cHU5bjhvNmgweiJ9.uoMkvDXyEXWsyDGDFrbgWQ';
let timer;

export default function Map() {

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [zoom, setZoom] = useState(4);
  const [noResult, setNoResult] = useState('')

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [longitude, latitude],
      zoom: zoom
    });
  }, [longitude, latitude, zoom]);

  const [isLoading, setIsLoading] = useState(false);
  const [city, setCity] = useState('');
  const [cityChosen, setCityChosen] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOnChange, setIsOnChange] = useState(true);
  useEffect(() => {
    function handleSearch() {
      clearTimeout(timer);
      if (city.length === 0) {
        setSuggestions([]);
        return;
      };
      timer = setTimeout(async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`https://api.locationiq.com/v1/autocomplete?key=pk.f0e243e14c2eef45faade1ad57332fb2&q=${city}`);
          var suggestions = response.data;
          setSuggestions(suggestions);
          setNoResult("")
          console.log("requested")
          setIsLoading(false);

        }
        catch (e) {
          console.log(e.message)
          setNoResult("No Result")
          setIsLoading(false);

        }

      }
        , 600);

    }
    handleSearch();

  }
    , [city])


  function handleSuggestionClick(suggestion) {
    setCityChosen(suggestion.display_name)
    setLongitude(suggestion.lon);
    setLatitude(suggestion.lat);
    setZoom(15);
    setSuggestions([]);

  }
  function onClickSearch(event) {
    event.preventDefault();

    clearTimeout(timer);
    if (cityChosen.length === 0) {
      setSuggestions([]);
      return;
    };
    timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`https://api.locationiq.com/v1/autocomplete?key=pk.f0e243e14c2eef45faade1ad57332fb2&q=${cityChosen}`);
        var suggestions = response.data;
        setSuggestions(suggestions);
        setNoResult("")
        console.log("requested")
        setIsLoading(false);

      }
      catch (e) {
        console.log(e.message)
        setNoResult("No Result")
        setIsLoading(false);

      }

    }
      , 600);

  }
  return (
    <>
      <p>Check to make it on input</p>
      <input id="switch" type="checkbox" checked={isOnChange} onClick={() => setIsOnChange(!isOnChange)}></input>
      <label for="switch"></label>
      <div className="mainContainer">
        <div ref={mapContainer} className="map-container" />
        <form onSubmit={isOnChange ? (e) => e.preventDefault() : onClickSearch} className="formField">
          <input type="city" className="inputField" id="city" name="city" value={cityChosen} onChange={e => { (isOnChange && setCity(e.target.value)); setCityChosen(e.target.value) }} placeholder="Enter a City" />

          <button type="submit">Search</button>
        </form>
        {suggestions.length > 0 ? (
          <div className="suggestionList">
            <ul>
              {noResult ? <li className="">{noResult}</li> : suggestions.map(suggestion => (
                <li key={suggestion.osm_id} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          </div>
        ) : isLoading ? <span className="loader"></span> : <></>}

      </div>


    </>
  );
}