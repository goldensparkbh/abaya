<?php
session_start();
error_reporting(E_ALL);
include('connect.php');
date_default_timezone_set("Asia/Bahrain");
$msg = '';
$active = 'True-products';
$category_id = '';
$logo = 'img/';
$user_id = $_SESSION['user'];
if(isset($_GET['id'])) 
{
     $id =$_GET['id'];
     $category_id = $_SESSION["category_id"] = $id ;

} else {
     $category_id = $_SESSION["category_id"];
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
      <h3 class="py-4"> New Product</h3>
      </div>
      <div>
            <button type="button" class="btn btn-dark btn-block" data-toggle="modal" data-target="#addNewModal" 
             data-variable5="<?php echo $category_id;?>">
             Add New Product
            </button>
      </div>
    </div>


      <div class="msg"><?php echo $msg;?></div>
      <div class="row">

<?php

    $sql = "SELECT id,title,price,img 
            FROM products 
            WHERE fk_category_id = '$category_id' 
            AND fk_owner_id = '$user_id'
            ";
    $result = $conn->query($sql);
     if ($result->num_rows > 0){
    // output data of each row
        while($row = $result->fetch_assoc()) 
        {
  ?>
            <div class="col-lg-3 col-md-6 mb-4">
              <div class="card h-100">
                <a href="#"><img class="card-img-top" src="./img/products/<?php echo $row['img'];?>" alt="<?php echo $row['title'];?>" title="<?php echo $row['title'];?>"></a>
                <div class="card-body">
                  <h5 class="card-title">
                  <h5 class="card-title">
                    <a><?php echo $row['title'];?></a>
                  </h5>
                  <p class="card-title">
                    Product description 
                  </p>
                  <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" method="POST">
                    <input type="text" name="productId" value="<?php echo $row['id'];?>" style="display:none">
                    <p class="price_class"><label for="Price" >Price:  <?php echo $row['price'];?> BHD</label></p>
                    <div class="row">
                      <div class="col-md-6">
                        <button type="button" class="btn btn-dark" data-toggle="modal" data-target="#updateModal" 
                        data-variable1="<?php echo $row['id'];?>" 
                        data-variable2="<?php echo $row['title'];?>" 
                        data-variable3="<?php echo $row['price'];?>"
                        data-variable4="<?php echo $category_id;?>">
                          Update
                        </button>
                      </div>
                      <div class="col-md-6">
                        <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#deleteModal" 
                        data-variable1="<?php echo $row['id'];?>"
                        data-variable2="<?php echo $category_id;?>"
                        data-variable3="<?php echo $row['img'];?>">
                          Delete
                        </button>
                      </div>
                    </div>
                  </form>
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
            <div class="modal-header" style="background: #919884;">
                <h5 class="modal-title" id="deleteModalLabel">Add New Product</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                    <!-- Product form -->
                    <form action="add_product.php" method="post" enctype="multipart/form-data">
                        <!-- Hidden input for product ID -->
                        <input type="hidden" id="newcategoryId" name="newcategoryId">
                        <!-- Textbox for product image -->
                        <div class="form-group">
                            <label for="productImg">Product Image:</label>
                            <input type="file" class="form-control" name="productImg">
                        </div>

                        <!-- Textbox for product name -->
                        <div class="form-group">
                            <label for="productName">Product Name:</label>
                            <input type="text" class="form-control" name="productName">
                        </div>

                        <!-- Textbox for product price -->
                        <div class="form-group">
                            <label for="productPrice">Product Price:</label>
                            <input type="text" class="form-control" name="productPrice">
                        </div>

                        <div class="row">
                          <div class="col-md-6 text-center">
                            <button type="submit" class="btn btn-update">Add Product</button>
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
                <div class="modal-header" style="background: #919884;">
                    <h5 class="modal-title" id="productModalLabel">Edit Product</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">

                    <!-- Product form -->
                    <form action="update_product.php" method="post" enctype="multipart/form-data">
                        <!-- Hidden input for product ID -->
                        <input type="hidden" id="productId" name="productId">
                        <input type="hidden" id="categoryId" name="categoryId">
                        <!-- Textbox for product image -->
                        <div class="form-group">
                            <label for="productImg">Product Image:</label>
                            <input type="file" class="form-control" id="productImg" name="productImg">
                        </div>

                        <!-- Textbox for product name -->
                        <div class="form-group">
                            <label for="productName">Product Name:</label>
                            <input type="text" class="form-control" id="productName" name="productName">
                        </div>

                        <!-- Textbox for product price -->
                        <div class="form-group">
                            <label for="productPrice">Product Price:</label>
                            <input type="text" class="form-control" id="productPrice" name="productPrice">
                        </div>

                        <div class="row">
                          <div class="col-md-6 text-center">
                            <button type="submit" class="btn btn-update">Update Product</button>
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
            <div class="modal-header" style="background: #919884;">
                <h5 class="modal-title" id="deleteModalLabel">Delete Action</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <!-- Your delete confirmation or content goes here -->
                <p>Delete confirmation...</p>
            <form action="delete_product.php" method="post">
              <!-- Hidden input for product ID -->
              <input type="hidden" id="deleteProductId" name="deleteProductId">
              <input type="hidden" id="deleteCategoryId" name="deleteCategoryId">
              <input type="hidden" id="imgName" name="imgName">

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

  </section>

  <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>

</body>
<!-- Bootstrap JS and Popper.js (optional, for Bootstrap features like modal) -->
<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>

<script>
    // Function To Add New Product
    $('#addNewModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal

        var variable5 = button.data('variable5'); // Category ID

        var textbox5 = document.getElementById('newcategoryId');

        // Update the modal content with the retrieved values
        textbox5.value = variable5;
    });

    // Function To Update Product Details
    $('#updateModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal

        var variable1 = button.data('variable1'); // Product ID
        var variable2 = button.data('variable2'); // Product Name
        var variable3 = button.data('variable3'); // Price
        var variable4 = button.data('variable4'); // Category ID

        var textbox1 = document.getElementById('productId');
        var textbox2 = document.getElementById('productName');
        var textbox3 = document.getElementById('productPrice');
        var textbox4 = document.getElementById('categoryId');

        // Update the modal content with the retrieved values
        textbox1.value = variable1;
        textbox2.value = variable2;
        textbox3.value = variable3;
        textbox4.value = variable4;
    });
    // Function to Delete Record
    $('#deleteModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal

        var variable1 = button.data('variable1'); // Product ID
        var variable2 = button.data('variable2'); // Category ID
        var variable3 = button.data('variable3'); // Category ID

        var textbox1 = document.getElementById('deleteProductId');
        var textbox2 = document.getElementById('deleteCategoryId');
        var textbox3 = document.getElementById('imgName');

        // To Delete the modal content with the retrieved values
        textbox1.value = variable1;
        textbox2.value = variable2;
        textbox3.value = variable3;
    });
    
</script>
</html>