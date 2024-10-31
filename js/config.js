// config.js
export const MAP_CONFIG = {
    initialView: {
        lat: 34.022,
        lng: -118.3337,
        zoom: 10,
        minZoom: 10
    },
    mapTiles: {
        imagery: {
            url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            options: {
                maxZoom: 17,
                attribution: 'Tiles © Esri'
            }
        },
        labels: {
            url: 'https://c.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
            options: {
                maxZoom: 17,
                minZoom: 11,
                attribution: '© OpenStreetMap contributors, © CartoDB'
            }
        }
    },
    colorScales: {
        regional: {
            day: [0, 15],
            week: [0, 45],
            scheme: d3.schemeBlues[9]
        },
        district: {
            day: [0, 5],
            week: [0, 10],
            scheme: d3.schemePurples[9]
        }
    }
};