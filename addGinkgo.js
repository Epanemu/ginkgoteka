function addingPoint(coords) {
	if (adding || editing)
		return false;
	adding = true;

    tmp_layer = new SMap.Layer.Marker(); /* Vrstva pro značku */
	m.addLayer(tmp_layer).enable();

    new SMap.Geocoder.Reverse(coords, geocoder => {
		JAK.gel("add_point_address").innerHTML = geocoder.getResults().label;
    });

	var g_marker = JAK.mel("div");
	var g_image = JAK.mel("img", {src:"./images/new-ginkgo-marker.png"});
	g_marker.appendChild(g_image);
    tmp_marker = new SMap.Marker(coords, null, {url:g_marker});

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

function addPoint() {
	if (!adding || JAK.gel("add_point_name_input").value == "") {
		return;
	}

	let form_unfilled_check = false;
	if (JAK.gel("add_point_img_picker").files.length === 0) {
		if (JAK.gel("add_point_author").value !== "") {
			form_unfilled_check = confirm("Přidat do Ginkgotéky bez obrázku?");
		} else {
			form_unfilled_check = confirm("Přidat do Ginkgotéky bez obrázku a nálezce?");
		}
	} else {
		const fileType = JAK.gel("add_point_img_picker").files[0]['type'];
		const validImageTypes = ['image/jpeg', 'image/png'];
		if (!validImageTypes.includes(fileType)) {
			alert("Vyberte obrázek ve formátu png nebo jpeg.")
			return;
		}

		form_unfilled_check = (JAK.gel("add_point_author").value !== "" || confirm("Přidat do Ginkgotéky bez nálezce?"));
	}

	JAK.gel("add_point_name_input").value = JAK.gel("add_point_name_input").value.trim();
	if (JAK.gel("add_point_name_input").value == "") {
		alert("Název nesmí obsahovat pouze mezery");
		return;
	}

	var newCoords = tmp_marker.getCoords();

    /* check if not too close */
	var too_close = false;

	layer.getMarkers().forEach((marker, i) => {
		var coords = marker.getCoords()
		if (coords.distance(newCoords) < 20) {
			alert("Není možné přidat ginkgo tak blízko k jinému!");
			too_close = true;
		}
	});

	JAK.gel("add_point_author").value = JAK.gel("add_point_author").value.trim();
	if (!too_close && adding && form_unfilled_check) {

		adding = false;
		JAK.gel("add_point_form_container").style.visibility = "hidden";

		var address = JAK.gel("add_point_address").innerHTML;
		var coords_str = newCoords.toWGS84(2).join(" ");

        var data_to_send = new FormData($('#add_point_form')[0]);
        data_to_send.append("coords", coords_str);
        data_to_send.append("address", address);

		$.ajax({
			type: "POST",
			url: "addGinkgo.php",
			data: data_to_send,
			cache:false,
			contentType: false,
			processData: false,
			success: function(dataString) {
				try {
					data = JSON.parse(dataString);

					JAK.gel("add_point_author").value = "";
					JAK.gel("add_point_name_input").value = "";
					JAK.gel("add_point_img_picker").value = "";
					JAK.gel("add_point_image_preview").style.display = "none";

					var c = createCard(data.name, data.address, data.author, data.date_added, data.img_path, data.id, data.img_style);
					var g_marker = JAK.mel("div");
					var g_image = JAK.mel("img", {src:"./images/ginkgo-marker.png"});
					g_marker.appendChild(g_image);

					new_marker = new SMap.Marker(newCoords, null, {url:g_marker});
					new_marker.decorate(SMap.Marker.Feature.Card, c);
					layer.addMarker(new_marker);
					smaller_clusters();

					tmp_layer.removeAll();
					tmp_layer.clear();

					marker_dict[data.id] = new_marker;
				} catch (e) {
					console.error(e);
					alert("Nastala chyba při ukládání do databáze. Zkuste to znovu.");
					JAK.gel("add_point_form_container").style.visibility = "visible";
					adding = true;
				}
			},
			error: (jqXHR, textStatus, errorThrown) => {
				alert("Nastala chyba při ukládání do databáze. Zkuste to znovu.");
				JAK.gel("add_point_form_container").style.visibility = "visible";
				adding = true;
				console.error(textStatus+": "+errorThrown);
			}
		});
	}
}