<?php
session_start();
error_reporting(E_ALL);
include('connect.php');
$upload_dir = './img/products/';
date_default_timezone_set("Asia/Bahrain");
$msg = '';
$active = 'True-order';
$logo = 'img/';

if(isset($_GET['id'])) 
{
     $id =$_GET['id'];
     $_SESSION["order_id"] = $id ;

     $sql = "SELECT  orders.id, users.name, users.mobile, users.email
             FROM users,orders 
             WHERE users.id =  orders.user
             AND   orders.id = '$id' ";
     $result = $conn->query($sql);

     if ($result->num_rows > 0) 
     {
     // output data of each row
     $row = $result->fetch_assoc();

     $order_id = $row['id']; 
     $username =  $row['name'];
     $phone =  $row['mobile'];
     $email =  $row['email'];

     }
     else
     {
      $errorMsg = 'Could not select a record';
     }  
}else{
  $order_id = $_SESSION["order_id"];
}
     if(empty($_GET['id'])){
     $id = $_SESSION["order_id"];
     $sql = "SELECT  orders.id, users.name, users.mobile, users.email
             FROM users,orders 
             WHERE users.id =  orders.user
             AND   orders.id = '$id' ";
     $result = $conn->query($sql);

     if ($result->num_rows > 0) 
     {
     // output data of each row
     $row = $result->fetch_assoc();

     $order_id = $row['id']; 
     $username =  $row['name'];
     $phone =  $row['mobile'];
     $email =  $row['email'];

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
      <div class="d-flex justify-content-between">
      <div>
      <h2 class="py-4">Orders: <?php echo  $order_id; ?></h2>
      <h6><b>Customer Name:</b> <?php echo $username ;?></h6>
      <h6><b>Phone No.:</b> <?php echo $phone ;?></h6>
      <h6><b>Email:</b> <?php echo $email ;?></h6>
      <br>
      </div>
    </div>

    <div class="table-responsive">
        <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                <thead>
                  <tr>
                     <th>No.</th>
                     <th>Image</th>
                     <th>Product Name</th>
                     <th>Business Name</th>
                     <th>Unit Price</th>
                     <th>Height</th>
                     <th>Qty</th>
                     <th>Amount</th>
                     <th>Update</th>
                     <th>Status</th>
                  </tr>
                </thead>
                <tbody>
<?php
    $user_id = $_SESSION['user'];
    $sql = "SELECT  orderitems.id as product_id,products.img,products.title,owner_of_business.business_name,orderitems.unit_price,orderitems.height,orderitems.quantity,orderitems.amount,orderitems.status
            FROM owner_of_business,products,orders,orderitems
            WHERE fk_owner_id = owner_id
            AND products.id = orderitems.productid
            AND orderitems.oid = orders.id
            AND orders.id = '$order_id'
            AND owner_of_business.owner_id = '$user_id' ";

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
            <td style="vertical-align: top; "><img style="max-width: 100%; height: 100px; width:100px; display: block; margin: 0 auto; margin-top: -20px;" src="<?php echo $upload_dir.$row['img'];?>" > </td>  
            <td><?php echo $row['title'];?></td>
            <td><?php echo $row['business_name'];?></td>
            <td><?php echo $row['unit_price'];?></td>
            <td><?php echo $row['height'];?></td> 
            <td><?php echo $row['quantity'];?></td>
            <td><?php echo $row['amount'];?></td>
            <td><button type="button" class="btn btn-dark" data-toggle="modal" data-target="#changeStatusModal" data-productid="<?php echo $row['product_id'];?>">update</button>
            <td><?php $status = $row['status']; if ($status == 1){?> <button style= "width: 120px;" type="button" class="btn btn-warning">Pending</button><?php }else{?> <button style= "width: 120px;"  type="button" class="btn btn-success">Completed</button><?php } ?></td>

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
                     <th colspan="7">Total Amount</th>
                     <th colspan="3"><?php echo $amount;?> BHD</th>
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
<script>
    // Function to set product ID in the modal when the button is clicked
    $('#changeStatusModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var productId = button.data('productid');
        var modal = $(this);
        modal.find('#productIdInput').val(productId);
    });
</script>
</body>

</html>