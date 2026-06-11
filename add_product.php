<?php
session_start();
$user_id = $_SESSION['user'];
// Assuming you have a MySQL database with the following credentials
include('connect.php');
$upload_dir = 'img/products/';

// Assuming you're using POST method
$productName = $_POST['productName'];
$categoryId = $_POST['newcategoryId'];

if($_POST['productPrice'] <= 0 ){
    $errorMsg = "Please enter correct price";
}else{
    $productPrice = $_POST['productPrice'];
}
// Assuming you're img using POST method
    $fileName = $_FILES['productImg']['name']; 
    $fileTmp = $_FILES['productImg']['tmp_name']; 
    $fileSize = $_FILES['productImg']['size']; 
// Update image if the user select new image
    if($fileName)
    {
        // Get Image extension 
        $imgExt = strtolower(pathinfo($fileName,PATHINFO_EXTENSION));
        //allow extension
        $allowExt = array('png','jpg','jpeg');
        //Random new name for photo
        $productImg = time().'_'.rand(1000,9999).'.'.$imgExt;
        //Chack a valid image
        if(in_array($imgExt,$allowExt))
        {
            //SIZE OF IMAGE
            if($fileSize < 5000000)
            {
            //Upload New File
            move_uploaded_file($fileTmp,$upload_dir.$productImg);     
            } else {
                $errorMsg='image too large';
            }
        } else {
            $errorMsg = 'Please select a valid image';  
        }
    }

// Validate and sanitize input if necessary
if(empty($errorMsg)){
// Update the product status in the MySQL table
$sql = "INSERT INTO products (title,price,img,fk_category_id,fk_owner_id)
VALUES ('$productName', '$productPrice', '$productImg', '$categoryId', '$user_id')";

if ($conn->query($sql) === TRUE) {
  echo "New record created successfully";
  header('refresh:0;product.php?id='.$categoryId);
} else {
  echo "Error: " . $sql . "<br>" . $conn->error;
}
}
$conn->close();
?>
