var center = SMap.Coords.fromWGS84(14.4716, 48.9755); //pre-defined center in Česke Budějovice
var m = new SMap(JAK.gel("map"), center, 13);
m.addDefaultLayer(SMap.DEF_BASE).enable();
//m.addDefaultControls();
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

// make the cluster smaller not at all effective, but I didn't find another way
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


// functions for the html
function addPoint() {
	const fileType = JAK.gel("img_picker").files[0]['type'];
	const validImageTypes = ['image/jpeg', 'image/png'];
	if (!validImageTypes.includes(fileType)) {
		alert("Vyberte obrázek ve formátu png nebo jpeg.")
		return;
	}
	
	var newCoords = tmp_marker.getCoords();
	
	/* check if not too close */
	var too_close = false;

	ginkgos.forEach((d, i) => {
		var coords_str = d.coords.split(" ")
		var coords = SMap.Coords.fromWGS84(coords_str[0], coords_str[1]);
		if (coords.distance(newCoords) < 20) {
			alert("Není možné přidat ginkgo tak blízko k jinému!");
			too_close = true;
		}
	});

	var author = JAK.gel("add_point_author").value;
	author = author.trim();
	if (!too_close && adding && (author !== "" || confirm("Přidat do Ginkgotéky bez nálezce?"))) {

		adding = false;
		JAK.gel("add_point_form_container").style.visibility = "hidden";

		var address = JAK.gel("add_point_address").innerHTML;

		JAK.gel("add_point_author").value = "";

		var coords_str = newCoords.toWGS84(2).join(" ");

		var name = JAK.gel("name_input").value;
		JAK.gel("name_input").value = "";

		name = name.trim();
		var name_str = escape(name);

		var author_str;
		if (author !== "")
			author_str = escape(author);
		else
			author_str = null;

			date_added = new Date(Date.now());
		date_str = date_added.getDate().toString() + ". " + (date_added.getMonth()+1).toString() + ". " + date_added.getFullYear().toString();

		var c = new SMap.Card();
		c.getHeader().innerHTML = "<b>"+name+"</b>";
		c.getFooter().innerHTML = '<div style="display:flex"><p style="font-size:0.9em;flex-basis:50%;margin:0.5em 1em 0 0;">'+address+'</p><p style="font-size:0.9em;margin:0.5em 1em 0 0;">Přidal: '+(author_str===null?"Anonym":author)+"<br>("+date_str+")</p></div>";
		c.getBody().style.margin = "0px";
		c.getBody().innerHTML = 'The image could not be loaded';

		$.ajax({
			type: "POST",
			url: "addImage.php",
			data: new FormData($('#add_point_form')[0]),
			cache:false,
			contentType: false,
			processData: false,
			success: function(path) {
				c.getBody().innerHTML = '<img src="'+path+'" style="width:100%">';
				JAK.gel("img_picker").value = "";
				JAK.gel("add_point_image_preview").style.display = "none";

				data = {
					name: name_str,
					address: address,
					coords: coords_str,
					author: author_str,
					img_path: path
				};

				fetch("http://data.nemecekjiri.cz/api.php/records/ginkgo_dtb/", {
					method: 'POST',
					mode: 'cors',
					cache: 'no-cache',
					credentials: 'same-origin',
					headers: {
						'Content-Type': 'application/json',
					},
					redirect: 'follow', // manual, *follow, error
					referrer: 'no-referrer', // no-referrer, *client
					body: JSON.stringify(data), // body data type must match "Content-Type" header
				})
			}
		});

		var g_marker = JAK.mel("div");
		var g_image = JAK.mel("img", {src:"./images/ginkgo-marker.png"});
		g_marker.appendChild(g_image);

		new_marker = new SMap.Marker(newCoords, null, {url:g_marker});
		new_marker.decorate(SMap.Marker.Feature.Card, c);
		layer.addMarker(new_marker);
		smaller_clusters();

		tmp_layer.removeAll();
		tmp_layer.clear();

	}
	
}

function discardPoint() {
	if (adding ){//&& confirm("Opravdu chcete zrušit přidávání Ginkga?")) {
		adding = false;
    	JAK.gel("add_point_form_container").style.visibility = "hidden";
		tmp_layer.removeAll();
		tmp_layer.clear();

    	JAK.gel("name_input").value = "";
    	JAK.gel("add_point_author").value = "";
		JAK.gel("img_picker").value = "";
		JAK.gel("add_point_image_preview").style.display = "none";
	}
}

function showImage(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		
		const fileType = input.files[0]['type'];
		const validImageTypes = ['image/jpeg', 'image/png'];
		if (!validImageTypes.includes(fileType)) {
			JAK.gel('incorrect_image_type').innerHTML = "<b>Tento typ není podporován, prosím vyberte obrázek ve formátu JPG nebo PNG.</b>";
			JAK.gel("incorrect_image_type").style.display = "block";
			JAK.gel("add_point_image_preview").style.display = "none";
		} else {
			reader.onload = function (e) {
				JAK.gel('add_point_image_preview').src = e.target.result;
				JAK.gel("add_point_image_preview").style.display = "block";
				JAK.gel("incorrect_image_type").style.display = "none";
			};
	
			reader.readAsDataURL(input.files[0]);
		}
		
    }
}

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