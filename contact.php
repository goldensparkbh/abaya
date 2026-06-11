<?php
session_start();
error_reporting(0);
include('config.php');
$active = 'True-contact';
$logo = 'img/';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home Made Food</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.10/css/all.css" integrity="sha384-+d0P83n9kaQMCwj8F4RJB66tzIwOKmrdb46+porD/OvrJ+37WqIM7UoBtwHO6Nlg" crossorigin="anonymous">
</head>
<body>
<div class="page-wrapper d-flex flex-column min-vh-100">
    <?php include('./inc/header.php') ;?> 

    <section>
       
            <div class="container my-5">
                <h3 class="py-4">Contact Us</h3>
                  <div class="row">
                    <div class="col-sm-8">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14327.062111235062!2d50.487629!3d26.139187!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xc16dc054e5ca3a5d!2sQuattro%20Protection%20Center!5e0!3m2!1sen!2sbh!4v1670588846616!5m2!1sen!2sbh" width="100%" height="320" frameborder="0" style="border:0" allowfullscreen></iframe>
                    </div>

                    <div class="col-sm-4" id="contact2">
                    <h3>Contact Us</h3>
                    <hr align="left" width="50%">
                    <h4 class="pt-2">Website</h4>
                    <i class="fas fa-globe" style="color:#000"></i> address<br>
                    <h4 class="pt-2">Contact Number</h4>
                    <i class="fas fa-phone" style="color:#000"></i> <a href="tel:+"> 3654581 </a><br>
                    <i class="fab fa-whatsapp" style="color:#000"></i><a href="tel:+"> 17111222 </a><br>
                    <h4 class="pt-2">Email</h4>
                    <i class="fa fa-envelope" style="color:#000"></i> <a href="">info@abayaboutiqu.com</a><br>
                    </div>
                 </div>
            </div>
    </section>
    <?php include('./inc/footer.php') ;?> 
</div>
        
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
</body>
</html>