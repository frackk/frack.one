<?php
$host = "localhost";
$dbname = "u917152523_kahoru";
$username = "u917152523_admin";
$password = "^eE0Vc2#";

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$sql = "SELECT nickname, score, date FROM scores ORDER BY score DESC, id ASC LIMIT 10";
$result = $conn->query($sql);

$scores = array();
while ($row = $result->fetch_assoc()) {
    $scores[] = $row;
}
echo json_encode($scores);

$conn->close();
?>
