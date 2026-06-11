<?php
include('connect.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $order_id = $_POST['order_id'];
    $tailor_price   = $_POST['tailor_price'];   // Get the tailor_price from the form
    $customer_price = $_POST['customer_price']; // Get the customer_price from the form
    $tailor_id = $_POST['tailor_id'];
    $status = 2;

    // Update the order in the database to include the price
    $sql = "UPDATE custom_abaya SET tailor_price = ?, customer_price = ?, status = ?, fk_tailor = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiiii", $tailor_price, $customer_price, $status, $tailor_id, $order_id); // Bind parameters (integer, integer, integer, integer, integer)

    if ($stmt->execute()) {
        header('Location: admin_custom_orders.php');
    } else {
        echo "Error updating order: " . $conn->error;
    }
    $stmt->close();
    $conn->close();
}
?>
