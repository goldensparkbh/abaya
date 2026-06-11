<?php
session_start();
error_reporting(0);
include('connect.php');

$upload_dir = './img/products/';
$id = $category_id = $name = $price = $docFile = $errorMsg = '';
if(isset($_GET['id'])) 
{
     $id =$_GET['id'];
     $sql = "SELECT *
             FROM   category
             WHERE  category_id  = '".$id."' ";
     $result = $conn->query($sql);

     if ($result->num_rows > 0) 
     {
     // output data of each row
     $row = $result->fetch_assoc();

     $category_id = $row['category_id']; 

     }
     else
     {
      $errorMsg = 'Could not select a record';
     }  
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
   $name = $_POST['name'];
   $price = $_POST['price'];
   $category_id = $_POST['category_id'];

// START IMG OF PRODUCT
    $fileName = $_FILES['IMG']['name']; 
    $fileTmp = $_FILES['IMG']['tmp_name']; 
    $fileSize = $_FILES['IMG']['size']; 
    
    if (empty($fileName))
    {
     $errorMsg = 'Please Input File';
    }else{
//get File extension 
$imgExt = strtolower(pathinfo($fileName,PATHINFO_EXTENSION));
//allow extension
$allowExt = array('png','jpeg','jpg');
//Random new name for photo
$IMG = time().'_'.rand(1000,9999).'.'.$imgExt;
//Chack a valid File
if(in_array($imgExt,$allowExt))
{
    //SIZE OF File
    if($fileSize < 5000000)
    {
     move_uploaded_file($fileTmp,$upload_dir.$IMG);
    }
    else
    {
    $errorMsg='File too large';
    }
}
else
{
$errorMsg = 'Please select a valid File -  (PNG) Files';    
}
}


if(empty($errorMsg))
 {

$sql = "INSERT INTO products (title,price,img,category)
VALUES ('$name','$price','$IMG','$category_id')";
if ($conn->query($sql) === TRUE) 
  {
    $successMsg = "New record created successfully";
    header('refresh:2;product.php?id='.$category_id);
  }else
  {
    $errorMsg = "Error: " . $sql . "<br>" . $conn->error;
  }
 }

}

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quattro | Admin Page</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="./css/style.css">
</head>

<body>

    <section>
        <?php include('./inc/admin-header.php'); ?>
        <div class="row justify-content-md-center">
            <div class="col-4">
     <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" method="POST" enctype="multipart/form-data" class="form-horizontal" >

                    <p class="h4 mb-4 text-center">Add New Product</p>
                    <input type="text"   name="name"        class="form-control mb-4" placeholder="Name"  value="<?php echo $name;?>" required>
                    <input type="number" name="price"       class="form-control mb-4" placeholder="Price" value="<?php echo $price;?>" required>
                    <input type="hidden" name="category_id" class="form-control mb-4"                     value="<?php echo $category_id;?>">
                    <label for="Product image"              class="text-left"> Product Image Type (png | jpg)</label>
                    <input type="file" name="IMG"           class="form-control mb-4"  required>
                    <div class="msg text-center" style="color: red;"><?php echo $errorMsg; ?></div>

                    <input class="btn btn-dark btn-block my-4" name="submit" type="submit" value="Save">
     </form>
            </div>
        </div>
        <?php include('./inc/footer.php'); ?>
    </section>


    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
</body>

</html>