<?php
session_start();
error_reporting(0);
include('config.php');
$active = 'True-about';
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
</head>
<body>

    <section>
        <?php include('./inc/header.php') ;?> 
       
            <div class="container my-5">
                <h3 class="py-4">About Us</h3>
                <div class="row">

                <p>Welcome to our culinary haven, where passion meets the plate! At Home Made Food, we believe that the heart of every home is its kitchen, and there's something truly magical about the art of crafting homemade food. Our journey began with a simple desire—to bring the warmth and authenticity of home-cooked meals to your table. We understand the significance of a well-prepared dish, made with love and attention to detail. Our dedicated team of chefs and food enthusiasts is committed to curating a menu that not only tantalizes your taste buds but also evokes a sense of nostalgia for the comforting flavors of home. From carefully selected ingredients to tried-and-true family recipes, every dish we offer is a testament to the richness of homemade goodness. Join us on a culinary adventure that celebrates tradition, flavor, and the joy that comes from sharing a homemade meal. At Home Made Food, we are not just serving food; we are serving a taste of home. Welcome to our kitchen—where every bite tells a story.</p>
              </div>
        </div>
    
        <?php include('./inc/footer.php') ;?> 
        
    </section>
        
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
</body>
</html>