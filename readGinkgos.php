<?php
    include('definitions.php');
    include('config.php');

    $db = new mysqli($server, $user, $password, $dtb_name)
    or die('Error connecting to MySQL server.');

    $query = "SELECT * FROM ginkgo_dtb WHERE active=1";
    mysqli_query($db, $query) or die('Error querying database.');

    $result = mysqli_query($db, $query);


    $user_arr = [];
    while ($row = $result->fetch_object()){
        $user_arr[] = $row;
    }

    for ($i = 0; $i < count($user_arr); $i++) {
        list($width, $height) = getimagesize($user_arr[$i] -> img_path);
        if ($height <= IMAGE_SAVED_MIN_HEIGHT) {
            $user_arr[$i] -> img_style = "wide";
        } else {
            $user_arr[$i] -> img_style = "tall";
        }
    }

    echo json_encode($user_arr, JSON_PRETTY_PRINT);
?>