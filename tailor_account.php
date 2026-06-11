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

    if ($password === $confirmPassword) {
        $sql = "INSERT INTO tailors (tailor_name, tailor_email, tailor_password, tailor_mobile, created_at) 
                VALUES (:tailor_name, :tailor_email, :tailor_password, :tailor_mobile, NOW())";
        $query = $db->prepare($sql);
        $query->bindParam(':tailor_name', $name, PDO::PARAM_STR);
        $query->bindParam(':tailor_email', $email, PDO::PARAM_STR);
        $query->bindParam(':tailor_password', $password, PDO::PARAM_STR);
        $query->bindParam(':tailor_mobile', $mobile, PDO::PARAM_STR);
        $query->execute();
        $lastInsertId = $db->lastInsertId();

        if ($lastInsertId) {
            echo "<script>alert('Thank you for registering as a tailor.')</script>";
            echo "<script type='text/javascript'> document.location = 'login.php'; </script>";
        } else {
            echo "<script>alert('Registration failed. Please check your details and try again.')</script>";
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
    <title>Tailor Registration</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
</head>

<body>

<section>
    <?php include('./inc/header.php'); ?>

    <div class="row justify-content-md-center mt-5">
        <div class="col-md-4">
            <form class="text-center border border-light p-5" method="post">
                <p class="h4 mb-4">Tailor Sign Up</p>
                <input name="name" type="text" class="form-control mb-4" placeholder="Name" value="<?php echo $name; ?>" required>
                <input name="email" type="email" class="form-control mb-4" placeholder="Email" value="<?php echo $email; ?>" required>
                <input name="mobile" type="text" class="form-control mb-4" placeholder="Mobile" value="<?php echo $mobile; ?>" required>
                <input name="password" type="password" class="form-control mb-4" placeholder="Password" required>
                <input name="confirmPassword" type="password" class="form-control mb-4" placeholder="Confirm Password" required>
                <input class="btn btn-dark btn-block my-4" name="submit" type="submit" value="Register">
                <p>Already Registered?
                    <a href="login.php">Login</a>
                </p>
            </form>
        </div>
    </div>

    <?php include('./inc/footer.php'); ?>
</section>

</body>
</html>
