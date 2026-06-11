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

      <!-- Tailors Table -->
      <h3 class="py-4">Tailors Details</h3>
      <div class="table-responsive">
        <table class="table table-striped table-bordered" width="100%">
          <thead class="thead-dark">
            <tr>
              <th>Tailor ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            <?php
            $tailors_sql = "SELECT tailor_id, tailor_name, tailor_email, tailor_mobile, created_at FROM tailors";
            $tailors_result = $conn->query($tailors_sql);

            if ($tailors_result->num_rows > 0) {
              while ($tailor = $tailors_result->fetch_assoc()) {
                echo "<tr>
                        <td>{$tailor['tailor_id']}</td>
                        <td>{$tailor['tailor_name']}</td>
                        <td>{$tailor['tailor_email']}</td>
                        <td>{$tailor['tailor_mobile']}</td>
                        <td>{$tailor['created_at']}</td>
                      </tr>";
              }
            } else {
              echo "<tr><td colspan='5'>No Tailors Found.</td></tr>";
            }

            $conn->close();
            ?>
          </tbody>
        </table>
      </div>

    </div>
  </section>

  <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js"></script>
</body>

</html>
