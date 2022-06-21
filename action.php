<?php
session_start();
header('Content-type: application/json');

$sshPassword = "";
$sshUser = "";
$sshAddress = "";
$directoryPath = "";
include_once "settings.php";

$response = [];

if (isset($_POST['srv']) && isset($_POST['odr'])) {
    $serverName = $_POST["srv"];
    $action = $_POST["odr"];

    include_once 'MinecraftPing.php';
    $port = 0;
    $host = "";
    $serverLevelAuthorize = 0;
    include_once "server/$serverName.php";

    if (isset($_SESSION["isLogin"]) && $_SESSION['isLogin'] && $_SESSION['levelAuthorize'] >= $serverLevelAuthorize) {
        ini_set('display_errors', 1);

        $pingServ = new MinecraftPing($host, $port);
        $statusServ = $pingServ->getStatut();
        $connectionSSH = ssh2_connect($sshAddress, 22);

        if (!$connectionSSH) {
            $response['status'] = "connexionError";
        }else{
            if (!ssh2_auth_password($connectionSSH, $sshUser, $sshPassword)) {
                $response['status'] = "authError";
            } else {
                $stream = ssh2_shell ($connectionSSH, 'xterm', null, 200, 200, SSH2_TERM_UNIT_CHARS);
                // Hook into the error stream
                $errorStream = ssh2_fetch_stream($stream, SSH2_STREAM_STDERR);
                // Block the streams so we wait until they complete
                stream_set_blocking ($stream, true);
                stream_set_blocking($errorStream, true);

                if($action == "reboot"){
                    fwrite ($stream, "cd $directoryPath/$serverName && ./boot.sh irestart" . PHP_EOL );
                    sleep(2);
                    while(!$pingServ->getStatut()){
                        sleep(1);
                    }
                    fwrite ($stream, "exit" . PHP_EOL );
                    $response['status'] = "success";
                    $response['message'] = "Redémarrage du serveur $serverName terminé !";
                } else if($action == "boot"){
                    fwrite ($stream, "cd $directoryPath/$serverName && ./boot.sh start" . PHP_EOL );
                    sleep(1);
                    fwrite ($stream, "exit" . PHP_EOL );
                    while(!$pingServ->getStatut()){
                    }
                    $response['status'] = "success";
                    $response['message'] = "Démarrage du serveur $serverName terminé !";
                } else if($action == "stop"){
                    fwrite ($stream, "cd $directoryPath/$serverName && ./boot.sh stop" . PHP_EOL );
                    sleep(1);
                    fwrite ($stream, "exit" . PHP_EOL );
                    $response['status'] = "success";
                    $response['message'] = "Le serveur $serverName s'est correctement arrété !";
                } else if($action == "command"){
                    if (!$statusServ) {
                        $response['status'] = "offlineError";
                    }else{
                        if(isset($_POST["cmd"])){
                            $command = $_POST["cmd"];
                            $serverName = strtolower ($serverName);
                            $commandBegin = "screen -S $serverName -X stuff \"";
                            $commandFinal = $commandBegin . $command . '\r"';
                            ssh2_exec($connectionSSH, "$commandFinal");
                            fwrite ($stream, "exit" . PHP_EOL );
                            $response['status'] = "success";
                            $response['message'] = "La commande '$command' a été exécutée...";
                        } else {
                            $response['status'] = "error";
                            $response['message'] = "Préciser une commande !";
                        }
                    }
                } else{
                    $response['status'] = "commandError";
                }
            }
        }
    } else {
        $response['status'] = "error";
        $response['message'] = "Authentifiez-vous pour accéder à cette page !";
    }
} else {
    $response['status'] = "error";
    $response['message'] = "Préciser un serveur et un ordre !";
}

echo json_encode($response);