<?php
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

    echo json_encode($user_arr, JSON_PRETTY_PRINT);
?>