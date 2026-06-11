<?php
// Assuming you have a MySQL database with the following credentials
include('connect.php');
$upload_dir = 'img/products/';

// Assuming you're using POST method
$categoryId = $_POST['categoryId'];
$categoryName = $_POST['categoryName'];


// Validate and sanitize input if necessary

// Update the product status in the MySQL table
$sql = "UPDATE category 
        SET category_name  = '$categoryName'
        WHERE category_id  = '$categoryId'";
if ($conn->query($sql) === TRUE) {
    echo 'Product status updated successfully!';
    header('refresh:0;admin-category.php');
} else {
    echo 'Error updating product status: ' . $conn->error;
}

$conn->close();
?>
