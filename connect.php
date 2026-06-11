<?php
/*
  $dsn="mysql:host=localhost;dbname=luxuriance_touch_decor";
  $user = 'root';                   // The User To Connect
  $pass= '';                        // Password Of The User
  $option= array(
      PDO::MYSQL_ATTR_INIT_COMMAND =>'SET NAMES utf8',
  ); 
  try{
	  $con = new PDO($dsn,$user,$pass); // Start A New Connection With PDO Class  
      $con-> setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	   //echo 'You Are Connected';
  }catch(PDOException $error){
	  echo 'Connection failed' . $error->getMessage();
  }
*/
$host = "localhost";
$user = "root";
$pass = "";
$db_name = "ab_db";

	// Connect to database 
	$conn = mysqli_connect("$host", "$user", "$pass","$db_name");
    if ($conn)
    {
	//echo "connect with server";
	//echo "<br>";
    }
    else 
	{
	echo "Not connect with server";	
	echo "<br>";
	}
	

?>