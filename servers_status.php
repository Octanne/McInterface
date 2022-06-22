<?php
session_start();
header('Content-type: application/json');

$serverList = [];
include_once 'MinecraftPing.php';
include_once "settings.php";

$response = [];

if (isset($_SESSION["isLogin"]) && $_SESSION['isLogin']) {
    ini_set('display_errors', 0);

    $servStatusList = [];
    foreach ($serverList as $servName) {
        $port = 0;
        $host = "";
        $serverLevelAuthorize = 0;
        require "server/$servName.php";

        if ($_SESSION['levelAuthorize'] < $serverLevelAuthorize) continue;

        $pingServ = new MinecraftPing($host, $port);
        $servStatus = $pingServ->getStatut();
        $infos = $pingServ->Query();
        $servStatusObj = new class(){
            public $name;
            public $status;
            public $version;
            public $protocol;

            public $onlinePlayers;
            public $maxPlayers;
            public $players;

            public $descriptionText;
            public $descriptionExtra;
            public $favicon;

            //public $raw;
        };
        //$servStatusObj->raw = $infos;
        $servStatusObj->name = $servName;

        $servStatusObj->status = $servStatus ? 'Online': 'Offline';
        if ($servStatus) {
            $servStatusObj->version = $infos['version']['name'];
            $servStatusObj->protocol = $infos['version']['protocol'];

            $servStatusObj->onlinePlayers = $infos['players']['online'];
            $servStatusObj->maxPlayers = $infos['players']['max'];

            if ($servStatusObj->onlinePlayers > 0) {
                $servStatusObj->players = [];
                foreach ($infos['players']['sample'] as $player) {
                    $servStatusObj->players[] = $player;
                }
            }

            $servStatusObj->favicon = $infos['favicon'];

            $servStatusObj->descriptionText = $infos['description']['text'];
            $servStatusObj->descriptionExtra = $infos['description']['extra'];
        }

        $servStatusList[$servName] = $servStatusObj;
    }

    $response['status'] = "success";
    $response['serverList'] = $servStatusList;
} else {
    $response['status'] = "error";
    $response['message'] = "Authentifiez-vous pour accéder à cette page !";
}

echo json_encode($response);
