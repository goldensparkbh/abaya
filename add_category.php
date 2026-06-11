<?php
session_start();
$user_id = $_SESSION['user'];
// Assuming you have a MySQL database with the following credentials
include('connect.php');

// Assuming you're using POST method
$categoryName = $_POST['categoryName'];

// Validate and sanitize input if necessary
if(empty($errorMsg)){
// Update the product status in the MySQL table
$sql = "INSERT INTO category (category_name)
        VALUES ('$categoryName')";

if ($conn->query($sql) === TRUE) {
  echo "New record created successfully";
  header('refresh:0;admin-category.php');
} else {
  echo "Error: " . $sql . "<br>" . $conn->error;
}
}
$conn->close();
?>
