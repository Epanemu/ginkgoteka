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
        // probably useless, but in case of transparent images, the background will be set to white
        $white = imagecolorallocate($dst, 255, 255, 255);
        imagefill($dst, 0, 0, $white);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);

        return $dst;
    }

    function addToDatabase($data) {
        include('config.php');
        
        $db = new mysqli($server, $user, $password, $dtb_name)
        or die('Error connecting to MySQL server.');

        $stmt = mysqli_prepare($db,"INSERT INTO ginkgo_dtb (name, author, coords, address, img_path, date_added, ip_address) VALUES (?,?,?,?,?,?,?)");

        mysqli_stmt_bind_param($stmt, "sssssss", 
            $data["name"], $data["author"], $data["coords"], $data["address"], $data["img_path"], $data["date_added"], $data["ip_address"]);
        
        mysqli_stmt_execute($stmt);
        if (mysqli_stmt_affected_rows($stmt)) {
            $data['id'] = mysqli_insert_id($db);
            echo json_encode($data, JSON_PRETTY_PRINT);
        } else {
            echo 'Error saving into database.';
        }

        mysqli_close($db);
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
                                
                $data = [
                    "name" => $_POST["name"],
                    "author" => $_POST["author"] == "" ? "Anonym" : $_POST["author"],
                    "coords" => $_POST["coords"],
                    "address" => $_POST["address"],
                    "img_path" => $imagePath.$imagename.$special.".jpg",
                    "date_added" => date("Y-m-d H:i:s"),
                    "ip_address" => $_SERVER['REMOTE_ADDR'],
                ];

                // on success returns json of these data
                addToDatabase($data);
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