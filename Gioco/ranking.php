<?php
session_start();
// ----------------------------------------------------------------------------------------------------
// - Display Errors
// ----------------------------------------------------------------------------------------------------
ini_set('display_errors', 'On');
ini_set('html_errors', 0);

// ----------------------------------------------------------------------------------------------------
// - Error Reporting
// ----------------------------------------------------------------------------------------------------
error_reporting(-1);

// ----------------------------------------------------------------------------------------------------
// - Shutdown Handler
// ----------------------------------------------------------------------------------------------------
function ShutdownHandler()
{
    if(@is_array($error = @error_get_last()))
    {
        return(@call_user_func_array('ErrorHandler', $error));
    };

    return(TRUE);
};

register_shutdown_function('ShutdownHandler');

// ----------------------------------------------------------------------------------------------------
// - Error Handler
// ----------------------------------------------------------------------------------------------------
function ErrorHandler($type, $message, $file, $line)
{
    $_ERRORS = Array(
        0x0001 => 'E_ERROR',
        0x0002 => 'E_WARNING',
        0x0004 => 'E_PARSE',
        0x0008 => 'E_NOTICE',
        0x0010 => 'E_CORE_ERROR',
        0x0020 => 'E_CORE_WARNING',
        0x0040 => 'E_COMPILE_ERROR',
        0x0080 => 'E_COMPILE_WARNING',
        0x0100 => 'E_USER_ERROR',
        0x0200 => 'E_USER_WARNING',
        0x0400 => 'E_USER_NOTICE',
        0x0800 => 'E_STRICT',
        0x1000 => 'E_RECOVERABLE_ERROR',
        0x2000 => 'E_DEPRECATED',
        0x4000 => 'E_USER_DEPRECATED'
    );

    if(!@is_string($name = @array_search($type, @array_flip($_ERRORS))))
    {
        $name = 'E_UNKNOWN';
    };

    return(print(@sprintf("%s Error in file \xBB%s\xAB at line %d: %s\n", $name, @basename($file), $line, $message)));
};

$old_error_handler = set_error_handler("ErrorHandler");

// other php code


if ($_SERVER["REQUEST_METHOD"] == "GET") {

    $utente=$_GET['utente'];
    
    $utente=$_SESSION[$utente];
   

    $conn= pg_connect("host=localhost port=5432 dbname=gioco-2d user=andrea password=admin") or die('could not connect:' . pg_last_error());
    $query="select punteggio,datazione,ora,giocatore from partita where giocatore='$utente' ORDER BY punteggio DESC";
    $result= pg_query($query);
    
    
    $i=0; 
    $punteggio=[];
    $data=[];
    $ora=[];
   
  
    if (pg_num_rows ($result)==0){ 
        echo pg_last_error($conn);
     }
     
     else{
        while ($row = pg_fetch_row($result)) {
           //echo "punteggio: $row[0]  data: $row[1] ora:  $row[2] ";
           
           $punteggio[$i]=$row[0];
           $data[$i]=$row[1];
           $ora[$i]=$row[2];
           $i+=1;
            
          }
          

          echo json_encode(array('punteggio' => $punteggio, 'data'=> $data, 'ora' => $ora ));
         // echo $obj;
     }
    
     pg_free_result($result);
     pg_close($conn);


}

?>