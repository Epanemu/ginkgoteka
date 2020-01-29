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
    // TODO: udelat pres layer a getmarkers... nemusim pak pridavat do ginkgos, nemusim si je mozna ani pamatovat
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

		var coords_str = newCoords.toWGS84(2).join(" ");

		var name = JAK.gel("name_input").value;

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
		c.getBody().innerHTML = 'Obrázek se nepodařilo načíst';

        var data_to_send = new FormData($('#add_point_form')[0]);
        data_to_send.append("coords", coords_str);
        data_to_send.append("address", address);

		$.ajax({
			type: "POST",
			url: "addImage.php",
			data: data_to_send,
			cache:false,
			contentType: false,
			processData: false,
			success: function(dataString) {
				data = JSON.parse(dataString);

                JAK.gel("add_point_author").value = "";
                JAK.gel("name_input").value = "";

				c.getBody().innerHTML = '<img src="'+data.img_path+'" style="width:100%">';
				JAK.gel("img_picker").value = "";
				JAK.gel("add_point_image_preview").style.display = "none";
			},
			error: (jqXHR, textStatus, errorThrown) => {
				alert("Nastala chyba při ukládání do databáze. Zkuste to znovu."); 
				console.error(textStatus+": "+errorThrown);
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