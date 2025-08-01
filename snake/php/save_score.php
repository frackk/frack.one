
<?php
$host = 'localhost';
$db = 'snake_scores';
$user = 'tu_usuario_mysql';
$pass = 'tu_contraseña_mysql';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("connection failed: " . $conn->connect_error);
}

$name = $_POST['name'];
$score = $_POST['score'];
$date = date('Y-m-d');

$stmt = $conn->prepare("INSERT INTO scores (name, score, date) VALUES (?, ?, ?)");
$stmt->bind_param("sis", $name, $score, $date);
$stmt->execute();
$stmt->close();
$conn->close();
?>
