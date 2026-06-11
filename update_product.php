<?php
// Assuming you have a MySQL database with the following credentials
include('connect.php');
$upload_dir = 'img/products/';

// Assuming you're using POST method
$productId = $_POST['productId'];
$productName = $_POST['productName'];
$categoryId = $_POST['categoryId'];


if(isset($productId)){

$sql = "SELECT img,price       
        FROM   products
        WHERE    id = '$productId' ";
     $result = $conn->query($sql);

     if ($result->num_rows > 0) 
     {
     // output data of each row
     $row = $result->fetch_assoc(); 
     $productImg = $row['img'];
     $productPrice = $row['price'];
     }
     else
     {
      $errorMsg = 'Could not select a record';
     }  
}

if($_POST['productPrice'] < 0 ){
    $productPrice = $row['price'];
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
            $productImgOld = $row['img'];
            // Delete old image from the folder 
            unlink($upload_dir.$productImgOld);
            //Upload New File
            move_uploaded_file($fileTmp,$upload_dir.$productImg);     
            } else {
                $errorMsg='image too large';
            }
        } else {
            $errorMsg = 'Please select a valid image';  
        }
    }else{
    // If not select new image - use old image name
    $productImg = $row['img'];
    }

// Validate and sanitize input if necessary

// Update the product status in the MySQL table
$sql = "UPDATE products 
        SET title = '$productName' , price = '$productPrice' , img = '$productImg' 
        WHERE id = '$productId'";
if ($conn->query($sql) === TRUE) {
    echo 'Product status updated successfully!';
    header('refresh:0;product.php?id='.$categoryId);
} else {
    echo 'Error updating product status: ' . $conn->error;
}

$conn->close();
?>
