<?php
// Assuming you have a MySQL database with the following credentials
include('connect.php');

// Assuming you're using POST method
echo $categoryId = $_POST['deleteCategoryId'];


// sql to delete a record
$sql = "DELETE FROM category WHERE category_id ='$categoryId'";

if ($conn->query($sql) === TRUE) {
  echo "Record deleted successfully";
   header('refresh:0;admin-category.php');
} else {
  echo "Error deleting record: " . $conn->error;
}

$conn->close();
?>
