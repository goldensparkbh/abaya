<?php
// Assuming you have a MySQL database with the following credentials
include('connect.php');
$upload_dir = 'img/products/';

// Assuming you're using POST method
echo $productId = $_POST['deleteProductId'];
echo "<br>";
echo $imgName = $_POST['imgName'];
echo "<br>";
echo $categoryId = $_POST['deleteCategoryId'];

// sql to delete a record
$sql = "DELETE FROM products WHERE id='$productId'";

if ($conn->query($sql) === TRUE) {
  echo "Record deleted successfully";
  // Delete old image from the folder 
   unlink($upload_dir.$imgName);
   header('refresh:0;product.php?id='.$categoryId);
} else {
  echo "Error deleting record: " . $conn->error;
}

$conn->close();
?>
