<?php
session_start();
error_reporting(0);
include('config.php');
$logo = 'img/';
$name = $mobile = $email = '';
if (isset($_POST['submit'])) {
    $name = $_POST['name'];
    $mobile = $_POST['mobile'];
    $email = $_POST['email'];
    $password = md5($_POST['password']);
    $confirmPassword = md5($_POST['confirmPassword']);
    if($password == $confirmPassword){
        $sql = "INSERT INTO users(name, email, mobile, password) VALUES(:name,:email, :mobile, :password)";
        $query = $db->prepare($sql);
        $query->bindParam(':name', $name, PDO::PARAM_STR);
        $query->bindParam(':mobile', $mobile, PDO::PARAM_STR);
        $query->bindParam(':email', $email, PDO::PARAM_STR);
        $query->bindParam(':password', $password, PDO::PARAM_STR);
        $query->execute();
        $lastInsertId = $db->lastInsertId();
        if ($lastInsertId) {
            $_SESSION['login']=$_POST['username'];
            echo "<script>alert('Thanks For Register, Continue Your Shopping')</script>";
            echo "<script type='text/javascript'> document.location = 'login.php'; </script>";
            unset($name);
            unset($mobile);
            unset($email); 
        } else {
            echo "<script>alert('Please Fill All Valid Details')</script>";
        }
    } else {
        echo "<script>alert('The Password Confirmation does not match.')</script>";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    
    <!-- Bootstrap & Icons -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="./css/style.css">
</head>
<body>

<section>
    <?php include('./inc/header.php'); ?>

    <div class="container my-5">
        <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-7">
                <form class="text-center border border-light p-4 shadow rounded bg-white" method="post">
                    <p class="h4 mb-4">Customer Sign up</p>

                    <input name="name" type="text" class="form-control mb-3" placeholder="Name" value="<?php echo $name;?>" required>

                    <input name="email" type="email" class="form-control mb-3" placeholder="Email" value="<?php echo $email;?>" required>

                    <input name="mobile" type="number" class="form-control mb-3" placeholder="Mobile" value="<?php echo $mobile; ?>" required>

                    <div class="position-relative">
                        <input type="password" id="password" name="password" class="form-control mb-3" placeholder="Password" required>
                        <i class="fas fa-eye" id="togglePassword" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"></i>
                    </div>

                    <div class="position-relative">
                        <input type="password" id="confirmPassword" name="confirmPassword" class="form-control mb-3" placeholder="Confirm Password" required>
                        <i class="fas fa-eye" id="toggleConfirmPassword" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"></i>
                    </div>

                    <input class="btn btn-dark btn-block my-3" name="submit" type="submit" value="Register">

                    <p class="mt-3">Already registered? <a href="login.php">Login</a></p>
                </form>
            </div>
        </div>
    </div>

    <?php include('./inc/footer.php'); ?>
</section>

<!-- Scripts -->
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>

<script>
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    togglePassword.addEventListener('click', function () {
        const type = passwordField.type === 'password' ? 'text' : 'password';
        passwordField.type = type;
        this.classList.toggle('fa-eye-slash');
    });

    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPasswordField = document.getElementById('confirmPassword');
    toggleConfirmPassword.addEventListener('click', function () {
        const type = confirmPasswordField.type === 'password' ? 'text' : 'password';
        confirmPasswordField.type = type;
        this.classList.toggle('fa-eye-slash');
    });
</script>

</body>
</html>
