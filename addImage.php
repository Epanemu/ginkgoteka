<?php
    $image = $_POST['pic'];

    $imagePath = "./ginkgo_img/";
    if (!file_exists($imagePath)) {
        mkdir($imagePath);
    }

    $filetype = explode(".", $_FILES['pic']['name']);

    // Filename is current timestamp
    $imagename = time();
    $special = 0;
    while (file_exists($imagePath.$imagename.$special.".".end($filetype))) {
        $special += 1;
    }

    $imagetype = $_FILES['pic']['type'];

    $imageerror = $_FILES['pic']['error'];

    $imagetemp = $_FILES['pic']['tmp_name'];

    if(is_uploaded_file($imagetemp)) {
        if(move_uploaded_file($imagetemp, $imagePath.$imagename.$special.".".end($filetype))) {
            echo $imagePath.$imagename.$special.".".end($filetype);
        }
        else {
            echo "Failed to move your image. ";
        }
    }
    else {
        echo "Failed to upload your image.";
    }
?>