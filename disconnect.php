<?php
session_start();
if($_SESSION['isLogin'] == true){
    $_SESSION = array();
    setcookie(session_name(), '', time() - 42000,'/');
    session_destroy();
    header("Location: index.php?log=deconnect");
}
else {
    header("Location: index.php");
}
?>