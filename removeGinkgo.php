<?php
    // include("config.php");
    $root_path = $_SERVER['DOCUMENT_ROOT'];
    include $root_path . '/config/config.php';

    $db = new mysqli($servername, $username, $password, $dbname)
    or die('Error connecting to MySQL server.');

    $stmt = mysqli_prepare($db,"UPDATE ginkgo_dtb SET active=0 WHERE id=(?);");

    mysqli_stmt_bind_param($stmt, "i", $_POST["id"]);

    mysqli_stmt_execute($stmt);
    if (mysqli_stmt_affected_rows($stmt))
        echo 'Success';
    else
        echo 'Error updating database.';

    mysqli_close($db);
?>