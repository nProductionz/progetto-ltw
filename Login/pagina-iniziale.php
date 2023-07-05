<!DOCTYPE html>
<html>

<head>

    <title>gioco_2d</title>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="iniziale-style.css">



</head>

<body>
   
    <?php

    $errors = [];
    $values = [];

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      
        $password2=filter_input(INPUT_POST,"cpassword");
        $username=filter_input(INPUT_POST,"username");
        $password=filter_input(INPUT_POST,"password");
            //Validates password & confirm passwords.
            if(($password != $password2))  $errors[]='different';
            
            $values['username1'] = $username;
            $values['password1']= $password;
          
       
        if (empty($errors)) {
            $conn= pg_connect("host=localhost port=5432 dbname=gioco-2d user=andrea password=admin") or die('could not connect:' . pg_last_error());
            $query="INSERT INTO account (username, parolachiave) VALUES('$username','$password')";
            $result= pg_query($query);
            
            if ($result==false)
            $errors[]='already-used';
                
            
            pg_free_result($result);
            pg_close($conn);

        }
    }
        ?>


    <div class="hero">
            
            <div class="form-box">
                <div class="line">
                    <div class="button-box">
                        <div id="btn"></div>
                        <button type="button" class="toggle-btn" onclick="login()">Log In </button>
                        <!--
    --> <button type="button" class="toggle-btn" onclick="register()">Register</button>
                    </div>


                    <form id="login" method="POST" action="login.php"
                        class="input-group">

                        <input type="text" id="username" name="username" class="input-field" size="16" maxlength="16"
                            placeholder="User Id">
                    
                        <input type="password" id="password" name="password" class="input-field" size="24" minlength="6"
                            maxlenght="24" placeholder="Enter Password" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" required>


                        <input type="checkbox" class="check-box" value="password"> <span> Remember Password</span>


                        <button id="sub" type="submit" class="submit-btn" onclick="login()"> Log In </button>
                    </form>





                    <form id="register" method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>"
                     class="input-group">

                        <input class="input-field" type="text" id="username" name="username" class="input-field" size="16"
                            maxlength="16" placeholder="User Id"
                            value="<?php echo htmlspecialchars($values['username1']);?>" required>

                        <?php if (in_array('already-used', $errors)): ?>
                        <span class="error" id="user-error">Username already exists</span>
                        <?php endif; ?>


                        <input class="input-field" id="psw" type="password" name="password" size="24" minlength="6"
                            maxlength="24" placeholder="Password: at least 6 or more characters"
                            value="<?php echo htmlspecialchars($values['password1']);?>" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" required>

                            <div class="aller-container" id="allerone">
                            <div class="icon">
                            <img id="img" onmouseover="info()" onmouseout="outinfo()" border="0" src="https://icon-library.com/images/information-icon-white/information-icon-white-6.jpg">
                            </div>
                            </div>
                            

                        <?php if (in_array('different', $errors)): ?>
                        <span class="error" id="match-error">Your passwords don't match</span>
                        <?php endif; ?>

                        <input class="input-field" id="cpsw" type="password" name="cpassword" size="24" maxlength="24"
                            minlength="6" placeholder="Confirm Password" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" required>

                        <button type="submit" class="submit-btn" onclick="register()" id="reg-button"> Sign In </button>

                    </form>
                </div>
            </div>
    </div>
    
    <script>
        var log = document.getElementById("login");
        var reg = document.getElementById("register");
        var btn = document.getElementById("btn");

        function register() {
            log.style.left = "-450px";
            reg.style.left = "100px";
            btn.style.left = "110px";
        }

        function login() {
            log.style.left = "100px";
            reg.style.left = "540px";
            btn.style.left = "0";
        }
        function info(){

           
            var elem = document.createElement('div');
            elem.innerHTML= "<div class='allert' id='allert'> Must contain at least one number and one uppercase and lowercase letter </div>"
            document.getElementById("allerone").append(elem)
        }
        function outinfo(){
            document.getElementById("allert").remove()

        }

       
    </script>

</body>

</html>