// pre-defined center in Česke Budějovice
var center = SMap.Coords.fromWGS84(14.4716, 48.9755);
var m = new SMap(JAK.gel("map"), center, 13);
// try to set a location
if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(
		pos => {
			center = SMap.Coords.fromWGS84(pos.coords.longitude, pos.coords.latitude);
			m.setCenter(center);
		},
		error => {console.error(error)},
		{enableHighAccuracy: true});
}
m.addDefaultLayer(SMap.DEF_BASE).enable();

var mouse = new SMap.Control.Mouse(SMap.MOUSE_PAN | SMap.MOUSE_WHEEL | SMap.MOUSE_ZOOM);
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

// reading ginkgos
const run = () => {
	fetch('readGinkgos.php')
		.then(response => {response.json()
		.then(result => {loadMap(result)});})
};

var marker_dict = {};

function loadMap(data) {
	var markers = [];
	var k = 0;

	data.forEach((d, i) => {
		var c = createCard(d.name, d.address, d.author, d.date_added, d.img_path, d.id);

		var g_marker = JAK.mel("div");
		var g_image = JAK.mel("img", {src:"./images/ginkgo-marker.png"});
		g_marker.appendChild(g_image);

		coords_str = d.coords.split(" ")
		coords = SMap.Coords.fromWGS84(coords_str[0], coords_str[1]);

		markers.push(new SMap.Marker(coords, null, {url:g_marker}));
		marker_dict[d.id] = markers[k];
		markers[k].decorate(SMap.Marker.Feature.Card, c);
		k++;
	});

	layer.addMarker(markers);
	smaller_clusters();

    JAK.gel("spinner").style.visibility = "hidden";
}

run();

var adding = false;
var editing = false;
var tmp_marker;
var tmp_layer;

function addInTheMiddle() {
	var coords = m.getCenter();
	if (addingPoint(coords) === false) {
		alert("Nejprve dokončete současné úpravy.")
	}
}

var click =
m.getSignals().addListener(window, "map-contextmenu",
	function(signal) {
		var event = signal.data.event;
		var coords = SMap.Coords.fromEvent(event, m);
		addingPoint(coords);
	});

function handleForm(event) { event.preventDefault(); }

var add_point_form = document.getElementById("add_point_form");
add_point_form.addEventListener('submit', handleForm);
var edit_point_form = document.getElementById("edit_point_form");
edit_point_form.addEventListener('submit', handleForm);

function discardPoint() {
	if (confirm("Opravdu chcete zrušit prováděné úpravy?")) {
		if (adding) {
			adding = false;
			JAK.gel("add_point_form_container").style.visibility = "hidden";
			tmp_layer.removeAll();
			tmp_layer.clear();

			JAK.gel("add_point_name_input").value = "";
			JAK.gel("add_point_author").value = "";
			JAK.gel("add_point_img_picker").value = "";
			JAK.gel("add_point_image_preview").style.display = "none";
			JAK.gel("add_point_incorrect_image_type").style.display = "none";
		} else if (editing) {
			editing = false;
			JAK.gel("edit_point_form_container").style.visibility = "hidden";
			tmp_layer.removeAll();
			tmp_layer.clear();

			layer.addMarker(oldMarker);
			smaller_clusters();

			JAK.gel("edit_point_name_input").value = "";
			JAK.gel("edit_point_name_input").placeholder = "";
			JAK.gel("edit_point_author").value = "";
			JAK.gel("edit_point_author").placeholder = "";
			JAK.gel("edit_point_date").value = "";
			JAK.gel("edit_point_date").placeholder = "";
			JAK.gel("edit_point_img_picker").value = "";
			JAK.gel("edit_point_image_preview").style.display = "none";
			JAK.gel("edit_point_incorrect_image_type").style.display = "none";
		}
	}
}

function showImage(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();

		const fileType = input.files[0]['type'];
		const validImageTypes = ['image/jpeg', 'image/png'];
		if (!validImageTypes.includes(fileType)) {
			if (adding) {
				JAK.gel("add_point_incorrect_image_type").style.display = "block";
				JAK.gel("add_point_image_preview").style.display = "none";
			} else {
				JAK.gel("edit_point_incorrect_image_type").style.display = "block";
				JAK.gel("edit_point_image_preview").style.display = "none";
			}
		} else {
			reader.onload = function (e) {
				if (adding) {
					JAK.gel('add_point_image_preview').src = e.target.result;
					JAK.gel("add_point_image_preview").style.display = "block";
					JAK.gel("add_point_incorrect_image_type").style.display = "none";
				} else {
					JAK.gel('edit_point_image_preview').src = e.target.result;
					JAK.gel("edit_point_image_preview").style.display = "block";
					JAK.gel("edit_point_incorrect_image_type").style.display = "none";
				}
			};

			reader.readAsDataURL(input.files[0]);
		}
	}
}

function removeGinkgo(id) {
	if (confirm("Opravdu chcete odstranit toto Ginkgo?")) {
		_removeGinkgo(id);
	}
}

function _removeGinkgo(id) {
	data = new FormData();
	data.append("id", id);
	$.ajax({
		type: "POST",
		url: "removeGinkgo.php",
		data: data,
		cache: false,
		contentType: false,
		processData: false,
		success: response => {
			if (response.startsWith("Error")) {
				alert("Nastala chyba při mazání z databáze. Zkuste to znovu.")
			} else {
				m.removeCard();
				layer.removeMarker(marker_dict[id]);
				smaller_clusters();
			}
		},
		error: (jqXHR, textStatus, errorThrown) => {
			alert("Nastala chyba při mazání z databáze. Zkuste to znovu.");
			console.error(textStatus+": "+errorThrown);
		}
	});
}

$.fn.restrictInputs = function(restrictPattern){
    var targets = $(this);

    // The characters inside this pattern are accepted
    // and everything else will be 'cleaned'
    // For example 'ABCdEfGhI5' become 'ABCEGI5'
    var pattern = restrictPattern ||
        /[^0-9A-Za-z !#$%()*+,\-\/.:=?@\[\]^_{|}]*/g; // default pattern

    var restrictHandler = function(){
        var val = $(this).val();
        var newVal = val.replace(pattern, '');

        // This condition is to prevent selection and keyboard navigation issues
        if (val !== newVal) {
            $(this).val(newVal);
        }
    };

    targets.on('keyup', restrictHandler);
    targets.on('paste', restrictHandler);
    targets.on('change', restrictHandler);
};

$('input').restrictInputs();