<?php
session_start();
error_reporting(E_ALL);
include('config.php');
$active='';
$logo = 'img/';
if (isset($_SESSION['user'])) {
    $user = $_SESSION['user'];

    // TOTAL
    $sql = "SELECT SUM(cart.amount) as total FROM cart INNER JOIN products ON products.id = cart.productid WHERE cart.user=:user";
    $query = $db->prepare($sql);
    $query->bindParam(':user', $user, PDO::PARAM_INT);
    $query->execute();
    $total = $query->fetch(PDO::FETCH_OBJ);

    // FECTH CART
    $sql = "SELECT cart.productid,cart.unit_price,cart.height,cart.quantity,cart.amount FROM cart WHERE cart.user=:user";
    $query = $db->prepare($sql);
    $query->bindParam(':user', $user, PDO::PARAM_INT);
    $query->execute();
    $results = $query->fetchAll(PDO::FETCH_OBJ);


    // To INSERT ORDER
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $sql = "INSERT INTO orders(user) VALUES(:user)";
        $query = $db->prepare($sql);
        $query->bindParam(':user', $user, PDO::PARAM_INT);
        $query->execute();
        $lastInsertId = $db->lastInsertId();
        if ($lastInsertId) {

            foreach ($results as $item) {
                /*
                echo '<br>';
                echo $lastInsertId;
                echo '<br>';
                echo $item->productid;
                echo '<br>';
                echo $item->unit_price;
                echo '<br>';
                echo $item->quantity;
                echo '<br>';
                echo $item->amount;
              */
                $sqlitem = "INSERT INTO orderitems (oid,productid,unit_price,height,quantity,amount) VALUES (:oid,:productid,:unit_price,:height,:quantity,:amount)";
                $stmtitem = $db->prepare($sqlitem);
                $stmtitem->bindParam("oid", $lastInsertId, PDO::PARAM_INT);
                $stmtitem->bindParam("productid", $item->productid, PDO::PARAM_INT);
                $stmtitem->bindParam("unit_price", $item->unit_price, PDO::PARAM_STR);
                $stmtitem->bindParam("height", $item->height, PDO::PARAM_STR);
                $stmtitem->bindParam("quantity", $item->quantity, PDO::PARAM_INT);
                $stmtitem->bindParam("amount", $item->amount, PDO::PARAM_STR);
                $stmtitem->execute();
                
            }

            //CLEAR CART
            $sql = "DELETE FROM cart WHERE user = (:user)";
            $query = $db->prepare($sql);
            $query->bindParam(':user', $user, PDO::PARAM_INT);
            $query->execute();
            
            echo "<script>alert('Order Placed')</script>";
            echo "<script type='text/javascript'> document.location = 'orders.php'; </script>";
            
        } else {
            echo "<script>alert('Please Fill All Valid Details')</script>";
        }
    }
}



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

        <?php if (strlen(isset($_SESSION['login']) == 0)) { ?>
            <div class="container mt-5 p-5">
                <h3 class="p-5 m-5 text-center">Please Login To Check Cart</h3>
            </div>
        <?php } else { ?>
            <div class="container mt-5 p-5">
                <div class="clearfix">
                    <h3 class="py-4 float-left">My Cart</h3>
                    <h3 class="py-4 float-right">Total : <?php echo CURRENCY; ?> <?php echo $total->total; ?></h3>
                </div>

                <div class="row justify-content-md-center">
                    <div class="col-8">
                        <form class="text-center border border-light p-5" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" method="post">
                            <p class="h4 mb-4">Proceed to payment </p>
                            <input type="submit" class="btn btn-Payment"  style="background: #85aeb0;" name="submit" value="Continue To Payment">
                        </form>
                    </div>
                </div>
            </div>
        <?php } ?>

        <?php include('./inc/footer.php'); ?>
    </section>

    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
</body>

</html>