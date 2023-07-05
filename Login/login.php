<?php
session_start();

function generateRandomString($length = 10) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
    }

    

if ($_SERVER["REQUEST_METHOD"] == "POST") {

      $username=$_POST['username'];
      $password=$_POST['password'];
  
      $conn= pg_connect("host=localhost port=5432 dbname=gioco-2d user=andrea password=admin") or die('could not connect:' . pg_last_error());
      $query="select username, parolachiave from account where username='$username' AND parolachiave='$password'";
      $result= pg_query($query);
    
      if (pg_num_rows ($result)==0){ 
          $referer=$_SERVER['HTTP_REFERER'];
          header("Location:$referer"); 
       }

      else{ 
            $value= generateRandomString(30);
            if(!setcookie("Account", $value ,time()+(86400),"/")) echo "errore cookie";
            $_SESSION[$value]=$username;
           
            
            pg_free_result($result);
            pg_close($conn);
           header('Location:start_page.html');
          }
     
           
}

?>