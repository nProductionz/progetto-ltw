<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $punteggio=json_encode($_POST['punteggio']);
    $utente=(string)json_encode($_POST['utente']);
   
   
    $utente=substr($utente,1,strlen($utente)-2);
    $punteggio= (int) substr($punteggio,1,strlen($punteggio)-2);
   
   
    $utente=$_SESSION[$utente];
    
  
    $data= date('ymd');
    $ora=date('H:i:s');

    $conn= pg_connect("host=localhost port=5432 dbname=gioco-2d user=andrea password=admin") or die('could not connect:' . pg_last_error());
    $query="INSERT INTO partita (punteggio,datazione,ora,giocatore) VALUES('$punteggio','$data','$ora','$utente')";
    $result= pg_query($query);

    if ($result==false){ 
    echo pg_last_error($conn);
}

    pg_free_result($result);
    pg_close($conn);
  
}


?>