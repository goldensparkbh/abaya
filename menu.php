<?php
session_start();
include('config.php');
$msg = '';
$expiration_time = time() + 3600; // 3600 seconds = 1 hour
if (!empty($_GET['id'])) {
  $menuId = $_GET['id'];
  setcookie("menuId",     $menuId,    $expiration_time,"/", "localhost");
}else{
  $menuId   = isset($_COOKIE["menuId"]) ? $_COOKIE["menuId"] : "";
}
$active = $menuId;
$logo = 'img/';


if ($_SERVER["REQUEST_METHOD"] == "POST") {
  if (isset($_SESSION['user'])) {
    $menuId = $_POST['menuId'];
    $quantity = $_POST['quantity'];
    $unitPrice = $_POST['unitPrice'];
    $amount = $unitPrice * $quantity;
    if (($quantity >= 1)&&($unitPrice > 0)) {

    $productid = $_POST['productId'];
    $user = $_SESSION['user'];
    $sql = "INSERT INTO cart(productid,user,unit_price,quantity,amount) VALUES(:productid,:user,:unit_price,:quantity,:amount)";
    $query = $db->prepare($sql);
    $query->bindParam(':productid', $productid, PDO::PARAM_STR);
    $query->bindParam(':user', $user, PDO::PARAM_STR);
    $query->bindParam(':unit_price', $unitPrice, PDO::PARAM_STR);
    $query->bindParam(':quantity', $quantity, PDO::PARAM_INT);
    $query->bindParam(':amount', $amount, PDO::PARAM_STR);
    $query->execute();
    $lastInsertId = $db->lastInsertId();
    if ($lastInsertId) {
      $msg = '<div id="msg" class="alert alert-success"><strong>Product Added To Cart</strong></div>';
      setcookie("menuId",     $menuId,    $expiration_time,"/", "localhost");
    } else {
      $msg = '<div id="msg" class="alert alert-danger"><strong>Unable To Add</strong></div>';
    }

    } else {
     $msg = '<div id="msg" class="alert alert-danger"><strong>The date chosen is incorrect. It should be dated today or greater </strong></div>';
    }
} else {
      echo "<script type='text/javascript'> document.location = 'login.php'; </script>";
  }
}

// FECTH PRODUCTS
$sql = "SELECT * from products,owner_of_business WHERE fk_owner_id = owner_id AND fk_category_id = '$menuId'";
$query = $db->prepare($sql);
$query->execute();
$results = $query->fetchAll(PDO::FETCH_OBJ);

?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home Made Food</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">

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
<?php
include('connect.php');
$sql = "SELECT category_name FROM  category  WHERE category_id  = '$menuId'";
$row = mysqli_fetch_assoc($conn->query($sql) );
$category_name = $row['category_name'];
?>
      <h3 class="py-4"><?php echo $category_name; ?></h3>
      <div class="msg"><?php echo $msg; ?></div>
      <div class="row">

        <?php

        if ($query->rowCount() > 0) {
          foreach ($results as $result) {        ?>
            <div class="col-lg-3 col-md-6 mb-4">
              <div class="card h-100">
                <a><img class="card-img-top" src="./img/products/<?php echo $result->img; ?>" alt="<?php echo $result->title; ?>" title="<?php echo $result->title; ?>"></a>
                <div class="card-body">
                    <a class="product_name"><?php echo $result->title; ?></a>
                    <p class="business_name"><?php echo $result->business_name; ?></p>
                    <p class="price_class mb-2">Price:  <?php echo $result->price.' '.CURRENCY ?></p>
                    <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" method="POST">
                      <input type="text" name="productId" value="<?php echo $result->id; ?>" style="display:none">
                      <input type="text" name="unitPrice" value="<?php echo $result->price;?>" hidden>
                      <input type="text" name="menuId" value="<?php echo $menuId;?>" hidden>
                      <b><label for="Appointment Date">Quantity:</label></b>
                      <input type="number" name="quantity" class="form-control" value="1" min="1" max="100" required style="margin-bottom: 10px;">
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

</body>

</html>