<?php
    $image = $_POST['pic'];
    //Stores the filename as it was on the client computer.
    $imagename = $_FILES['pic']['name'];
    //Stores the filetype e.g image/jpeg
    $imagetype = $_FILES['pic']['type'];
    //Stores any error codes from the upload.
    $imageerror = $_FILES['pic']['error'];
    //Stores the tempname as it is given by the host when uploaded.
    $imagetemp = $_FILES['pic']['tmp_name'];

    //The path you wish to upload the image to
    $imagePath = "./ginkgo_img/";

    if (!file_exists($imagePath)) {
        mkdir($imagePath);
    }

    if(is_uploaded_file($imagetemp)) {
        if(move_uploaded_file($imagetemp, $imagePath.$imagename)) {
            echo $imagePath.$imagename;
        }
        else {
            echo "Failed to move your image. ";
        }
    }
    else {
        echo "Failed to upload your image.";
    }
?>