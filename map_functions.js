// pre-defined center in Česke Budějovice
var center = SMap.Coords.fromWGS84(14.4716, 48.9755); 
var m = new SMap(JAK.gel("map"), center, 13);
m.addDefaultLayer(SMap.DEF_BASE).enable();

var mouse = new SMap.Control.Mouse(SMap.MOUSE_PAN | SMap.MOUSE_WHEEL | SMap.MOUSE_ZOOM); /* mouse control */
m.addControl(mouse);

var layer = new SMap.Layer.Marker();
m.addLayer(layer).enable();

/* set up clusters */
function constructor(id, options) {
	var cluster;
	if (!!options) {
		options.color = "#d1960f";
		cluster = new SMap.Marker.Cluster(id, options);
	} else {
		cluster = new SMap.Marker.Cluster(id, {color : "#d1960f"});
	}
	cluster.setSize(0,50);
	return cluster;
}
var clusterer = new SMap.Marker.Clusterer(m, 50, constructor);
layer.setClusterer(clusterer);

// make the cluster smaller - this is not at all effective, but I didn't find another way
function smaller_clusters(e, elm) {
    var clust = clusterer.getClusters();
	for (var huh in clust) {
		clust[huh].setSize(0,50);
	}
}
m.getSignals().addListener(window, "zoom-stop", smaller_clusters);

var ginkgos;	/* container for all data that is received from the server */

/* adding markers */
const run = () => {
	fetch('http://data.nemecekjiri.cz/api.php/records/ginkgo_dtb/?filter=active,eq,1')
		.then(response => response.json())
		.then(result => loadMap(result.records));
};	

function loadMap(data) {
	var markers = [];
	var k = 0;

	ginkgos = data;

	data.forEach((d, i) => {
		date_added = new Date(d.date_added);
		date_str = date_added.getDate().toString() + ". " + (date_added.getMonth()+1).toString() + ". " + date_added.getFullYear().toString();

		let author = "Anonym"
		if (d.author !== null)
			author = unescape(d.author);


		var c = new SMap.Card();
		c.getHeader().innerHTML = '<p class="ginkgo_card_name"><b>'+unescape(d.name)+'</b></p><img class="ginkgo_card_remove" onClick="remove" src=images/remove.png /><img class="ginkgo_card_edit" src=images/edit.png />';
		c.getFooter().innerHTML = '<div class="ginkgo_card"><p class="ginkgo_card_address">'+d.address+'</p><p>Přidal: '+author+"<br>("+date_str+")</p></div>";
		c.getBody().style.margin = "0px";
		c.getBody().innerHTML = '<img src="'+d.img_path+'" class="ginkgo_card_img">';

		var g_marker = JAK.mel("div");
		var g_image = JAK.mel("img", {src:"./images/ginkgo-marker.png"});
		g_marker.appendChild(g_image);

		coords_str = d.coords.split(" ")
		coords = SMap.Coords.fromWGS84(coords_str[0], coords_str[1]);

		markers.push(new SMap.Marker(coords, null, {url:g_marker}));
		markers[k].decorate(SMap.Marker.Feature.Card, c);
		k++;
	});

	layer.addMarker(markers);
	smaller_clusters();

    JAK.gel("spinner").style.visibility = "hidden";
}

run();

var adding = false;
var tmp_marker;
var tmp_layer;

function addingPoint(coords) {
	if (adding)
		return null;
	adding = true;

    tmp_layer = new SMap.Layer.Marker(); /* Vrstva pro značku */
	m.addLayer(tmp_layer).enable();

    new SMap.Geocoder.Reverse(coords, geocoder => {
		JAK.gel("add_point_address").innerHTML = geocoder.getResults().label;
    });

	var g_marker = JAK.mel("div");
	var g_image = JAK.mel("img", {src:"./images/bw-ginkgo-marker.png"});
	g_marker.appendChild(g_image);
    tmp_marker = new SMap.Marker(coords, null, {url:g_marker});

    //tmp_marker.decorate(SMap.Marker.Feature.Card, c);
	tmp_marker.decorate(SMap.Marker.Feature.Draggable);

	m.getSignals().addListener(tmp_marker, "marker-drag-stop", () => {
		new SMap.Geocoder.Reverse(tmp_marker.getCoords(), geocoder => {
			JAK.gel("add_point_address").innerHTML = geocoder.getResults().label;
	    });
	});

    tmp_layer.addMarker(tmp_marker);
    smaller_clusters();

    JAK.gel("add_point_form_container").style.visibility = "visible";
}

function addInTheMiddle() {
	var coords = m.getCenter()
	addingPoint(coords);
}

var click =
m.getSignals().addListener(window, "map-contextmenu",
	function(signal) {
		var event = signal.data.event;
		var coords = SMap.Coords.fromEvent(event, m);
		addingPoint(coords);
	});



/*
function click2(e, elm) {
    var coords = SMap.Coords.fromEvent(e.data.event, m);
    alert(coords.toWGS84(2).reverse().join(" "))
}
m.getSignals().addListener(window, "map-click", click2);


var click = function(signal) {
    var event = signal.data.event;
    var coords = SMap.Coords.fromEvent(event, m);
    new SMap.Geocoder.Reverse(coords, geocoder => alert(geocoder.getResults().label));
}
var odpoved = function(geocoder) {
    var results = geocoder.getResults();
    var address = results.label;
    c.getFooter().innerHTML = address;
}

var signals = m.getSignals();
signals.addListener(window, "map-click", click);


*/