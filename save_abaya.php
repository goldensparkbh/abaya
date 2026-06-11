<?php
session_start();
// Database connection
$host = 'localhost';
$db = 'ab_db';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
  die('Connection failed: ' . $conn->connect_error);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
  echo json_encode(['success' => false, 'message' => 'Invalid input']);
  exit;
}

$abaya_color = $data['abaya_color'] ?? null;
$fabrics = $data['fabrics'] ?? null;
$image_name = $data['image_name'] ?? null;
$embroidery = $data['embroidery'] ?? null;
$lace_trim = $data['lace_trim'] ?? null;
$b_addon = $data['b_addon'] ?? null;
$height_cm = $data['height_cm'];
$status = $data['status'] ?? 1;
$fk_tailor = $data['fk_tailor'] ?? null;
$user_id = $_SESSION['user'];
try {
  $stmt = $conn->prepare("INSERT INTO custom_abaya (abaya_color, fabrics, image_name, embroidery, lace_trim, b_addon, height_cm, status, fk_tailor, fk_customer_id) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  $stmt->bind_param("sssssssiii", $abaya_color, $fabrics, $image_name, $embroidery, $lace_trim, $b_addon, $height_cm, $status, $fk_tailor, $user_id);

  if ($stmt->execute()) {
    echo json_encode(['success' => true]);
  } else {
    echo json_encode(['success' => false, 'message' => 'DB insert failed']);
  }

  $stmt->close();
  $conn->close();
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
