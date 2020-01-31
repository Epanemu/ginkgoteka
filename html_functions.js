// functions for the html
function addPoint() {
	if (!adding) {
		return;
	}
	const fileType = JAK.gel("add_point_img_picker").files[0]['type'];
	const validImageTypes = ['image/jpeg', 'image/png'];
	if (!validImageTypes.includes(fileType)) {
		alert("Vyberte obrázek ve formátu png nebo jpeg.")
		return;
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
	if (!too_close && adding && (JAK.gel("add_point_author").value !== "" || confirm("Přidat do Ginkgotéky bez nálezce?"))) {

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

					var c = createCard(data.name, data.address, data.author, data.date_added, data.img_path, data.id);
					var g_marker = JAK.mel("div");
					var g_image = JAK.mel("img", {src:"./images/ginkgo-marker.png"});
					g_marker.appendChild(g_image);
			
					new_marker = new SMap.Marker(newCoords, null, {url:g_marker});
					new_marker.decorate(SMap.Marker.Feature.Card, c);
					layer.addMarker(new_marker);
					smaller_clusters();
			
					tmp_layer.removeAll();
					tmp_layer.clear();
				} catch (e) {
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

function discardPoint() {
	if (adding && confirm("Opravdu chcete zrušit provedené úpravy?")) {
		adding = false;
    	JAK.gel("add_point_form_container").style.visibility = "hidden";
		tmp_layer.removeAll();
		tmp_layer.clear();

    	JAK.gel("add_point_name_input").value = "";
    	JAK.gel("add_point_author").value = "";
		JAK.gel("add_point_img_picker").value = "";
		JAK.gel("add_point_image_preview").style.display = "none";
		JAK.gel("add_point_incorrect_image_type").style.display = "none";
	}
	if (editing && confirm("Opravdu chcete zrušit provedené úpravy?")) {
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
			console.log(response);
			if (response.startsWith("Error")) {
				alert("Nastala chyba při mazání z databáze. Zkuste to znovu.")
			} else {
				m.removeCard();
				layer.removeMarker(marker_dict[id]);
			}
		},
		error: (jqXHR, textStatus, errorThrown) => {
			alert("Nastala chyba při mazání z databáze. Zkuste to znovu."); 
			console.error(textStatus+": "+errorThrown);
		}
	});
}

function editingGinkgo(id) {
	if (editing || adding) {
		alert("Nejprve dokončete stávající úpravu.")
		return;
	}
	editing = true;
	editingId = id;

	c = m.getCard();

	// TODO: add proper form, probably another one... (most likely, so I can edit date (and position!) and give it a proper save button)
	// then add as new, but with set date and remove the old one.
	// also check if image has been changed, if not, do not upload it, reuse the path.

	oldCoords = marker_dict[id].getCoords();
	// header -> paragraph -> bold -> innerHTML
	oldName = c.getHeader().children[0].children[0].innerHTML

	oldImgPath = c.getBody().children[0].src
	
	f = c.getFooter().children[0];
	oldAddress = f.children[0].innerHTML;
	p = f.children[1].innerHTML;
	oldAuthor = p.substring(8, p.indexOf("<br>"));
	oldDate = p.substring(p.indexOf("<br>(")+5, p.lastIndexOf(")"));
	
	JAK.gel('edit_point_image_preview').src = oldImgPath;
	JAK.gel('edit_point_image_preview').style.display = "block";
	JAK.gel('edit_point_name_input').value = oldName;
	JAK.gel('edit_point_name_input').placeholder = oldName;
	JAK.gel('edit_point_address').innerHTML = oldAddress;
	JAK.gel('edit_point_author').value = oldAuthor;
	JAK.gel('edit_point_author').placeholder = oldAuthor;
	JAK.gel('edit_point_date').value = oldDate;
	JAK.gel('edit_point_date').placeholder = oldDate;

	tmp_layer = new SMap.Layer.Marker();
	m.addLayer(tmp_layer).enable();

	var g_marker = JAK.mel("div");
	var g_image = JAK.mel("img", {src:"./images/bw-ginkgo-marker.png"});
	g_marker.appendChild(g_image);
    tmp_marker = new SMap.Marker(oldCoords, null, {url:g_marker});

	tmp_marker.decorate(SMap.Marker.Feature.Draggable);

	m.getSignals().addListener(tmp_marker, "marker-drag-stop", () => {
		new SMap.Geocoder.Reverse(tmp_marker.getCoords(), geocoder => {
			JAK.gel("edit_point_address").innerHTML = geocoder.getResults().label;
	    });
	});

    tmp_layer.addMarker(tmp_marker);

	JAK.gel("edit_point_form_container").style.visibility = "visible";
	
	m.removeCard();
	oldMarker = marker_dict[id];
	layer.removeMarker(marker_dict[id]);
	smaller_clusters();

}

function editPoint() {
	if (!editing) {
		return;
	}

	if (JAK.gel("edit_point_img_picker").files.length > 0) {
		const fileType = JAK.gel("edit_point_img_picker").files[0]['type'];
		const validImageTypes = ['image/jpeg', 'image/png'];
		if (!validImageTypes.includes(fileType)) {
			alert("Vyberte obrázek ve formátu png nebo jpeg.")
			return;
		}
		useOldImgPath = false;
	} else {
		useOldImgPath = true;
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

	if (!too_close) {

		if (JAK.gel('edit_point_name_input').value.trim() == "")
			JAK.gel('edit_point_name_input').value = JAK.gel('edit_point_name_input').placeholder;
		if (JAK.gel('edit_point_author').value.trim() == "")
			JAK.gel('edit_point_author').value = JAK.gel('edit_point_author').placeholder;
		if (JAK.gel('edit_point_date').value.trim() == "")
			JAK.gel('edit_point_date').value = JAK.gel('edit_point_date').placeholder;

		var address = JAK.gel("edit_point_address").innerHTML;
		var coords_str = newCoords.toWGS84(2).join(" ");

		dateArr = JAK.gel("edit_point_date").value.split(".")
		timestamp = NaN;
		if (dateArr.length == 3)
			timestamp = Date.parse(dateArr[1].trim()+"/"+dateArr[0].trim()+"/"+dateArr[2].trim())
		if (isNaN(timestamp)) {
			alert("Datum není ve správném formátu (dd. mm. yyyy), pro ponechání původního lze toto pole nechat prázdné.")
			return;
		}

		var data_to_send = new FormData($('#edit_point_form')[0]);
		data_to_send.append("coords", coords_str);
		data_to_send.append("address", address);
		data_to_send.append("timestamp", timestamp/1000);
		if (useOldImgPath)
			data_to_send.append("img_path", oldImgPath);

		editing = false;
		JAK.gel("edit_point_form_container").style.visibility = "hidden";

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

					JAK.gel("edit_point_author").value = "";
					JAK.gel("edit_point_date").value = "";
					JAK.gel("edit_point_name_input").value = "";
					JAK.gel("edit_point_img_picker").value = "";
					JAK.gel("edit_point_image_preview").style.display = "none";
					JAK.gel("edit_point_incorrect_image_type").style.display = "none";

					var c = createCard(data.name, data.address, data.author, data.date_added, data.img_path, data.id);
					var g_marker = JAK.mel("div");
					var g_image = JAK.mel("img", {src:"./images/ginkgo-marker.png"});
					g_marker.appendChild(g_image);
			
					new_marker = new SMap.Marker(newCoords, null, {url:g_marker});
					new_marker.decorate(SMap.Marker.Feature.Card, c);
					layer.addMarker(new_marker);
					smaller_clusters();
			
					tmp_layer.removeAll();
					tmp_layer.clear();

					_removeGinkgo(editingId);
				} catch (e) {
					alert("Nastala chyba při ukládání do databáze. Zkuste to znovu."); 
					console.error(dataString)
					JAK.gel("edit_point_form_container").style.visibility = "visible";
					editing = true;
				}
			},
			error: (jqXHR, textStatus, errorThrown) => {
				alert("Nastala chyba při ukládání do databáze. Zkuste to znovu.");
				JAK.gel("edit_point_form_container").style.visibility = "visible";
				editing = true;
				console.error(textStatus+": "+errorThrown);
			}
		});
	}
}