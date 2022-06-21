<?php
session_start();
$id = $_POST["login"];
$pass = $_POST["password"];
$userPermLvl = [];

require 'rcon/settings.php'; 

if(isset($userList[$id]) && $userList[$id] == md5($pass)){
    $_SESSION['isLogin'] = true;
    $_SESSION['levelAuthorize'] = $userPermLvl[$id];
    //include 'index.php';
    //die();
    header("Location: /");
}
else{
    $_SESSION['isLogin'] = false;
    $_GET['log'] = 'denied';
    //include 'index.php';
    //die();
    header("Location: /?log=denied");
}