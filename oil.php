<?php
session_start();
error_reporting(E_ALL);
include('config.php');
date_default_timezone_set("Asia/Bahrain");
$msg = '';
$active = 'True-oil';

// Current Date
$date_now = date("Y-m-d");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  if (isset($_SESSION['user'])) {
    $appointment_date = $_POST['appointment_date'];
    $result = (strtotime(date($appointment_date)) - strtotime(date($date_now)));

    if ($result >= 0) {
    $productid = $_POST['productId'];
    $user = $_SESSION['user'];

    $sql = "INSERT INTO cart(productid,user,appointment_date) VALUES(:productid,:user,:appointment_date)";
    $query = $db->prepare($sql);
    $query->bindParam(':productid', $productid, PDO::PARAM_STR);
    $query->bindParam(':user', $user, PDO::PARAM_STR);
    $query->bindParam(':appointment_date', $appointment_date, PDO::PARAM_STR);
    $query->execute();
    $lastInsertId = $db->lastInsertId();
    if ($lastInsertId) {
      $msg = '<div id="msg" class="alert alert-success"><strong>Product Added To Cart</strong></div>';
    } else {
      $msg = '<div id="msg" class="alert alert-danger"><strong>Unable To Add</strong></div>';
    }
    } else {
     $msg = '<div id="msg" class="alert alert-danger"><strong>The date chosen is incorrect. It should be dated today or greater </strong></div>';
    }

  } else {
     $msg = '<div id="msg" class="alert alert-danger"><strong>Please Login</strong></div>';
  }

}
// FECTH PRODUCTS
$sql = "SELECT * from products WHERE category = '2'";
$query = $db->prepare($sql);
$query->execute();
$results = $query->fetchAll(PDO::FETCH_OBJ);

?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quattro | Online Shop for Car Services</title>
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
    <?php include('./inc/header.php'); ?>

    <div class="container mt-5 my-section">
      <h3 class="py-4">Oil Services</h3>
      <div class="msg"><?php echo $msg; ?></div>
      <div class="row">

        <?php

        if ($query->rowCount() > 0) {
          foreach ($results as $result) {        ?>
            <div class="col-lg-3 col-md-6 mb-4">
              <div class="card h-100">
                <a href="#"><img class="card-img-top" src="./img/products/<?php echo $result->img; ?>" alt="<?php echo $result->title; ?>" title="<?php echo $result->title; ?>"></a>
                <div class="card-body">
                  <h5 class="card-title">
                    <a href="#"><?php echo $result->title; ?></a>
                  </h5>
                  <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" method="POST">
                    <input type="text" name="productId" value="<?php echo $result->id; ?>" style="display:none">
                    <p style="color:red;"><label for="Price" >Price: <?php echo $result->price; ?> <?php echo CURRENCY ?></label></p>
                    <b><label for="Appointment Date">Appointment Date:</label></b>
                    <input type="date" id="date_picker" onclick="myFunction()" name="appointment_date" class="form-control"  required style="margin-bottom: 10px;">
                      <button type="submit" name="submit" class="btn btn-dark btn-block" >Add To Cart</button>
                  </form>
                </div>
              </div>
            </div>
        <?php }
        } ?>
      </div>
    </div>

    <?php include('./inc/footer.php'); ?>
  </section>

  <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
  <script type="text/javascript">
    $(document).ready(function() {
      setTimeout(function() {
        $('#msg').slideUp("slow");
      }, 2000);
    });
  </script>
</body>

</html>