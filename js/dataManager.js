// dataManager.js
import { state } from './state.js';
import { getSelectedFilters } from './filters.js';
import { createLegend, displayBarChart } from './visualisation.js';
import { MAP_CONFIG } from './config.js';

export async function loadCrimeData(date, timeClass) {
    if (state.currentViewState === 'district' && state.currentAprec) {
        return loadCrimeDataRegion(date, timeClass, state.currentAprec);
    }

    const geoData = await d3.json("https://kylew145.github.io/MXB362-Case-Study/data/geojson/police_regions.geojson");
    const aprecNames = geoData.features.map(feature => feature.properties.APREC);
    
    try {
        const crimeDataArray = await Promise.all(
            aprecNames.map(aprec => 
                d3.json(`https://kylew145.github.io/MXB362-Case-Study/data/crime/Crime_Data_${aprec}.json`).catch(() => [])
            )
        );

        const { crimeCount, crimeCategories } = processCrimeData(
            crimeDataArray, 
            aprecNames, 
            date, 
            timeClass
        );

        updatevisualisation(geoData, crimeCount, crimeCategories);

    } catch (error) {
        console.error('Error loading crime data:', error);
    }
}

async function loadCrimeDataRegion(date, timeClass, targetAprec) {
    try {
        const geoData = await d3.json("https://kylew145.github.io/MXB362-Case-Study/data/geojson/LAPD_Reporting_Districts.geojson");
        const matchingFeature = geoData.features.find(feature => feature.properties.APREC === targetAprec);

        if (!matchingFeature) {
            console.error("No matching feature found for Aprec:", targetAprec);
            return;
        }

        const crimeData = await d3.json(`data/crime/Crime_Data_${targetAprec}.json`);
        state.crimeData = crimeData;

        const { crimeCount, crimeCategories } = processDistrictCrimeData(
            crimeData,
            date,
            timeClass
        );

        updateDistrictvisualisation(geoData, targetAprec, crimeCount, crimeCategories);

    } catch (error) {
        console.error('Error loading district crime data:', error);
    }
}

function processCrimeData(crimeDataArray, aprecNames, date, timeClass) {
    const crimeCount = {};
    const crimeCategories = {};
    const filters = getSelectedFilters();

    crimeDataArray.forEach((crimeData, index) => {
        const region = aprecNames[index];
        
        crimeData.forEach(crime => {
            if (shouldIncludeCrime(crime, date, timeClass, filters)) {
                crimeCount[region] = (crimeCount[region] || 0) + 1;
                
                crimeCategories[region] = crimeCategories[region] || {};
                const category = crime.Crime_Category;
                crimeCategories[region][category] = (crimeCategories[region][category] || 0) + 1;
            }
        });
    });

    return { crimeCount, crimeCategories };
}

function processDistrictCrimeData(crimeData, date, timeClass) {
    const crimeCount = {};
    const crimeCategories = {};
    const filters = getSelectedFilters();

    crimeData.forEach(crime => {
        if (shouldIncludeCrime(crime, date, timeClass, filters)) {
            const reportDistrict = crime.Report_District;
            crimeCount[reportDistrict] = (crimeCount[reportDistrict] || 0) + 1;
            
            crimeCategories[reportDistrict] = crimeCategories[reportDistrict] || {};
            const category = crime.Crime_Category;
            crimeCategories[reportDistrict][category] = (crimeCategories[reportDistrict][category] || 0) + 1;
        }
    });

    return { crimeCount, crimeCategories };
}

function shouldIncludeCrime(crime, date, timeClass, filters) {
    let includeRecord = false;
    
    if (state.isWeeklyView) {
        includeRecord = crime.Date === date;
    } else {
        includeRecord = crime.Date === date && crime.Time_Class === timeClass;
    }

    return includeRecord &&
        filters.weaponCategories.includes(crime.Weapon_Category) &&
        filters.victimSex.includes(crime.Victim_Sex) &&
        filters.victimDescent.includes(crime.Victim_Descent_Category) &&
        filters.victimAge.includes(crime.Age_Category) &&
        filters.crimeCategories.includes(crime.Crime_Category);
}

function updatevisualisation(geoData, crimeCount, crimeCategories) {
    if (state.currentChoroplethLayer) {
        state.map.removeLayer(state.currentChoroplethLayer);
    }

    const colorScale = state.isWeeklyView ? 
        d3.scaleQuantize()
            .domain(MAP_CONFIG.colorScales.regional.week)
            .range(MAP_CONFIG.colorScales.regional.scheme) :
        d3.scaleQuantize()
            .domain(MAP_CONFIG.colorScales.regional.day)
            .range(MAP_CONFIG.colorScales.regional.scheme);

    state.currentChoroplethLayer = L.geoJSON(geoData, {
        style: feature => ({
            fillColor: colorScale(crimeCount[feature.properties.APREC] || 0),
            weight: 5,
            opacity: 1,
            color: 'black',
            fillOpacity: 0.8
        }),
        onEachFeature: (feature, layer) => {
            const regionName = feature.properties.APREC;
            
            layer.on('mouseover', (e) => {
                displayBarChart(crimeCategories[regionName], e, regionName);
            });

            layer.on('mouseout', () => {
                if (state.activeChart) {
                    state.activeChart.remove();
                    state.activeChart = null;
                }
            });

            layer.on('click', () => {
                handleRegionClick(layer, regionName);
            });
        }
    }).addTo(state.map);

    const grades = state.isWeeklyView ? [0, 10, 20, 30, "45+"] : [0, 5, 10, "15+"];
    createLegend(grades, MAP_CONFIG.colorScales.regional.scheme);
}

function updateDistrictvisualisation(geoData, targetAprec, crimeCount, crimeCategories) {
    if (state.currentChoroplethLayer) {
        state.map.removeLayer(state.currentChoroplethLayer);
    }

    const filteredGeoData = {
        type: "FeatureCollection",
        features: geoData.features.filter(feature => feature.properties.APREC === targetAprec)
    };

    const colorScale = state.isWeeklyView ?
        d3.scaleQuantize()
            .domain(MAP_CONFIG.colorScales.district.week)
            .range(MAP_CONFIG.colorScales.district.scheme) :
        d3.scaleQuantize()
            .domain(MAP_CONFIG.colorScales.district.day)
            .range(MAP_CONFIG.colorScales.district.scheme);

    state.currentChoroplethLayer = L.geoJSON(filteredGeoData, {
        style: feature => ({
            fillColor: colorScale(crimeCount[feature.properties.NAME] || 0),
            weight: 2,
            opacity: 1,
            color: 'black',
            fillOpacity: 0.8
        }),
        onEachFeature: (feature, layer) => {
            const reportDistrict = feature.properties.NAME;
            
            layer.on('mouseover', (e) => {
                displayBarChart(crimeCategories[reportDistrict], e, `District ${reportDistrict}`);
            });

            layer.on('mouseout', () => {
                if (state.activeChart) {
                    state.activeChart.remove();
                    state.activeChart = null;
                }
            });
        }
    }).addTo(state.map);

    const grades = state.isWeeklyView ? [0, 2, 4, 6, 8, "10+"] : [0, 1, 2, 3, 4, "5+"];
    createLegend(grades, MAP_CONFIG.colorScales.district.scheme);
}

function handleRegionClick(layer, regionName) {
    state.currentViewState = 'district';
    state.currentAprec = regionName;
    const bounds = layer.getBounds();
    state.map.fitBounds(bounds);
    
    const date = document.getElementById('dateInput').value;
    loadCrimeDataRegion(date, state.current, regionName);
}
