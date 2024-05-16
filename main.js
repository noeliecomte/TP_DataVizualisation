async function fetchData(){
    url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const response = await fetch(url)
    const data = await response.json()
    return data;
}

function processData(geoData){
    return geoData.features.map(feature => {
        return{
            coordinate: feature.geometry.coordinates,
            magnitude: feature.properties.mag,
            time: feature.properties.time
        }
    });
}

/*
fetchData()
    .then(rawData => {
        cleanData = processData(rawData)
        console.log(cleanData[0]);
    })
*/

function plotData(earthquakeData){
    plotMap(earthquakeData);
}

function plotMap(earthquakeData){
    const trace1={
        type: 'scattergeo',
        locationmode: 'world',
        lon: earthquakeData.map(d => d.coordinate[0]),
        lat: earthquakeData.map(d => d.coordinate[1]),
        text: earthquakeData.map(d => `Magnitude: ${d.magnitude} Time: ${new Date(d.time)}`),
        marker:{
            size:earthquakeData.map(d => d.magnitude * 4),
            color:earthquakeData.map(d => d.magnitude),
            cmin:0,
            cmax:8,
            colorscale: 'Viridis',
            colorbar:{
                title:'Magnitude'
            }
        }
    };
    const layout1 = {
        title: 'Global Earthquakes in the Last Week',
        geo:{
            scope: 'world',
            projection:{
                type:'natural earth'
            },
            showland:true,
            landcolor: 'rgb(243, 243, 243)',
            countrycolor:'rgb(204, 204, 204)'
        }
    };

    Plotly.newPlot('earthquakePlot', [trace1], layout1);
}
 

function plotMagnitudeHistogram(earthquakeData){
    const magnitudes = earthquakeData.map(d => d.magnitude);
    const trace = {
        x: magnitudes,
        type:'histogram',
        marker:{
            color:'blue'
        }
    };
    const layout = {
        title: 'Histogram of Earthquake Magnitudes',
        xaxis: {title: 'Magnitude'},
        yaxis: {title: 'Frequency'}
    };
    Plotly.newPlot('magnitudeHistogram', [trace] , layout);
}


function plotDailyFrequency(earthquakeData){
    const dates = earthquakeData.map(d => new Date(d.time).toISOString().slice(0,10));
    const dateCounts = dates.reduce((acc,date) => {
        acc[date] = (acc[date] || 0) +1;
        return acc;
    }, {});
    const trace2 ={
        x: Object.keys(dateCounts),
        y: Object.values(dateCounts),
        type:'scatter',
        mode: 'lines+markers',
        marker:{color:'red'}
    };
    const layout2 = {
        title: 'Daily Earthquake Frequency',
        xaxis: {title: 'Date'},
        yaxis: {title: 'Number of earthquakes'}
      };
    Plotly.newPlot('DailyEarthquakeFrequency', [trace2], layout2);
}


function plotMagnitudeVSDepth(earthquakeData){
    const magnitudes = earthquakeData.map(d => d.magnitude);
    const depths = earthquakeData.map(d => d.coordinate[2]);
    const trace = {
        x: magnitudes,
        y: depths,
        mode: 'markers',
        type: 'scatter',
        marker: {size:8, color:'green'}
    };
    const layout3 = {
        title: 'Magnitude vs Depth',
        xaxis:{title: 'Magnitude'},
        yaxis:{title:'Depth (km)'},
        height:600
    };
    Plotly.newPlot('magnitudeDepthPlot', [trace], layout3);
}

fetchData()
    .then(rawData =>processData(rawData))
    //.then(cleanData => console.log(cleanData))
    //.then(cleanData =>plotData(cleanData))  
    .then(cleanData =>{plotData(cleanData);plotMagnitudeHistogram(cleanData);plotDailyFrequency(cleanData);plotMagnitudeVSDepth(cleanData)})