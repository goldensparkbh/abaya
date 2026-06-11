-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 06, 2025 at 06:07 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ab_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `productid` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `unit_price` decimal(10,3) NOT NULL,
  `height` float NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `amount` decimal(10,3) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`category_id`, `category_name`) VALUES
(1, 'Colored'),
(2, 'Embroidered'),
(3, 'Winter');

-- --------------------------------------------------------

--
-- Table structure for table `custom_abaya`
--

CREATE TABLE `custom_abaya` (
  `id` int(11) NOT NULL,
  `abaya_color` varchar(50) NOT NULL,
  `fabrics` varchar(50) NOT NULL,
  `image_name` varchar(100) NOT NULL,
  `embroidery` varchar(20) DEFAULT NULL,
  `lace_trim` varchar(20) DEFAULT NULL,
  `b_addon` varchar(20) DEFAULT NULL,
  `height_cm` decimal(10,3) DEFAULT NULL,
  `expected_time` date DEFAULT NULL,
  `tailor_price` decimal(10,3) NOT NULL,
  `customer_price` decimal(10,3) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `fk_tailor` int(11) DEFAULT NULL,
  `fk_customer_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_abaya`
--

INSERT INTO `custom_abaya` (`id`, `abaya_color`, `fabrics`, `image_name`, `embroidery`, `lace_trim`, `b_addon`, `height_cm`, `expected_time`, `tailor_price`, `customer_price`, `status`, `fk_tailor`, `fk_customer_id`, `created_at`) VALUES
(1, 'Charcoal Gray', 'Crepe', 'C-O-N.png', NULL, NULL, NULL, 151.000, '2025-05-09', 45.000, 50.000, 2, 1, 1, '2025-05-02 17:04:23'),
(2, 'Dark Olive Green', 'Cotton', 'G-O-N.png', NULL, NULL, NULL, 155.250, '2025-05-21', 50.000, 60.000, 3, 1, 1, '2025-05-02 17:26:42'),
(3, 'Dark Olive Green', 'Linen', 'G-C-E-L-B.png', 'Embroidery', 'Lace trim', 'Belt', 160.000, NULL, 35.000, 45.000, 2, 2, 1, '2025-05-02 17:27:57'),
(4, 'Charcoal Gray', 'Silk', 'C-B-B.png', NULL, NULL, 'Belt', 150.000, '2025-05-10', 40.000, 50.000, 3, 1, 3, '2025-05-02 17:59:32'),
(5, 'Charcoal Gray', 'Silk', 'C-B-B.png', NULL, NULL, 'Belt', 150.000, NULL, 45.000, 55.000, 1, 1, 3, '2025-05-02 18:00:42'),
(6, 'Dark Olive Green', 'Silk', 'G-C-E.png', 'Embroidery', NULL, NULL, 158.000, NULL, 40.000, 50.000, 1, 1, 3, '2025-05-02 18:19:36'),
(8, 'Dark Olive Green', 'Linen', 'G-C-B.png', NULL, NULL, 'Belt', 170.000, NULL, 0.000, NULL, 1, 1, 4, '2025-05-03 05:19:21');

-- --------------------------------------------------------

--
-- Table structure for table `orderitems`
--

CREATE TABLE `orderitems` (
  `id` int(11) NOT NULL,
  `oid` int(11) NOT NULL,
  `productid` int(11) NOT NULL,
  `unit_price` decimal(10,3) NOT NULL,
  `height` float NOT NULL,
  `quantity` int(11) NOT NULL,
  `amount` decimal(10,3) NOT NULL,
  `status` enum('1','2') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orderitems`
--

INSERT INTO `orderitems` (`id`, `oid`, `productid`, `unit_price`, `height`, `quantity`, `amount`, `status`) VALUES
(1, 1, 18, 40.000, 160, 1, 40.000, '1'),
(2, 1, 1, 40.000, 165, 1, 40.000, '1'),
(3, 2, 17, 40.000, 170, 1, 40.000, '1'),
(4, 2, 10, 40.000, 148, 1, 40.000, '1'),
(11, 6, 1, 45.000, 151, 1, 45.000, '1'),
(12, 6, 2, 50.000, 152, 1, 50.000, '1'),
(13, 6, 3, 48.000, 153, 1, 48.000, '1'),
(14, 7, 2, 50.000, 155, 1, 50.000, '2'),
(15, 7, 9, 40.000, 160, 1, 40.000, '1'),
(16, 7, 19, 40.000, 170, 1, 40.000, '1');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user`, `created_at`) VALUES
(1, 1, '2025-04-15 06:10:00'),
(2, 3, '2025-05-02 18:21:03'),
(3, 3, '2025-05-03 06:03:57'),
(6, 3, '2025-05-03 06:09:23'),
(7, 3, '2025-05-03 07:15:39');

-- --------------------------------------------------------

--
-- Table structure for table `owner_of_business`
--

CREATE TABLE `owner_of_business` (
  `owner_id` int(11) NOT NULL,
  `owner_name` varchar(100) NOT NULL,
  `business_name` varchar(100) NOT NULL,
  `email` varchar(25) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `owner_of_business`
--

INSERT INTO `owner_of_business` (`owner_id`, `owner_name`, `business_name`, `email`, `mobile`, `password`, `created_at`) VALUES
(1, 'Salman Mohammed', 'Velvet Veil', 'salman@gmail.com', '17445445', '202cb962ac59075b964b07152d234b70', '2025-04-15 06:10:00'),
(2, 'Khalid Ali', 'Abaya Aura', 'khalid@gmail.com', '33112112', '202cb962ac59075b964b07152d234b70', '2025-04-15 06:10:00'),
(3, 'Somaya Abdulla', 'Noor Threads', 'somaya@gmail.com', '33111222', '202cb962ac59075b964b07152d234b70', '2025-04-15 06:10:00'),
(4, 'Reem', 'Modest Muse', 'reem@gmail.com', '36707607', 'eeb69a3cb92300456b6a5f4162093851', '2025-04-15 06:10:00'),
(5, 'Mohamed Husain', 'Chic Abaya Co.', 'mohamed@gmail.com', '33202020', 'ae6b546897d9e87b16ee91252578a1c7', '2025-04-15 06:10:00'),
(6, 'Roni', 'Desert Elegance', 'roni@gmail.com', '17242455', '7dac728fd8db90656d9e50f396060554', '2025-04-15 06:10:00');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `title` varchar(50) NOT NULL,
  `price` decimal(10,3) NOT NULL,
  `img` varchar(50) NOT NULL,
  `fk_category_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `fk_owner_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `title`, `price`, `img`, `fk_category_id`, `created_at`, `fk_owner_id`) VALUES
(1, 'Chiffon Abaya', 45.000, '001.jpg', 1, '2025-04-15 06:10:00', 1),
(2, 'Chiffon Abaya', 50.000, '002.jpg', 1, '2025-04-15 06:10:00', 1),
(3, 'Chiffon Abaya', 48.000, '003.jpg', 1, '2025-04-15 06:10:00', 1),
(4, 'Chiffon Abaya', 40.000, '004.jpg', 1, '2025-04-15 06:10:00', 1),
(5, 'Chiffon Abaya', 45.000, '005.jpg', 1, '2025-04-15 06:10:00', 2),
(6, 'Chiffon Abaya', 50.000, '006.jpg', 1, '2025-04-15 06:10:00', 2),
(7, 'Chiffon Abaya', 55.000, '007.jpg', 1, '2025-04-15 06:10:00', 3),
(8, 'Chiffon Abaya', 40.000, '008.jpg', 1, '2025-04-15 06:10:00', 3),
(9, 'Embroidered Abaya', 40.000, '009.jpg', 2, '2025-04-15 06:10:00', 2),
(10, 'Embroidered Abaya', 40.000, '010.jpg', 2, '2025-04-15 06:10:00', 2),
(11, 'Embroidered Abaya', 50.000, '011.jpg', 2, '2025-04-15 06:10:00', 2),
(12, 'Embroidered Abaya', 50.000, '012.jpg', 2, '2025-04-15 06:10:00', 2),
(13, 'Embroidered Abaya', 35.000, '0013.jpg', 2, '2025-04-15 06:10:00', 1),
(14, 'Embroidered Abaya', 35.000, '014.jpg', 2, '2025-04-15 06:10:00', 1),
(15, 'Embroidered Abaya', 25.000, '015.jpg', 2, '2025-04-15 06:10:00', 3),
(16, 'Embroidered Abaya', 25.000, '016.jpg', 2, '2025-04-15 06:10:00', 3),
(17, 'Winter Collection', 40.000, '017.jpg', 3, '2025-04-15 06:10:00', 3),
(18, 'Winter Collection', 40.000, '018.jpg', 3, '2025-04-15 06:10:00', 3),
(19, 'Winter Collection', 40.000, '019.jpg', 3, '2025-04-15 06:10:00', 2),
(20, 'Winter Collection', 40.000, '020.jpg', 3, '2025-04-15 06:10:00', 2),
(21, 'Winter Collection', 35.000, '021.jpg', 3, '2025-04-15 06:10:00', 3),
(22, 'Winter Collection', 35.000, '022.jpg', 3, '2025-04-15 06:10:00', 1),
(23, 'Winter Collection', 35.000, '023.jpg', 3, '2025-04-15 06:10:00', 2),
(24, 'Winter Collection', 35.000, '024.jpg', 3, '2025-04-15 06:10:00', 2);

-- --------------------------------------------------------

--
-- Table structure for table `tailors`
--

CREATE TABLE `tailors` (
  `tailor_id` int(11) NOT NULL,
  `tailor_name` varchar(100) NOT NULL,
  `tailor_email` varchar(100) NOT NULL,
  `tailor_password` varchar(255) NOT NULL,
  `tailor_mobile` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tailors`
--

INSERT INTO `tailors` (`tailor_id`, `tailor_name`, `tailor_email`, `tailor_password`, `tailor_mobile`, `created_at`) VALUES
(1, 'Babo Komar', 'babo@gmail.com', '8d1ed40249b8fc83d1305f7f2e20cd62', '36554482', '2025-05-02 11:22:28'),
(2, 'Komar', 'komar@gmail.com', '57408120d5978f35d8cdbec8faae58fa', '33202113', '2025-05-02 21:22:27');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `mobile` varchar(50) NOT NULL,
  `user_type` enum('0','1') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `mobile`, `user_type`, `created_at`) VALUES
(1, 'Dalal', 'dalal@gmail.com', 'e10adc3949ba59abbe56e057f20f883e', '36111222', '0', '2025-04-15 06:10:00'),
(2, 'Fatima', 'fatema@gmail.com', 'f75737387e88d6ba5d789814bc2fbdc4', '33084044', '1', '2025-04-15 06:10:00'),
(3, 'Mariam', 'mariam@gmail.com', 'a6f828642154a4211b3115288fd3f741', '33003300', '0', '2025-04-15 06:10:00'),
(4, 'Abdulla', 'abdulla@gmail.com', 'e10adc3949ba59abbe56e057f20f883e', '36111000', '0', '2025-04-15 06:10:00'),
(5, 'Khalid', 'khalid@gmail.com', '3f3d59bd974d14fed1b7de9de7c70286', '36221122', '0', '2025-04-15 06:10:00'),
(6, 'Abdulla', 'abdulla.hussain@gmail.com', '762a354ae630141edefdac2088a27bca', '36707607', '0', '2025-04-25 13:47:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_id` (`productid`),
  ADD KEY `fk_user_id` (`user`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `custom_abaya`
--
ALTER TABLE `custom_abaya`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tailor_id` (`fk_tailor`),
  ADD KEY `fk_customer` (`fk_customer_id`);

--
-- Indexes for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`oid`),
  ADD KEY `product_id` (`productid`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user`);

--
-- Indexes for table `owner_of_business`
--
ALTER TABLE `owner_of_business`
  ADD PRIMARY KEY (`owner_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_owner_id` (`fk_category_id`),
  ADD KEY `owner_id` (`fk_owner_id`);

--
-- Indexes for table `tailors`
--
ALTER TABLE `tailors`
  ADD PRIMARY KEY (`tailor_id`),
  ADD UNIQUE KEY `tailor_email` (`tailor_email`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `custom_abaya`
--
ALTER TABLE `custom_abaya`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `orderitems`
--
ALTER TABLE `orderitems`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `owner_of_business`
--
ALTER TABLE `owner_of_business`
  MODIFY `owner_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `tailors`
--
ALTER TABLE `tailors`
  MODIFY `tailor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `fk_product_id` FOREIGN KEY (`productid`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `custom_abaya`
--
ALTER TABLE `custom_abaya`
  ADD CONSTRAINT `fk_customer` FOREIGN KEY (`fk_customer_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tailor_id` FOREIGN KEY (`fk_tailor`) REFERENCES `tailors` (`tailor_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD CONSTRAINT `order_id` FOREIGN KEY (`oid`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_id` FOREIGN KEY (`productid`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `user_id` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_owner_id` FOREIGN KEY (`fk_category_id`) REFERENCES `category` (`category_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `owner_id` FOREIGN KEY (`fk_owner_id`) REFERENCES `owner_of_business` (`owner_id`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
