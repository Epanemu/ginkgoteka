<?php
    function resize_image_width($file, $ext, $w) {
        list($width, $height) = getimagesize($file);
        $newheight = ($w/$width) * $height;
        $newwidth = $w;

        if ($ext == ".jpg") {
            $src = imagecreatefromjpeg($file);
        } else {
            $src = imagecreatefrompng($file);
        }
        $dst = imagecreatetruecolor($newwidth, $newheight);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);

        return $dst;
    }

    $image = $_POST['pic'];

    $ext = "";
    switch ($_FILES['pic']['type']) {
        case "image/png":
            $ext = ".png";
        break;
        case "image/jpeg":
            $ext = ".jpg";
        break;
        default:
            $ext = "";
    }

    if($ext != "") {
        $imagePath = "./ginkgo_img/";
        if (!file_exists($imagePath)) {
            mkdir($imagePath);
        }

        // Filename is current timestamp
        $imagename = time();
        // and a number in case of collision
        $special = 0;
        while (file_exists($imagePath.$imagename.$special.".jpg")) {
            $special += 1;
        }

        $imagetemp = $_FILES['pic']['tmp_name'];

        if(is_uploaded_file($imagetemp)) {
            if(move_uploaded_file($imagetemp, $imagePath."tmp".$ext)) {
                $resized = resize_image_width($imagePath."tmp".$ext, $ext, 280);
                // save to a file
                imagejpeg($resized, $imagePath.$imagename.$special.".jpg");
                imagedestroy($resized);
                // return the name of the file
                echo $imagePath.$imagename.$special.".jpg";
            }
            else {
                echo "Error: Failed to move your image. ";
            }
        }
        else {
            echo "Error: Failed to upload your image.";
        }
    } else {
        echo "Error: Unsupported filetype";
    }
?>