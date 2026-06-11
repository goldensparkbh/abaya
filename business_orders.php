<?php
session_start();
error_reporting(E_ALL);
include('connect.php');
date_default_timezone_set("Asia/Bahrain");
$msg = '';
$active = 'True-order';
$logo = 'img/';
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
    <?php include('inc/business-header.php'); ?>

    <div class="container mt-5 my-section">
      <div class="d-flex justify-content-between">
      <div>
      <h3 class="py-4">Requests received</h3>
      </div>
    </div>

    <div class="table-responsive">
        <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                <thead>
                  <tr>
                     <th>Order ID</th>
                     <th>User Name</th>
                     <th>Phone Number</th>
                     <th>Email</th>
                     <th>View Order</th>
                  </tr>
                </thead>
              <tfoot>
                  <tr>
                     <th>Order ID</th>
                     <th>User Name</th>
                     <th>Phone Number</th>
                     <th>Email</th>
                     <th>View Order</th>
                  </tr>
                </tfoot>
                <tbody>
<?php
    $user_id = $_SESSION['user'];
    $sql = "SELECT orders.id AS ORDER_ID,orderitems.oid AS FK_ORDER_ID, orderitems.productid AS FK_PRODUCT_ID,
            products.id AS PRODUCT_ID, products.fk_owner_id AS FK_OWNER_ID, owner_of_business.owner_id AS OWNER_ID, 
            users.name, users.email, users.mobile
            FROM orders,orderitems,products,owner_of_business,users
            WHERE orders.id = orderitems.oid
            AND   products.id = orderitems.productid
            AND   owner_of_business.owner_id = products.fk_owner_id
            AND   owner_of_business.owner_id = '$user_id'
            AND   users.id = orders.user
            GROUP BY orderitems.oid  
            ORDER BY ORDER_ID  DESC;
             ;";
    $result = $conn->query($sql);
     if ($result->num_rows > 0){
    // output data of each row
        while($row = $result->fetch_assoc()) 
        {
  ?>
          <tr>
            <td><?php echo $row['ORDER_ID'];?></td>            
            <td><?php echo $row['name'];?></td>
            <td><?php echo $row['mobile'];?></td>
            <td><?php echo $row['email'];?></td>   
            <td align="center">
                <li class="list-inline-item">
                   <a  href="order-details.php?id=<?php echo $row['ORDER_ID']; ?>"><button class="btn btn-success btn-sm rounded-0" width="400" height="200" type="button" data-toggle="tooltip" data-placement="top" title="View"> View Order</button></a>
                </li>
            </td>
          </tr>
<?php
        }
  }else {
    $message= 'No Data Found.';
?>
          <tr>
            <td colspan="5">No Order Found.</td>            
          </tr>
<?php
  }
$conn->close();
?> 
                </tbody>
              </table>
      <!-- /.container-fluid -->

      <!-- Footer Start -->
      </div>
    </div>

    <?php// include('./inc/footer.php'); ?>
  </section>

  <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>

</body>

</html>