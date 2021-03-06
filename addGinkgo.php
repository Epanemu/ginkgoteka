<?php
    include('definitions.php');

    function resize_image_width($file, $ext, $w) {
        list($width, $height) = getimagesize($file);
        $newheight = ($w/$width) * $height;
        $newwidth = $w;

        if ($newheight < IMAGE_SAVED_MIN_HEIGHT) {
            $newwidth = (IMAGE_SAVED_MIN_HEIGHT/$newheight) * $newwidth;
            $newheight = IMAGE_SAVED_MIN_HEIGHT;
        }

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
        // include('config.php');
        $root_path = $_SERVER['DOCUMENT_ROOT'];
        include $root_path . '/config/config.php';

        $db = new mysqli($servername, $username, $password, $dbname)
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

    function saveImage() {
        if (!isset($_FILES['pic']) || $_FILES['pic']['error'] != 0) {
            return "";
        }

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
                    $resized = resize_image_width($imagePath."tmp".$ext, $ext, IMAGE_SAVED_WIDTH);
                    // save to a file
                    imagejpeg($resized, $imagePath.$imagename.$special.".jpg");
                    imagedestroy($resized);

                    return $imagePath.$imagename.$special.".jpg";
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
        return null;
    }

    $img_path = null;
    if (isset($_POST['img_path'])) {
        $img_path = $_POST['img_path'];
    } else {
        $img_path = saveImage();
    }

    if ($img_path !== null) {
        if ($img_path != "") {
            list($width, $height) = getimagesize($img_path);
            if ($height <= IMAGE_SAVED_MIN_HEIGHT) {
                $img_style = "wide";
            } else {
                $img_style = "tall";
            }
        } else {
            $img_style = "";
        }

        $data = [
            "name" => htmlspecialchars($_POST["name"]),
            "author" => $_POST["author"] == "" ? "Anonym" : htmlspecialchars($_POST["author"]),
            "coords" => htmlspecialchars($_POST["coords"]),
            "address" => htmlspecialchars($_POST["address"]),
            "img_path" => $img_path,
            "img_style" => $img_style,
            "date_added" => date("Y-m-d H:i:s", isset($_POST["timestamp"]) ? htmlspecialchars($_POST["timestamp"]) : time()),
            // Potential #adds/ip/hour check to protect from spam...
            //"ip_address" => $_SERVER['REMOTE_ADDR'],
        ];

        // on success returns (echoes) json of these data
        addToDatabase($data);
    }
?>