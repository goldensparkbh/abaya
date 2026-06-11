<?php
session_start();
error_reporting(E_ALL);
include('connect.php');
date_default_timezone_set("Asia/Bahrain");
$msg = '';
$active = 'True-dashboard';
$logo = 'img/';
$category_id = '';
$user_id = $_SESSION['user'];
if(!empty($user_id)){

     $sql1 = "SELECT owner_name,business_name,email,mobile
             FROM   owner_of_business
             WHERE  owner_id  = '$user_id' ";
     $result1 = $conn->query($sql1);

     if ($result1->num_rows > 0) 
     {
     // output data of each row
     $row = $result1->fetch_assoc();

     $owner_name    = $row['owner_name'];
     $business_name = $row['business_name'];
     $email         = $row['email'];
     $mobile        = $row['mobile'];

     }
     else
     {
      $errorMsg = 'Could not select a record';
     } 

     $sql2 = "SELECT count(id) AS product_number 
              FROM products  
              WHERE fk_owner_id = '$user_id' ";
     $result2 = $conn->query($sql2);

     if ($result2->num_rows > 0) 
     {
     // output data of each row
     $row = $result2->fetch_assoc();

     $product_number    = $row['product_number'];

     }
     else
     {
      $product_number    = 0;
     } 

     $sql3 = "SELECT COUNT(orders.id) AS orders_number
     FROM  owner_of_business,products,orders,orderitems
     WHERE owner_of_business.owner_id = products.fk_owner_id
     AND   products.id = orderitems.productid
     AND   orders.id   = orderitems.oid
     AND   owner_of_business.owner_id  = '$user_id'
     GROUP BY orders.id; ";
     $result3 = $conn->query($sql3);

  if ($result3->num_rows > 0) {
     // output data of each row
      $orders_number = 0;
     while($row = $result3->fetch_assoc()) {
      $orders_number = $orders_number + 1;
    }
  } else {
      $orders_number = 0;
  }
     $sql4 = "SELECT  sum(orderitems.amount) AS total_income
     FROM  owner_of_business,products,orderitems
     WHERE owner_of_business.owner_id = products.fk_owner_id
     AND   products.id = orderitems.productid
     AND   owner_of_business.owner_id  = '$user_id' ";
     $result4 = $conn->query($sql4);

     if ($result4->num_rows > 0) 
     {
     // output data of each row
     $row = $result4->fetch_assoc();

     $total_income    = $row['total_income'];

     }
     else
     {
      $total_income    = 0.000;
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
  <script>
    if (typeof window.history.pushState == 'function') {
      window.history.pushState({}, "Hide", '<?php echo $_SERVER['PHP_SELF']; ?>');
    }
  </script>

</head>

<body>

  <section>
    <?php include('./inc/business-header.php'); ?>

    <div class="container mt-5 my-section">


        <table class="table table-bordered">
            <!-- Row 1: Business Dashboard Label -->
            <tr>
                <td colspan="3" class="text-left font-weight-bold h4">Business Dashboard</td>
            </tr>

            <!-- Row 2: Large Buttons -->
            <tr>
                <td><a href="business_orders.php"><button class="btn btn-dark btn-lg btn-dashboard">Order No. <?php echo $orders_number;?></button></a></td>
                <td><a href="products.php"><button class="btn btn-dark btn-lg btn-dashboard">Product No. <?php echo $product_number;?></button></a></td>
                <td><button class="btn btn-dark btn-lg btn-dashboard">Total Income. <?php if(empty($total_income)){echo '0.000';}else{echo $total_income;}?> BHD</button></td>
            </tr>

            <!-- Row 3: Label for Business Account Details -->
            <tr>
                <td colspan="3" class="text-left border-bottom h5" ><u>Account Details:</u></td>
            </tr>

            <!-- Row 4: Owner Name -->
            <tr>
                <td><strong>Owner Name:</strong></td>
                <td colspan="2"><?php echo $owner_name ;?></td>
            </tr>

            <!-- Row 5: Business Name -->
            <tr>
                <td><strong>Business Name:</strong></td>
                <td colspan="2"><?php echo $business_name ;?></td>
            </tr>

            <!-- Row 6: Email -->
            <tr>
                <td><strong>Email:</strong></td>
                <td colspan="2"><?php echo $email ;?></td>
            </tr>

            <!-- Row 7: Mobile Number -->
            <tr>
                <td><strong>Mobile Number:</strong></td>
                <td colspan="2"><?php echo $mobile ;?></td>
            </tr>
        </table>



    </div>

    <?php// include('./inc/footer.php'); ?>
  </section>

  <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>

</body>

</html>