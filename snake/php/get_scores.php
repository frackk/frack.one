<?php
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/config.php';

$sql = "SELECT name, MAX(score) AS score, DATE_FORMAT(MAX(date), '%d/%m/%y') AS date_fmt
        FROM scores
        GROUP BY name
        ORDER BY score DESC
        LIMIT 10";
$res = $mysqli->query($sql);

$out = [];
while ($row = $res->fetch_assoc()) {
  $out[] = $row;
}
echo json_encode($out);
?>
