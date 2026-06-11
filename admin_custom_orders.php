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
  <title>Custom Orders | Admin Page</title>
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
    <?php include('inc/admin-header.php'); ?>

    <div class="p-5 mt-5 my-section">
      <div class="d-flex justify-content-between">
        <div>
          <h3 class="py-4">Custom Orders</h3>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User Name</th>
              <th>Abaya Color</th>
              <th>Fabric</th>
              <th>Embroidery</th>
              <th>Lace Trim</th>
              <th>Belt</th>
              <th>Tailor Price</th>
              <th>Customer Price</th>
              <th>Expected Time</th>
              <th>Status</th>
              <th>Assigned Tailor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tfoot>
            <tr>
              <th>Order ID</th>
              <th>User Name</th>
              <th>Abaya Color</th>
              <th>Fabric</th>
              <th>Embroidery</th>
              <th>Lace Trim</th>
              <th>Belt</th>
              <th>Tailor Price</th>
              <th>Customer Price</th>
              <th>Expected Time</th>
              <th>Status</th>
              <th>Assigned Tailor</th>
              <th>Actions</th>
            </tr>
          </tfoot>
          <tbody>
            <?php
            $sql = "SELECT custom_abaya.id, users.name, custom_abaya.abaya_color, custom_abaya.fabrics, custom_abaya.image_name, custom_abaya.embroidery, custom_abaya.lace_trim, custom_abaya.b_addon, custom_abaya.height_cm, custom_abaya.expected_time, custom_abaya.status, custom_abaya.tailor_price,custom_abaya.customer_price, tailors.tailor_name, custom_abaya.created_at
                    FROM custom_abaya
                    JOIN users ON users.id = custom_abaya.fk_customer_id
                    LEFT JOIN tailors ON tailors.tailor_id = custom_abaya.fk_tailor
                    ORDER BY custom_abaya.id DESC";
            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
              while ($row = $result->fetch_assoc()) {
            ?>
                <tr>
                  <td><?php echo $row['id']; ?></td>
                  <td><?php echo $row['name']; ?></td>
	              <td>
	                <a href="#" data-toggle="modal" data-target="#designModal<?= $row['id'] ?>"><?php echo $row['abaya_color']; ?></a>

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
                  <td><?php echo $row['fabrics']; ?></td>
                  <td><?php echo $row['embroidery'] ? $row['embroidery'] : '--'; ?></td>
                  <td><?php echo $row['lace_trim'] ? $row['lace_trim'] : '--'; ?></td>
                  <td><?php echo $row['b_addon'] ? $row['b_addon'] : '--'; ?></td>                  
                  <td><?php echo $row['tailor_price'] ? $row['tailor_price'] : '--'; ?></td>
                  <td><?php echo $row['customer_price'] ? $row['customer_price'] : '--'; ?></td>
                  <td><?php echo $row['expected_time'] ? $row['expected_time'] : '--'; ?></td>
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

                  <td><?php echo $row['tailor_name'] ? $row['tailor_name'] : 'Not Assigned'; ?></td>
                  <td align="center">
                    <!-- Edit Button (Triggers Modal) -->
                    <button class="btn btn-primary btn-sm rounded-0" type="button" data-toggle="modal" data-target="#editModal<?php echo $row['id']; ?>" data-toggle="tooltip" data-placement="top" title="Edit">Edit</button>
                    
                    <!-- Delete Button -->
                    <a href="admin-order-delete.php?id=<?php echo $row['id']; ?>" onclick="return confirm('Are you sure you want to delete this order?')">
                      <button class="btn btn-danger btn-sm rounded-0" type="button" data-toggle="tooltip" data-placement="top" title="Delete">Delete</button>
                    </a>
                  </td>

                </tr>

                <!-- Edit Modal -->
                <div class="modal fade" id="editModal<?php echo $row['id']; ?>" tabindex="-1" role="dialog" aria-labelledby="editModalLabel<?php echo $row['id']; ?>" aria-hidden="true">
                  <div class="modal-dialog" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="editModalLabel<?php echo $row['id']; ?>">Update Order</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <form action="admin-order-update.php" method="POST">
                        <div class="modal-body">
                          <div class="form-group">
                            <label for="price">Tailor Price</label>
                            <input type="number" name="tailor_price" class="form-control" id="tailor_price" value="<?php echo $row['tailor_price']; ?>" required>
                          </div>
                          <div class="form-group">
                            <label for="price">Customer Price</label>
                            <input type="number" name="customer_price" class="form-control" id="customer_price" value="<?php echo $row['customer_price']; ?>" required>
                          </div>
                          <div class="form-group">
                            <label for="tailor_id">Select Tailor</label>
                            <select name="tailor_id" class="form-control" id="tailor_id" required>
                              <option value="">Select Tailor</option>
                              <?php
                                // Get list of tailors
                                $tailorsQuery = "SELECT tailor_id, tailor_name FROM tailors";
                                $tailorsResult = $conn->query($tailorsQuery);
                                while ($tailor = $tailorsResult->fetch_assoc()) {
                                  $selected = ($row['tailor_name'] == $tailor['tailor_name']) ? 'selected' : '';
                                  echo "<option value='" . $tailor['tailor_id'] . "' $selected>" . $tailor['tailor_name'] . "</option>";
                                }
                              ?>
                            </select>
                          </div>
                        </div>
                        <div class="modal-footer">
                          <input type="hidden" name="order_id" value="<?php echo $row['id']; ?>">
                          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                          <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
            <?php
              }
            } else {
              echo "<tr><td colspan='9'>No Custom Orders Found.</td></tr>";
            }
            $conn->close();
            ?>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>

</body>

</html>
