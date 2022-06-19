<?php
session_start();
$id = $_POST["login"];
$pass = $_POST["password"];
$userPermLvl = [];

require 'rcon/settings.php'; 

if(isset($userList[$id]) && $userList[$id] == md5($pass)){
    $_SESSION['isLogin'] = true;
    $_SESSION['levelAuthorize'] = $userPermLvl[$id];
    header("Location: index.php");
}
else{
    $_SESSION['isLogin'] = false;
    header("Location: index.php?log=denied");
}