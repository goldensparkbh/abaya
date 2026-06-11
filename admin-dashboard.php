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

if (!empty($user_id)) {

    $sql1 = "SELECT name,email,mobile FROM users WHERE id = '$user_id'";
    $result1 = $conn->query($sql1);

    if ($result1->num_rows > 0) {
        $row = $result1->fetch_assoc();
        $owner_name = $row['name'];
        $email = $row['email'];
        $mobile = $row['mobile'];
    } else {
        $errorMsg = 'Could not select a record';
    }

    $sql2 = "SELECT COUNT(products.id) AS total_product FROM products";
    $result2 = $conn->query($sql2);

    if ($result2->num_rows > 0) {
        $row = $result2->fetch_assoc();
        $total_product = $row['total_product'];
    } else {
        $errorMsg = 'Could not select a record';
    }

    $sql3 = "SELECT COUNT(id) AS total_orders FROM orders";
    $result3 = $conn->query($sql3);

    if ($result3->num_rows > 0) {
        $row = $result3->fetch_assoc();
        $total_orders = $row['total_orders'];
    } else {
        echo "0 results";
    }

    $sql4 = "SELECT SUM(amount) AS total_sales FROM orderitems";
    $result4 = $conn->query($sql4);

    if ($result4->num_rows > 0) {
        $row = $result4->fetch_assoc();
        $total_sales = $row['total_sales'];
    } else {
        $errorMsg = 'Could not select a record';
    }

    $sql5 = "SELECT COUNT(category_id) AS total_category FROM category";
    $result5 = $conn->query($sql5);

    if ($result5->num_rows > 0) {
        $row = $result5->fetch_assoc();
        $total_category = $row['total_category'];
    } else {
        $errorMsg = 'Could not select a record';
    }

    // New Query: Count custom abayas
    $sql6 = "SELECT COUNT(id) AS total_custom_abaya FROM custom_abaya";
    $result6 = $conn->query($sql6);

    if ($result6->num_rows > 0) {
        $row = $result6->fetch_assoc();
        $total_custom_abaya = $row['total_custom_abaya'];
    } else {
        $errorMsg = 'Could not select a record';
    }
    // New Query: Count custom abayas
    $sql7 = "SELECT COUNT(id) AS total_new_orders FROM custom_abaya WHERE status = 1 ";
    $result7 = $conn->query($sql7);

    if ($result7->num_rows > 0) {
        $row = $result7->fetch_assoc();
        $total_new_orders = $row['total_new_orders'];
    } else {
        $errorMsg = 'Could not select a record';
    }

    // New Query: Tailors
    $sql8 = "SELECT COUNT(tailor_id) AS total_tailors FROM tailors";
    $result8 = $conn->query($sql8);

    if ($result8->num_rows > 0) {
        $row = $result8->fetch_assoc();
        $total_tailors = $row['total_tailors'];
    } else {
        $errorMsg = 'Could not select a record';
    }
    // New Query: Tailors
    $sql9 = "SELECT sum(customer_price) AS custom_sales FROM custom_abaya";
    $result9 = $conn->query($sql9);

    if ($result9->num_rows > 0) {
        $row = $result9->fetch_assoc();
        $custom_sales = $row['custom_sales'];
    } else {
        $custom_sales = 0.000;
        $errorMsg = 'Could not select a record';
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
    <?php include('./inc/admin-header.php'); ?>

    <div class="container mt-5 my-section">


        <table class="table table-bordered">
            <!-- Row 1: Business Dashboard Label -->
            <tr>
                <td colspan="4" class="text-left font-weight-bold h4">Admin Dashboard</td>
            </tr>

            <!-- Row 2: Large Buttons -->
            <tr>
                <td><a href="admin_orders.php"><button class="btn btn-dark btn-lg">Order No. <?php echo $total_orders;?></button></a></td>
                <td><a href="admin-products.php"><button class="btn btn-dark btn-lg ">Product No. <?php echo $total_product;?></button></a></td>
                <td><a href="admin-category.php"><button class="btn btn-dark btn-lg ">Category No. <?php echo $total_category;?> </button></a></td>
                <td><a href="admin-report.php"><button class="btn btn-dark btn-lg">Sales <?php echo $total_sales;?> BHD</button></a></td>
            </tr>
            <tr>
                <td><a href="admin_custom_orders.php"><button class="btn btn-dark btn-lg">Custom Orders <?php echo $total_custom_abaya;?></button></a></td>
                <td>
                    <a href="admin-custom-new-orders.php"><button class="btn btn-dark btn-lg ">New Orders <?php echo $total_new_orders;?></button></a>
                </td>
                <td>
                    <a href="admin-tailors-report.php"><button class="btn btn-dark btn-lg ">Tailors No. <?php echo $total_tailors;?></button></a>
                </td>
                <td>
                    <a href="admin_custom_orders.php"><button class="btn btn-dark btn-lg ">Custom Sales <?php echo $custom_sales;?></button></a>
                </td>
            </tr>
            <!-- Row 3: Label for Business Account Details -->
            <tr>
                <td colspan="4" class="text-left border-bottom h5" ><u>Account Details:</u></td>
            </tr>

            <!-- Row 4: Owner Name -->
            <tr>
                <td><strong>Owner Name:</strong></td>
                <td colspan="3"><?php echo $owner_name ;?></td>
            </tr>

            <!-- Row 5: Email -->
            <tr>
                <td><strong>Email:</strong></td>
                <td colspan="3"><?php echo $email ;?></td>
            </tr>

            <!-- Row 6: Mobile Number -->
            <tr>
                <td><strong>Mobile Number:</strong></td>
                <td colspan="3"><?php echo $mobile ;?></td>
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