<?php
session_start();
error_reporting(0);
include('config.php');
$logo = 'img/';

if (isset($_POST['submit'])) {
    $email = $_POST['email'];
    $password = md5($_POST['password']);

    if (!empty($email) && !empty($password)) {

        // 1. Admin/User Login
        $sql = "SELECT id,name,email,user_type FROM users WHERE email=:email and password=:password";
        $query = $db->prepare($sql);
        $query->bindParam(':email', $email, PDO::PARAM_STR);
        $query->bindParam(':password', $password, PDO::PARAM_STR);
        $query->execute();
        $results = $query->fetch(PDO::FETCH_OBJ);

        if ($query->rowCount() > 0) {
            $user_type = $results->user_type;
            $_SESSION['login'] = $results->name;
            $_SESSION['user'] = $results->id;
            $_SESSION['admin'] = ($user_type == 1);

            if ($user_type == 1) {
                echo "<script>alert('Login Success, Welcome to Admin Page')</script>";
                echo "<script type='text/javascript'> document.location = 'admin-dashboard.php'; </script>";
            } else {
                echo "<script>alert('Login Success, Continue Your Shopping')</script>";
                echo "<script type='text/javascript'> document.location = 'index.php'; </script>";
            }
        } else {
            // 2. Business Owner Login
            $sql = "SELECT owner_id,owner_name,email FROM owner_of_business WHERE email=:email and password=:password";
            $query = $db->prepare($sql);
            $query->bindParam(':email', $email, PDO::PARAM_STR);
            $query->bindParam(':password', $password, PDO::PARAM_STR);
            $query->execute();
            $results = $query->fetch(PDO::FETCH_OBJ);

            if ($query->rowCount() > 0) {
                $_SESSION['login'] = $results->owner_name;
                $_SESSION['user'] = $results->owner_id;
                $_SESSION['admin'] = true;
                echo "<script>alert('Login Success, Welcome To Business Account')</script>";
                echo "<script type='text/javascript'> document.location = 'dashboard.php'; </script>";
            } else {
                // 3. Tailor Login
                $sql = "SELECT tailor_id, tailor_name, tailor_email FROM tailors WHERE tailor_email=:email and tailor_password=:password";
                $query = $db->prepare($sql);
                $query->bindParam(':email', $email, PDO::PARAM_STR);
                $query->bindParam(':password', $password, PDO::PARAM_STR);
                $query->execute();
                $results = $query->fetch(PDO::FETCH_OBJ);

                if ($query->rowCount() > 0) {
                    $_SESSION['login'] = $results->tailor_name;
                    $_SESSION['user'] = $results->tailor_id;
                    $_SESSION['admin'] = false;
                    $_SESSION['is_tailor'] = true;
                    echo "<script>alert('Login Success, Welcome Tailor')</script>";
                    echo "<script type='text/javascript'> document.location = 'tailor-dashboard.php'; </script>";
                } else {
                    echo "<script>alert('Invalid Details');</script>";
                }
            }
        }

    } else {
        echo "<script>alert('Please enter both email and password');</script>";
    }
}
?>


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home Made Food</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="./css/style.css">
</head>

<body>
 <div class="page-wrapper d-flex flex-column min-vh-100">
    <?php include('./inc/header.php'); ?>

    <section class="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
            <section style="flex: 1;">
                <div class="row justify-content-md-center">
                    <div class="col-12">
                        <form class="text-center border border-light p-5" method="post">
                            <p class="h4 mb-4">Sign in</p>
                            <input type="email" name="email" class="form-control mb-4" placeholder="E-mail" required>
                            <div class="position-relative">
                                <input type="password" id="password" name="password" class="form-control mb-4" placeholder="Password" required>
                                <i class="fas fa-eye" id="togglePassword" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 18px; cursor: pointer;"></i>
                            </div> 
                            <div class="d-flex justify-content-around">
                                <div>
                                    <div class="custom-control custom-checkbox">
                                        <input type="checkbox" class="custom-control-input" id="defaultLoginFormRemember">
                                        <label class="custom-control-label" for="defaultLoginFormRemember">Remember me</label>
                                    </div>
                                </div>
                            </div>
                            <input class="btn btn-dark btn-block my-4" name="submit" type="submit" value="Sign In">
                            <p>For a customer account, <a href="customer_account.php">click here</a>. For a user business account, <a href="business_account.php">click here</a>. For a tailor account, <a href="tailor_account.php">click here</a>.</p>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    </section>

    <?php include('./inc/footer.php'); ?>
</div>
    

<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
<script>
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');

    togglePassword.addEventListener('click', function () {
        const isHidden = passwordField.type === 'password';
        passwordField.type = isHidden ? 'text' : 'password';

        // Reverse the icon logic
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
</script>

</body>
</html>
