//Add Url from the Earthquakes 2.5+ in the past day
let queryurl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson'

//Using Leaflet, create a map that plots all the earthquakes from your dataset based on their longitude and latitude.
d3.json(queryurl).then(function (data){
    createFeatures(data.features);
});

//Include popups that provide additional information about the earthquake when its associated marker is clicked.

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}<\h3>
        <hr><p>${new Date(feature.properties.time)}<\p>
        <p>Magnitude=${feature.properties.mag}<\p>
        <p>Depth=${feature.geometry.coordinates[2]}`)
    }
//Your data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color. 
//Earthquakes with higher magnitudes should appear larger, and earthquakes with greater depth should appear darker in color.
// Define arrays to hold the size markers;

    function markerSize(magnitude) {
        return magnitude * 5;
    }

    function getColor(depth) {
        var colorScale = d3.scaleLinear()
        .domain([0,10,50,100])
        .range(['#008000','#FFFF00','#FFA500','#FF0000'])
        return colorScale(depth);
    }

    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {

            let magnitude = feature.properties.mag;
            let depth = feature.geometry.coordinates[2];

            let markerOptions = {
                radius: markerSize (magnitude),
                fillColor: getColor(depth),
                color: 'black',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            return L.circleMarker(latlng, markerOptions);
        },
        onEachFeature: onEachFeature
    });

    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

//Create a legend that will provide context for your map data.
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let labels = [];

        let depthRanges = [0,10,50,100];
        let colors = ['#008000','#FFFF00','#FFA500','#FF0000'];

        for (let i = 0; i <depthRanges.length; i++) {
        div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' +
        depthRanges[i] + (depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] + '<br>' : '+');
        }

        return div;
    };
    
   
    // Create a baseMaps object.
    let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
    };


    //Create an overlay for the legend
    let overlayMaps = {
        "Earthquakes": earthquakes,
    };


    // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]    
});

  
  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  legend.addTo(myMap);

}


