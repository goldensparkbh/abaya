<?php
include('connect.php');
?>
<div class="container-fluid" style="background: #85aeb0;">
    <div class="container" style="background: #85aeb0;">
        <nav class="navbar navbar-expand-md navbar-dark  p-4" style="background: #85aeb0;">
            <a class="navbar-brand mr-5 font-weight-bold" href="index.php"><img src="<?php echo $logo; ?>logo-01.svg" style="width:170px; height: 60px;"></a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarsExampleDefault">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item      <?php if($active == 'True-index'){?>active<?php }?>">
                        <a class="nav-link font-weight-bold" href="index.php">Home</a>
                    </li>
                    <?php
                    $sql = "SELECT category_id, category_name FROM category";
                    $result = $conn->query($sql);
                    if ($result->num_rows > 0) {
                    // output data of each row
                        while($row = $result->fetch_assoc()) {
                        $category_id   = $row['category_id'];   
                        $category_name = $row['category_name'];
                    ?>
                    <li class="nav-item <?php if($active == $category_id){?>active<?php }?>">
                        <a class="nav-link font-weight-bold" href="menu.php?id=<?php echo $category_id; ?>"><?php echo $category_name?></a>
                    </li>
                    <?php
                        }
                    } else {
                            echo "No Menu!!";
                        }
                    ?>
                    <li class="nav-item <?php if($active == 'custom'){?>active<?php }?>">
                        <a class="nav-link font-weight-bold" href="custom.php">Custom</a>
                    </li>
                    <?php if (strlen(isset($_SESSION['login']) == 0)){ ?>
                    <li class="nav-item ml-2 <?php if($active == 'True-contact'){?>active<?php }?>">
                        <a class="nav-link font-weight-bold" href="contact.php">Contact Us</a>
                    </li>
                    <?php } else { ?>
                    <li class="nav-item <?php if($active == 'True-order'){?>active<?php }?>">
                        <a class="nav-link font-weight-bold" href="orders.php">Orders</a>
                    </li>
                    <?php } ?>



                </ul>

                <ul class="navbar-nav">
                    <li class="nav-item active">
                        <a class="nav-link" href="mycart.php"> <i class="fa fa-shopping-cart"></i> My Cart</a>
                    </li>
                    <li class="nav-item active">
                        <a class="nav-link"> | </a>
                    </li>

                    <?php if (strlen(isset($_SESSION['login']) == 0)){ ?>
                        <li class="nav-item active">
                            <a class="nav-link" href="login.php">Login / Register</a>
                        </li>
                    <?php } else { ?>
                        <li class="nav-item active">
                            <a class="nav-link" href="#"><i class="fa fa-user"></i> Hi, <?php echo $_SESSION['login'] ?></a>
                        </li>
                        <li class="nav-item active">
                            <a class="nav-link" href="logout.php"><b>Logout</b></a>
                        </li>
                    <?php } ?>

                </ul>
            </div>
        </nav>
    </div>
</div>