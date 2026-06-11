<?php
session_start();
error_reporting(E_ALL);
include('connect.php');
$upload_dir = './img/products/';
date_default_timezone_set("Asia/Bahrain");
$msg = '';
$active = 'True-report';
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
    <?php include('./inc/admin-header.php'); ?>

    <div class="container mt-5 my-section">


    <div class="table-responsive">
        <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                <thead>
                  <tr>
                     <th>No.</th>
                     <th>Order ID</th>
                     <th>Prduct Name</th>
                     <th>Unit Price</th>
                     <th>Qty</th>
                     <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
<?php
    $user_id = $_SESSION['user'];
    $sql = "SELECT oid,title,unit_price,quantity,amount FROM orderitems,products WHERE products.id = orderitems.productid ";

    $result = $conn->query($sql);
     if ($result->num_rows > 0){
    // output data of each row
      $amount = 0;
      $i = 1;
        while($row = $result->fetch_assoc()) 
        {
  ?>
          <tr>
            <td><?php echo $i;?></td>            
            <td><?php echo $row['oid'];?></td>
            <td><?php echo $row['title'];?></td>
            <td><?php echo $row['unit_price'];?></td>
            <td><?php echo $row['quantity'];?></td>
            <td><?php echo $row['amount'];?></td>
            </td>  
          </tr>
<?php
$amount += $row['amount'];
$i = $i + 1;
        }
  }else {
    $message= 'No Data Found.';
  }

$conn->close();
?> 
                </tbody>
              <tfoot>
                  <tr>
                     <th colspan="5">Total Amount</th>
                     <th colspan="1"><?php echo $amount;?> BHD</th>
                  </tr>
                </tfoot>
              </table>
      <!-- /.container-fluid -->
    <!-- Modal -->
    <div class="modal fade" id="changeStatusModal" tabindex="-1" role="dialog" aria-labelledby="changeStatusModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="changeStatusModalLabel">Change Product Status</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="update_status.php" method="post">
                         <div class="form-group">
                            <label for="statusDropdown">Status:</label>
                            <select class="form-control" id="statusDropdown" name="status" required>
                                <option value="">Select Status</option>
                                <option value="1">Pending</option>
                                <option value="2">Completed</option>
                            </select>
                        </div>
                        <!-- Hidden input for product ID -->
                        <input type="hidden" id="productIdInput" name="productId" value="">
                        <input type="hidden" name="orderId" value="<?php echo $_SESSION["order_id"]?>">
                        <button type="submit" class="btn btn-dark" style="width:100%;">Update</button>
                        
                    </form>
                </div>
            </div>
        </div>
    </div>
      <!-- Footer Start -->
      </div>
    </div>

  </section>

  <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>

</body>

</html>