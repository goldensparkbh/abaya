<?php
session_start();
error_reporting(E_ALL);
include('config.php');
date_default_timezone_set("Asia/Bahrain");
$msg = '';
$active = 'True-category';
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
    <?php include('./inc/admin-header.php'); ?>

    <div class="container mt-5 my-section">

    <div class="row">
        <div class="col-md-6">
          <h3 class="py-4">Category</h3>
          <div class="msg"><?php echo $msg; ?></div>
        </div>
        <div class="col-md-6 text-right">
            <button type="button" style="margin-top:20px;" class="btn btn-dark" data-toggle="modal" data-target="#addNewModal">Add New Category</button>
        </div>
    </div>
      <div class="row">
        <?php

        if ($query->rowCount() > 0) {
          foreach ($results as $result) {        ?>
            <div class="col-lg-4 col-md-6 mb-4">
              <div class="card h-100">
                <div class="card-body">
                    <h5><?php echo $result->category_name; ?></h5>
                    <div class="row">
                      <div class="col-md-6">
                        <button type="button" style="width: 95%;" class="btn btn-dark" data-toggle="modal" data-target="#updateModal" 
                        data-variable1="<?php echo $result->category_id;?>" 
                        data-variable2="<?php echo $result->category_name;?>">
                          Update
                        </button>
                      </div>
                      <div class="col-md-6">
                        <button type="button" style="width: 95%;"  class="btn btn-danger" data-toggle="modal" data-target="#deleteModal" 
                        data-variable1="<?php echo $result->category_id;?>">
                          Delete
                        </button>
                      </div>
                    </div>
                </div>
              </div>
            </div>
        <?php }
        } ?>
      </div>
    <!-- Add New Modal -->
    <div class="modal fade" id="addNewModal" tabindex="-1" role="dialog" aria-labelledby="addNewModalLabel" aria-hidden="true">
      <!-- Add New modal content here -->
      <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header" style="background: #85aeb0;">
                <h5 class="modal-title" id="deleteModalLabel">Add New Category</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                    <!-- Product form -->
                    <form action="add_category.php" method="post">

                        <!-- Textbox for product name -->
                        <div class="form-group">
                            <label for="categoryName">Category Name:</label>
                            <input type="text" class="form-control" name="categoryName">
                        </div>

                        <div class="row">
                          <div class="col-md-6 text-center">
                            <button type="submit" class="btn btn-update">Add Category</button>
                          </div>

                          <div class="col-md-6 text-center">
                            <button type="button" class="btn btn-close" data-dismiss="modal">Close</button>
                          </div>
                        </div>

                    </form>
            </div>
        </div>
      </div>
    </div>
    <!-- Update Modal -->
    <div class="modal fade" id="updateModal" tabindex="-1" role="dialog" aria-labelledby="updateModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header" style="background: #85aeb0;">
                    <h5 class="modal-title" id="categoryModalLabel">Edit Category</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">

                    <!-- Product form -->
                    <form action="update_category.php" method="post" enctype="multipart/form-data">
                        <!-- Hidden input for product ID -->
                        <input type="hidden" id="categoryId" name="categoryId">

                        <!-- Textbox for product name -->
                        <div class="form-group">
                            <label for="categoryName">Category Name:</label>
                            <input type="text" class="form-control" id="categoryName" name="categoryName">
                        </div>



                        <div class="row">
                          <div class="col-md-6 text-center">
                            <button type="submit" class="btn btn-update">Update Category</button>
                          </div>

                          <div class="col-md-6 text-center">
                            <button type="button" class="btn btn-close" data-dismiss="modal">Close</button>
                          </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <!-- Delete modal content here -->
      <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header" style="background: #85aeb0;">
                <h5 class="modal-title" id="deleteModalLabel">Delete Action</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <!-- Your delete confirmation or content goes here -->
                <p>Delete confirmation...</p>
            <form action="delete_category.php" method="post">
              <!-- Hidden input for Category ID -->
              <input type="hidden" id="deleteCategoryId" name="deleteCategoryId">

              <div class="row">
                <div class="col-md-6 text-center">
                  <button type="submit" class="btn btn-danger btn-delete">Delete</button>
                </div>
                <div class="col-md-6 text-center">
                  <button type="button" class="btn btn-close" data-dismiss="modal">Close</button>
                </div>
              </div>              
            </form>
            </div>
        </div>
      </div>
    </div>


    </div>

    <?php// include('./inc/footer.php'); ?>
  </section>

  <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
<script>
    // Function To Add New Product
    $('#addNewModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
    });
    // Function To Update Product Details
    $('#updateModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal

        var variable1 = button.data('variable1'); // Product ID
        var variable2 = button.data('variable2'); // Category Name


        var textbox1 = document.getElementById('categoryId');
        var textbox2 = document.getElementById('categoryName');

        // Update the modal content with the retrieved values
        textbox1.value = variable1;
        textbox2.value = variable2;
    });
    // Function to Delete Record
    $('#deleteModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal

        var variable1 = button.data('variable1'); // Category ID

        var textbox1 = document.getElementById('deleteCategoryId');

        // To Delete the modal content with the retrieved values
        textbox1.value = variable1;
    });
</script>
</body>

</html>