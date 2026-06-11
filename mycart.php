<?php
session_start();
error_reporting(E_ALL);
include('config.php');
$active = '';
$logo = 'img/';

if (isset($_SESSION['user'])) {
    $user = $_SESSION['user'];

    if (isset($_GET['rem'])) {
        $productid = $_GET['rem'];
        $sql = "DELETE FROM cart WHERE id = (:productid)";
        $query = $db->prepare($sql);
        $query->bindParam(':productid', $productid, PDO::PARAM_STR);
        $query->execute();
    }

    // FETCH PRODUCTS
    $sql = "SELECT cart.id, cart.quantity, cart.amount, products.title, products.price, products.img 
            FROM cart 
            INNER JOIN products ON products.id = cart.productid 
            WHERE cart.user = :user";
    $query = $db->prepare($sql);
    $query->bindParam(':user', $user, PDO::PARAM_STR);
    $query->execute();
    $itemCount = $query->rowCount();
    $results = $query->fetchAll(PDO::FETCH_OBJ);

    // TOTAL
    $sql = "SELECT SUM(cart.amount) as total 
            FROM cart 
            INNER JOIN products ON products.id = cart.productid 
            WHERE cart.user = :user";
    $query = $db->prepare($sql);
    $query->bindParam(':user', $user, PDO::PARAM_STR);
    $query->execute();
    $total = $query->fetch(PDO::FETCH_OBJ);
}
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
    <link rel="stylesheet" href="css/style.css">
    <script>
        if (typeof window.history.pushState == 'function') {
            window.history.pushState({}, "Hide", '<?php echo $_SERVER['PHP_SELF']; ?>');
        }
    </script>
</head>

<body>
    <div class="page-wrapper" style="display: flex; flex-direction: column; min-height: 100vh;">
        <?php include('./inc/header.php'); ?>
        <section style="flex: 1;">
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
                    <div class="row font-weight-bold">
                        <div class="col-2">Product Image</div>
                        <div class="col-2">Product Name</div>
                        <div class="col-2">Unit Price</div>
                        <div class="col-1">Qty</div>
                        <div class="col-2">Amount</div>
                        <div class="col-2">Height</div>
                        <div class="col-1">Remove</div>
                    </div>

                    <form id="cart-form" method="post" action="update_cart_height.php">
                        <?php
                        if ($query->rowCount() > 0) {
                            foreach ($results as $index => $result) { ?>
                                <hr>
                                <div class="row align-items-center">
                                    <div class="col-2">
                                        <img class="cart-img" src="./img/products/<?php echo $result->img; ?>">
                                    </div>
                                    <div class="col-2">
                                        <h5><?php echo $result->title; ?></h5>
                                    </div>
                                    <div class="col-2">
                                        <h5><?php echo CURRENCY; ?> <?php echo $result->price; ?></h5>
                                    </div>
                                    <div class="col-1">
                                        <h5><?php echo $result->quantity; ?></h5>
                                    </div>
                                    <div class="col-2">
                                        <h5><?php echo $result->amount; ?></h5>
                                    </div>
                                    <div class="col-2">
                                        <!-- Height Input -->
                                        <input type="hidden" name="cart_id[]" value="<?php echo $result->id; ?>">
                                        <input type="text" class="form-control height-input" name="height[]" placeholder="Enter height" required>
                                    </div>

                                    <div class="col-1">
                                        <a href="mycart.php?rem=<?php echo $result->id; ?>" class="btn btn-sm btn-danger">Remove</a>
                                    </div>
                                </div>
                        <?php }
                        } ?>
                    </form>

                    <hr>

                    <?php if ($itemCount > 0) { ?>
                        <div class="row">
                            <div class="col-6">
                                <h3>Proceed to Checkout</h3>
                            </div>
                            <div class="col-6 text-right">
                                <button type="button" id="checkout-btn" class="btn btn-Checkout" style="background: #85aeb0;">Checkout</button>
                            </div>
                        </div>
                    <?php } ?>

                    <?php if ($itemCount == 0) { ?>
                        <div class="row p-4">
                            <div class="col-12 text-center">
                                <h3>Cart Empty</h3>
                            </div>
                        </div>
                    <?php } ?>
                </div>
            <?php } ?>
        </section>
        <?php include('./inc/footer.php'); ?>
    </div>

    <script src="https://code.jquery.com/jquery-1.7.2.min.js"></script>
    <script>
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd;
        $('#date_picker').attr('min', today);
    </script>

    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <script>
        document.getElementById('checkout-btn').addEventListener('click', function () {
            let allFilled = true;
            document.querySelectorAll('.height-input').forEach(function (input) {
                if (!input.value.trim()) {
                    allFilled = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            });

            if (!allFilled) {
                alert('Please fill in the height for all products before checkout.');
            } else {
                document.getElementById('cart-form').submit();
            }
        });
    </script>

</body>

</html>
