<?php
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/config.php';

$name = isset($_POST['name']) ? strtolower(trim($_POST['name'])) : '';
$score = isset($_POST['score']) ? intval($_POST['score']) : 0;
if ($name === '' || $score <= 0) { echo json_encode(["ok"=>false]); exit; }

// ensure one row per nickname, keep the highest score
$stmt = $mysqli->prepare("SELECT id, score FROM scores WHERE name = ? LIMIT 1");
$stmt->bind_param("s", $name);
$stmt->execute();
$stmt->bind_result($id, $oldScore);
$exists = $stmt->fetch();
$stmt->close();

if ($exists) {
  if ($score > $oldScore) {
    $stmt = $mysqli->prepare("UPDATE scores SET score = ?, date = CURDATE() WHERE id = ?");
    $stmt->bind_param("ii", $score, $id);
    $stmt->execute();
    $stmt->close();
  }
  echo json_encode(["ok"=>true, "updated"=>$score > $oldScore]);
  exit;
}

$stmt = $mysqli->prepare("INSERT INTO scores (name, score, date) VALUES (?, ?, CURDATE())");
$stmt->bind_param("si", $name, $score);
$stmt->execute();
$stmt->close();

echo json_encode(["ok"=>true, "inserted"=>true]);
?>
