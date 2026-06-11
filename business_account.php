<?php
session_start();
error_reporting(0);
include('config.php');
$logo = 'img/';
$name = $mobile = $email = '';
if (isset($_POST['submit'])) {
    $name = $_POST['name'];
    $business_name = $_POST['business_name'];
    $mobile = $_POST['mobile'];
    $email = $_POST['email'];
    $password = md5($_POST['password']);
    $confirmPassword = md5($_POST['confirmPassword']);
    if($password === $confirmPassword){
    $sql = "INSERT INTO owner_of_business(owner_name,business_name,email,mobile,password) VALUES(:owner_name,:business_name,:email,:mobile,:password)";
    $query = $db->prepare($sql);
    $query->bindParam(':owner_name', $name, PDO::PARAM_STR);
    $query->bindParam(':business_name', $business_name, PDO::PARAM_STR);
    $query->bindParam(':mobile', $mobile, PDO::PARAM_STR);
    $query->bindParam(':email', $email, PDO::PARAM_STR);
    $query->bindParam(':password', $password, PDO::PARAM_STR);
    $query->execute();
    $lastInsertId = $db->lastInsertId();
    if ($lastInsertId) {
        echo "<script>alert('Thank you for registering. We trust you will have a wonderful experience.')</script>";
        echo "<script type='text/javascript'> document.location = 'login.php'; </script>";

    } else {
        echo "<script>alert('Please Fill All Valid Details')</script>";
    }
    } else{
        echo "<script>alert('The Password Confirmation does not match.')</script>";
    }

}

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="./css/style.css">
</head>

<body>

    <section>
        <?php include('./inc/header.php'); ?>

        <div class="row justify-content-md-center">
            <div class="col-4">
                <form class="text-center border border-light p-5" method="post">
                    <p class="h4 mb-4">Business Sign up</p>
                    <input name="name" type="text" class="form-control mb-4" placeholder="Name" value="<?php echo $name;?>" required>
                    <input name="business_name" type="text" class="form-control mb-4" placeholder="Business Name" value="<?php echo $business_name;?>" required>
                    <input name="email" type="email" class="form-control mb-4" placeholder="Email" value="<?php echo $email;?>" required>
                    <input name="mobile" type="text" class="form-control mb-4" placeholder="Mobile" value="<?php echo $mobile; ?>" required>
                    <input name="password" type="password" class="form-control mb-4" placeholder="Password" required>
                    <input name="confirmPassword" type="password" class="form-control mb-4" placeholder="Confirm Password" required>
                    <input class="btn btn-dark btn-block my-4" name="submit" type="submit" value="Register">
                    <p>Already Registerd?
                        <a href="login.php">Login</a>
                    </p>
                </form>
            </div>
        </div>
        <?php include('./inc/footer.php'); ?>
    </section>


    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
</body>

</html>