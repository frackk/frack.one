<?php
$host = "localhost";
$dbname = "u917152523_kahoru";
$username = "u917152523_admin";
$password = "^eE0Vc2#";

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$nickname = $_POST['nickname'];
$score = intval($_POST['score']);
$date = date("d/m/y");

$stmt = $conn->prepare("INSERT INTO scores (nickname, score, date) VALUES (?, ?, ?)");
$stmt->bind_param("sis", $nickname, $score, $date);
$stmt->execute();
$stmt->close();
$conn->close();
?>
