<?php
session_start();
error_reporting(E_ALL);
include('config.php');
date_default_timezone_set("Asia/Bahrain");
$msg = '';
$active = 'True-products';
$logo = 'img/';
// FECTH PRODUCTS
$sql = "SELECT * from category";
$query = $db->prepare($sql);
$query->execute();
$results = $query->fetchAll(PDO::FETCH_OBJ);

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
      <h3 class="py-4">Products</h3>
      <div class="msg"><?php echo $msg; ?></div>
      <div class="row">

        <?php

        if ($query->rowCount() > 0) {
          foreach ($results as $result) {        ?>
            <div class="col-lg-4 col-md-6 mb-4">
              <div class="card h-100">
                <div class="card-body">
                    <h5><?php echo $result->category_name; ?></h5>
                      <a style="width:100%; margin-bottom:5px;"  href="product.php?id=<?php echo $result->category_id;  ?>">
                          <button type="submit" name="submit" class="btn btn-dark btn-block" >View <?php echo $result->category_name; ?> Products</button>
                      </a>
                </div>
              </div>
            </div>
        <?php }
        } ?>
      </div>
    </div>

    <?php// include('./inc/footer.php'); ?>
  </section>

  <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>

</body>

</html>