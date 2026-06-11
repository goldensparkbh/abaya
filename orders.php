<?php
session_start();
error_reporting(E_ALL);
include('connect.php');
date_default_timezone_set("Asia/Bahrain");
$msg = '';
$active = 'True-order';
$logo = 'img/';
$user_id = $_SESSION['user'];
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abaya | Admin Page</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="./css/style.css">
  <script>
    if (typeof window.history.pushState == 'function') {
      window.history.pushState({}, "Hide", '<?php echo $_SERVER['PHP_SELF']; ?>');
    }
  </script>

</head>

<body>

  <section>
    <?php include('inc/header.php'); ?>

    <div class="container mt-5 my-section">
      <div class="d-flex justify-content-between">
      <div>
      <h3 class="py-4">Orders</h3>
      </div>
    </div>

    <div class="table-responsive">
        <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                <thead class="thead-dark">
                  <tr>
                     <th>Order ID</th>
                     <th>User Name</th>
                     <th>Phone Number</th>
                     <th>Email</th>
                     <th>View Order</th>
                  </tr>
                </thead>
                <tbody>
<?php
    $user_id = $_SESSION['user'];
    $sql = "SELECT  orders.id, users.name, users.mobile, users.email
            FROM users,orders 
            WHERE users.id =  orders.user
            AND users.id = '$user_id'
            ORDER BY orders.id DESC
             ;";
    $result = $conn->query($sql);
     if ($result->num_rows > 0){
    // output data of each row
        while($row = $result->fetch_assoc()) 
        {
  ?>
          <tr>
            <td><?php echo $row['id'];?></td>            
            <td><?php echo $row['name'];?></td>
            <td><?php echo $row['mobile'];?></td>
            <td><?php echo $row['email'];?></td>   
            <td align="center">
                <li class="list-inline-item">
                   <a  href="order.php?id=<?php echo $row['id']; ?>"><button class="btn btn-sm btn-secondary btn-sm rounded-0" width="400" height="200" type="button" data-toggle="tooltip" data-placement="top" title="View"> View Order</button></a>
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
?> 
                </tbody>
              </table>
      <!-- /.container-fluid -->
<?php
// Assuming $conn is your MySQLi connection and $user_id is set
$query = "SELECT id, abaya_color, fabrics, image_name, embroidery, lace_trim, b_addon, height_cm, status, customer_price, created_at, expected_time 
          FROM custom_abaya 
          WHERE fk_customer_id = $user_id
          ORDER BY `custom_abaya`.`id` DESC";
$result = $conn->query($query);
?>

<div class="container mt-5">
  <h2 class="mb-4">Custom Orders</h2>
  <div class="table-responsive">
    <table class="table table-bordered table-striped">
      <thead class="thead-dark">
        <tr>
          <th>ID</th>
          <th>Abaya Color</th>
          <th>Fabrics</th>
          <th>Embroidery</th>
          <th>Lace Trim</th>
          <th>Belt</th>
          <th>Height (cm)</th>
          <th>Price</th>          
          <th>Status</th>
          <th>Expected Time</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        <?php if ($result && $result->num_rows > 0): ?>
          <?php while($row = $result->fetch_assoc()): ?>
            <tr>
              <td><?= htmlspecialchars($row['id']) ?></td>
              <td>
                <a href="#" data-toggle="modal" data-target="#designModal<?= $row['id'] ?>"><?= htmlspecialchars($row['abaya_color']) ?></a>

                <!-- Modal -->
                <div class="modal fade" id="designModal<?= $row['id'] ?>" tabindex="-1" role="dialog" aria-labelledby="designModalLabel<?= $row['id'] ?>" aria-hidden="true">
                  <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="designModalLabel<?= $row['id'] ?>">Abaya Design</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div class="modal-body text-center">
                        <img src="default/<?= htmlspecialchars($row['image_name']) ?>" alt="Abaya Design" class="img-fluid">
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td><?= htmlspecialchars($row['fabrics']) ?></td>
              <td><?= $row['embroidery'] ?? '—' ?></td>
              <td><?= $row['lace_trim'] ?? '—' ?></td>
              <td><?= $row['b_addon'] ?? '—' ?></td>
              <td><?= htmlspecialchars($row['height_cm']) ?></td>
              <td>
                <?php 
                  echo ($row['customer_price'] == 0) ? '--' : htmlspecialchars($row['customer_price']); 
                ?>
              </td>
                  <td>
                    <?php
                      switch ($row['status']) {
                        case 1:
                          echo '<button class="btn btn-sm btn-secondary text-start" style="width:110px">
                                  <i class="fas fa-hourglass-start me-1"></i> New
                                </button>';
                          break;
                        case 2:
                          echo '<button class="btn btn-sm btn-info text-start" style="width:110px">
                                  <i class="fas fa-search me-1"></i> Review
                                </button>';
                          break;
                        case 3:
                          echo '<button class="btn btn-sm btn-warning text-start" style="width:110px">
                                  <i class="fas fa-spinner fa-spin me-1"></i> Progress
                                </button>';
                          break;
                        case 4:
                          echo '<button class="btn btn-sm btn-success text-start" style="width:110px">
                                  <i class="fas fa-check-circle me-1"></i> Completed
                                </button>';
                          break;
                        default:
                          echo '<button class="btn btn-sm btn-light w-100 text-start">
                                  <i class="fas fa-question-circle me-1"></i> Unknown
                                </button>';
                      }
                    ?>
                  </td>
              <td><?= !empty($row['expected_time']) ? htmlspecialchars($row['expected_time']) : 'Soon' ?></td>
              <td><?= htmlspecialchars($row['created_at']) ?></td>
            </tr>
          <?php endwhile; ?>
        <?php else: ?>
          <tr><td colspan="11" class="text-center">No custom orders found.</td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

      <!-- Footer Start -->
      </div>
    </div>

    <?php include('./inc/footer.php'); ?>
  </section>

  <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>

</body>

</html>