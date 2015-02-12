$(document).ready(function() {
    jQuery.get('./data/meteorites-updated_05-14-13.csv', function(data) {
        addDensity();
    });
});

// simple function that converts the density data to the markers on screen
// the height of each marker is relative to the density.
function addDensity() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    //d3.js globe: marcneuwirth.com/blog/2012/06/24/creating-the-earth-with-d3-js/
    //Setup path for outerspace
    var space = d3.geo.azimuthal()
    .mode("equidistant")
    .translate([600, 750]);

    //Setup path for globe
    var projection = d3.geo.azimuthal()
    .mode("orthographic")
    .scale(400)
    .translate([600, 750]);

    var path = d3.geo.path()
    .projection(projection); //custom d3 has size marker

    //Setup interacting behavior - spin earth
    var zoom = d3.behavior.zoom(true)
    .translate(projection.origin())
    .scale(projection.scale())
    .scaleExtent([100, 800])
    .on("zoom", move);

    var circle = d3.geo.greatCircle();

    var moonsvg = d3.select("#moonv2")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .call(zoom)
    .on("dblclick.zoom", null);
    
    //Create the base globe
    var backgroundCircle = moonsvg.append("circle")
    .attr('cx', 600)
    .attr('bottom', 0)
    .attr('cy', 750)
    .attr('r', 400)
    .attr('class', 'globe')
    .attr("filter", "url(#glow)")
    .attr("fill", "url(#gradBlue)");


    //Add all of the countries to the globe
    var g = moonsvg.append("g"),
    locations,
    features;

    //loading json for countries + paths for countries
    d3.json("./data/world-countries.json", function(collection) {
        features = g.selectAll(".feature").data(collection.features);

        features.enter().append("path")
        .attr("class", "feature")
        .attr("d", function(d){ return path(circle.clip(d)); })
     });

    //loading csv meteorite data to convert to json + paths for meteor markers
    d3.csv('./data/meteorites-updated_05-14-13.csv', function(d){
        // console.log(d["name"]);
        myData = JSON.stringify(d);
        var json = JSON.parse(myData);
        var geojson = geoJSON(json);
        var lunaiteTooltip = d3.select("body").append("div").attr("class", "lunaiteTooltip");
        var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

        locations = g.selectAll(".location").data(geojson.features);
        locations.enter().append("path")
        .attr("class", "location")
        .attr("d", function(d){ return path(circle.clip(d)); })
        .on("mouseover", function(d) { //http://bl.ocks.org/KoGor/5994804
          lunaiteTooltip.text(d.properties.name)
          .style("left", (d3.event.pageX + 7) + "px")
          .style("top", (d3.event.pageY - 15) + "px")
          .style("display", "block")
          .style("opacity", 1);
        })
        .on("mouseout", function(d) {
          lunaiteTooltip.style("opacity", 0)
          .style("display", "none");
        })


        // .on("mouseover", function() {
        //      console.log(d);

        //      svg.selectAll("path").data(locations).enter().append("svg:circle")
        //     .attr("fill", "red")
        //     .attr("r", 15)
        //     .attr("d", function(d){return path(circle.clip(d));})
        //     .attr("cx", 90)
        //     .attr("cy", 100)
        // });
    



      //   .tooltip(function(d, i) {
      //       console.log(JSON.stringify(d, null, 4));
      //       console.log("PATH: " + path(circle.clip(d)));
      //       var r, svg;
      //       r = +d3.select(this).attr('r');
      //       svg = d3.select(document.createElement("svg")).attr("height", 50);
      //       g = svg.append("g");
      //       g.append("rect").attr("width", r * 10).attr("height", 10);
      //       g.append("text").text("mass: " + d.properties.mass).attr("dy", "10");
      //       return {
      //         type: "popover",
      //         title: d.properties.name,
      //         content: svg,
      //         detection: "shape",
      //         placement: "center",
      //         gravity: "right",
      //         position: [width / 2, height / 4],
      //         displacement: [r, -50],
      //         mousemove: false
      //     };
      // });

    });


function geoJSON(data){
        //convert JSON data to GeoJSON:

        var _geoJSON = {
            'type': 'FeatureCollection',
            'features': [ ]
        };

        for (var i = 0; i < data.length; i++){
            if(data[i].recclass.indexOf("Lunar") !== -1){
                if((data[i].reclat) && (parseFloat(data[i].reclong) != 0.000000)) {
                   _geoJSON.features.push( {
                    'type': 'Feature',
                    'geometry': {
                        'type' : 'Point',
                            'coordinates' : [data[i].reclat, data[i].reclong] //[x,y]
                        },
                        'properties': {
                            'name' : data[i]['name'],
                            'mass' : data[i]['mass']
                        }
                    });
               }
           }
        }; //end FOR i
        console.log(_geoJSON);
        return _geoJSON;

    }; 

     //Redraw all items with new projections
     function redraw(){
        locations.attr("d", function(d){
            return path(circle.clip(d));
        });

        features.attr("d", function(d){
            return path(circle.clip(d));
        });
    }


    function move() {
        if(d3.event){
            var scale = d3.event.scale;
            var origin = [d3.event.translate[0] * -1, d3.event.translate[1]];

            projection.origin(origin);
            circle.origin(origin);
            
            //globe and stars spin in the opposite direction because of the projection mode
            var spaceOrigin = [origin[0] * -1, origin[1] * -1];
            space.origin(spaceOrigin);
            redraw();
        }
    }


    // d3 lunaites from the top of the browser
    // first set of lunaites
    //random dataset with 15 elements for 15 lunaites. 
    var d3dataset = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    var circlesFirst = moonsvg.selectAll("TEST")
    .data(d3dataset)
    .enter()
    .append("svg:circle")
    .attr("id", "TEST")
            // .attr("filter", "url(#glow)");

            circlesFirst.attr("cx", function(d){
                return Math.floor(Math.random() * (1050-800 +1)) + 800;
            })
            .attr("cy", -10)
            .attr("r", 1)
            .attr("fill", "white")

        //TODO: delays for each lunaite, animated bezier curves
        .transition()
        .delay(function(d, i){
            return Math.floor(Math.random() * 100000);
        })
        .duration(4000)
        .attr("r", 5)
        .attr("cx", 150)
        .attr("cy", 120)
        .remove();

    //second set of lunaites        
    var circlesSecond = moonsvg.selectAll("TEST2")
    .data(d3dataset)
    .enter()
    .append("svg:circle")
    .attr("id", "TEST2")
            // .attr("filter", "url(#glow)");

            circlesSecond.attr("cx", function(d){
                return Math.floor(Math.random() * (150-120 +1)) + 120;
            })
            .attr("cy", 120)
            .attr("r", 5)
            .attr("fill", "white")

        //TODO: delays for each lunaite, animated bezier curves
        .transition()
        .delay(function(d, i){
            return Math.floor(Math.random() * 200000);
        })
        .duration(5000)
        .attr("r", 1)
        .attr("cx", function(d){
            return Math.floor(Math.random() * (750-500 +1)) + 500;
        })
        .attr("cy", 500)
        .remove();
    }
