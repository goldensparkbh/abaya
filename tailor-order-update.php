<?php
include('connect.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $order_id = $_POST['order_id'];
    $expected_time = $_POST['expected_time'];
    $status =  $_POST['status'];

    // Update the order in the database to include the price
    $sql = "UPDATE custom_abaya SET expected_time = ?, status = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sii", $expected_time, $status, $order_id); // Bind parameters (string, integer, integer, integer)

    if ($stmt->execute()) {
        header('Location: tailor_custom_orders.php');
    } else {
        echo "Error updating order: " . $conn->error;
    }
    $stmt->close();
    $conn->close();
}
?>
