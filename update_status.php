<?php
// Assuming you have a MySQL database with the following credentials
include('connect.php');

// Assuming you're using POST method
$productId = $_POST['productId'];
$status = $_POST['status'];
$orderId = $_POST['orderId'];

// Validate and sanitize input if necessary

// Update the product status in the MySQL table
$sql = "UPDATE orderitems SET status = '$status' WHERE id = '$productId'";
if ($conn->query($sql) === TRUE) {
    echo 'Product status updated successfully!';
    header('refresh:0;order-details.php?id='.$orderId);
} else {
    echo 'Error updating product status: ' . $conn->error;
}

$conn->close();
?>
