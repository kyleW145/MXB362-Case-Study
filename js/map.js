// map.js
import { MAP_CONFIG } from './config.js';
import { state } from './state.js';

export function initializeMap() {
    state.map = L.map('map').setView(
        [MAP_CONFIG.initialView.lat, MAP_CONFIG.initialView.lng],
        MAP_CONFIG.initialView.zoom
    );
    state.map.setMinZoom(MAP_CONFIG.initialView.minZoom);

    // Add base layers
    L.tileLayer(MAP_CONFIG.mapTiles.imagery.url, MAP_CONFIG.mapTiles.imagery.options).addTo(state.map);
    L.tileLayer(MAP_CONFIG.mapTiles.labels.url, MAP_CONFIG.mapTiles.labels.options).addTo(state.map);

    return state.map;
}

export function addGeoJSONLayer(url, color, weight) {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: function (feature) {
                    return {
                        color: color,
                        weight: weight,
                        fillOpacity: 0
                    };
                }
            }).addTo(state.map);
        })
        .catch(error => {
            console.error('Error loading GeoJSON:', error);
        });
}