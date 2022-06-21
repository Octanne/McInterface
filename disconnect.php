<?php
session_start();
if(isset($_SESSION['isLogin']) && $_SESSION['isLogin']){
    $_SESSION = [];
    setcookie(session_name(), '', time() - 42000,'/');
    session_destroy();
    header("Location: /?log=disconnect");
}
else {
    header("Location: /");
}