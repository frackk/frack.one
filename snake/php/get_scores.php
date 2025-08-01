
<?php
$host = 'localhost';
$db = 'snake_scores';
$user = 'tu_usuario_mysql';
$pass = 'tu_contraseña_mysql';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("connection failed: " . $conn->connect_error);
}

$sql = "SELECT name, score, date FROM scores ORDER BY score DESC LIMIT 10";
$result = $conn->query($sql);

$scores = array();
while($row = $result->fetch_assoc()) {
    $scores[] = $row;
}
echo json_encode($scores);

$conn->close();
?>
