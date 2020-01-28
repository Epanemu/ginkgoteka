<?php
    function resize_image($file, $w, $h, $crop=FALSE) {
        list($width, $height) = getimagesize($file);
        $r = $width / $height;
        if ($w/$h > $r) {
            $newwidth = $h*$r;
            $newheight = $h;
        } else {
            $newheight = $w/$r;
            $newwidth = $w;
        }

        $src = imagecreatefromjpeg($file);
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
        $special = 0;
        while (file_exists($imagePath.$imagename.$special.$ext)) {
            $special += 1;
        }

        $imagetemp = $_FILES['pic']['tmp_name'];

        if(is_uploaded_file($imagetemp)) {
            if(move_uploaded_file($imagetemp, $imagePath.$imagename.$special.$ext)) {
                echo $imagePath.$imagename.$special.$ext;
            }
            else {
                echo "Error: Failed to move your image. ";
            }
        }
        else {
            echo "Error: Failed to upload your image.";
        }
    } else {
        echo "Error: Unsupported filetype"
    }
?>