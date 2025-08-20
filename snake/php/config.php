<?php
// mysql config — do not commit this file to public repos
$DB_HOST = "localhost";
$DB_NAME = "u917152523_kahoru";
$DB_USER = "u917152523_admin";
$DB_PASS = "adminKahoru773";

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
  http_response_code(500);
  echo json_encode(["error"=>"db_connect_failed"]);
  exit;
}
$mysqli->set_charset("utf8mb4");
?>
