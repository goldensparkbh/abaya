<?php
session_start();
include('config.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['cart_id']) && isset($_POST['height'])) {
    $ids = $_POST['cart_id'];
    $heights = $_POST['height'];

    foreach ($ids as $i => $cartId) {
        $height = trim($heights[$i]);
        if ($height !== '') {
            $sql = "UPDATE cart SET height = :height WHERE id = :id AND user = :user";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':height', $height);
            $stmt->bindParam(':id', $cartId);
            $stmt->bindParam(':user', $_SESSION['user']);
            $stmt->execute();
        }
    }

    // After updating, redirect to checkout page
    header("Location: checkout.php");
    exit;
}
?>
