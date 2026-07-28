<?php
header('Content-Type: application/json');

$host = "localhost";
$user = "root";
$pass = "";
$db   = "smart_dental_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Connection failed",
        "patients" => []
    ]);
    exit;
}

$sql = "SELECT id, name, age, gender, last_visit AS lastVisit, dental_condition AS `condition`
        FROM patients
        ORDER BY last_visit DESC, id DESC";

$result = $conn->query($sql);
$patients = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int) $row['id'];
        $row['age'] = (int) $row['age'];
        $patients[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "message" => "Patients loaded",
        "patients" => $patients
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Unable to load patients",
        "patients" => []
    ]);
}

$conn->close();
?>
