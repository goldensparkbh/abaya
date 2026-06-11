<div class="container-fluid" style="background: #85aeb0;">
    <div class="container" style="background: #85aeb0;">
        <nav class="navbar navbar-expand-md navbar-dark  p-4" style="background: #85aeb0;">
            <a class="navbar-brand mr-5 font-weight-bold" href="dashboard.php"><img src="<?php echo $logo; ?>logo-01.svg" style="width:170px; height: 60px;"></a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarsExampleDefault">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item      <?php if($active == 'True-dashboard'){?>active<?php }?>">
                        <a class="nav-link font-weight-bold" href="dashboard.php">Dashboard</a>
                    </li>
                    <li class="nav-item      <?php if($active == 'True-products'){?>active<?php }?>">
                        <a class="nav-link font-weight-bold" href="products.php">Products</a>
                    </li>
                    <li class="nav-item ml-2 <?php if($active == 'True-order'){?>active<?php }?>">
                        <a class="nav-link font-weight-bold" href="business_orders.php">Orders</a>
                    </li>

                </ul>

                <ul class="navbar-nav">
                        <li class="nav-item active">
                            <a class="nav-link" href="#"><i class="fa fa-user"></i> Hi, <?php echo $_SESSION['login'] ?></a>
                        </li>
                        <li class="nav-item active">
                            <a class="nav-link" href="logout.php"><b>Logout</b></a>
                        </li>

                </ul>
            </div>
        </nav>
    </div>
</div>