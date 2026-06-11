<?php
include('connect.php');

if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $order_id = $_GET['id'];

    // Delete the order
    $sql = "DELETE FROM custom_abaya WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $order_id);

    if ($stmt->execute()) {
        header('Location: admin_custom_orders.php');
    } else {
        echo "Error deleting order: " . $conn->error;
    }

    $stmt->close();
    $conn->close();
} else {
    echo "Invalid ID.";
}
