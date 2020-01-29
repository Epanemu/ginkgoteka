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

	layer.getMarkers().forEach((marker, i) => {
		var coords = marker.getCoords()
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
				data = JSON.parse(dataString);
				console.log(data)

                JAK.gel("add_point_author").value = "";
                JAK.gel("name_input").value = "";
				JAK.gel("img_picker").value = "";
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
			},
			error: (jqXHR, textStatus, errorThrown) => {
				alert("Nastala chyba při ukládání do databáze. Zkuste to znovu."); 
				console.error(textStatus+": "+errorThrown);
			}
		});

	}
	
}

function discardPoint() {
	if (adding) {
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

function removeGinkgo(id) {
	if (confirm("Opravdu chcete odstranit toto Ginkgo?")) {
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
					return;
				}
			},
			error: (jqXHR, textStatus, errorThrown) => {
				alert("Nastala chyba při mazání z databáze. Zkuste to znovu."); 
				console.error(textStatus+": "+errorThrown);
			}
		});
	}
}