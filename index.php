<!DOCTYPE html>
<html>
	<head>
		<title>Ginkgotéka - v0.1</title>
		<meta charset="UTF-8">

		<link rel="icon" href="images/ginkgo-marker.png">
		<link rel="stylesheet" type="text/css" href="style.css">

		<script src="https://api.mapy.cz/loader.js"></script>
		<script src="jquery-3.4.1.min.js"></script>
		<script>Loader.load()</script>
	</head>
	<body>
		<div id="container">
			<div id="map"></div>
			<div id="add_point_form_container" class="form_container">
				<form id="add_point_form" class="point_form" action="#" method="POST" enctype=multipart/form-data id="adder">
					<input type="text" name="name" class="name_input" id="add_point_name_input" placeholder="Název" required/>

					<p>Obrázek Ginkga:</p>
					<input type="file" name="pic" id="add_point_img_picker" accept="image/png,image/jpeg" onchange="showImage(this);"/><br>
					<p id="add_point_incorrect_image_type" class="incorrect_image_type"><b>Tento typ není podporován, prosím vyberte obrázek ve formátu JPG nebo PNG.</b></p>
					<img id="add_point_image_preview" class="image_preview" />
					<div id="add_point_footer">
						<input type="text" name="author" placeholder="Nálezce" id="add_point_author" class="short_input" size="10" >
						<p id="add_point_address" class="address_field"></p>
					</div>
					<div class="confirmation_buttons">
						<!-- <input id="add_point_submit_btn" class="button_submit" type="submit" value="Přidat Ginkgo"> -->
						<button id="add_point_submit_btn" class="button_submit" onclick="addPoint();">Přidat Ginkgo</button>
						<button id="add_point_cancel_btn" class="button_cancel" onclick="discardPoint();">Zrušit</button>
					</div>
				</form>
			</div>
			<div id="edit_point_form_container" class="form_container">
				<form id="edit_point_form" class="point_form" action="#" method="POST" enctype=multipart/form-data id="editor">
					<input type="text" name="name" class="name_input" id="edit_point_name_input"/>

					<p>Obrázek Ginkga:</p>
					<input type="file" name="pic"  id="edit_point_img_picker" accept="image/png,image/jpeg" onchange="showImage(this);" /><br>
					<p id="edit_point_incorrect_image_type" class="incorrect_image_type"><b>Tento typ není podporován, prosím vyberte obrázek ve formátu JPG nebo PNG.</b></p>
					<img id="edit_point_image_preview" class="image_preview"/>
					<div id="edit_point_footer">
						<div  class="short_input">
							<input type="text" name="author" id="edit_point_author" size="10" >
							<input type="text" name="date" id="edit_point_date" size="10" >
						</div>
						<p id="edit_point_address" class="address_field"></p>
					</div>
					<div class="confirmation_buttons">
						<!-- <input id="edit_point_submit_btn" class="button_submit" type="submit" onclick="editPoint()" value="Uložit"> -->
						<button id="edit_point_submit_btn" class="button_submit" onclick="editPoint();">Uložit</button>
						<button id="edit_point_cancel_btn" class="button_cancel" onclick="discardPoint();">Zrušit</button>
					</div>
				</form>
			</div>
			<div id="spinner-overlay">
				<img src="images/spinner.png" id="spinner">
			</div>
			<img src="images/add_btn.png" id="add_btn" onclick="addInTheMiddle();">
		</div>
		<script src="./mapCard.js"></script>
		<script src="./mainFunctions.js"></script>
		<script src="./addGinkgo.js"></script>
		<script src="./editGinkgo.js"></script>
	</body>
</html>