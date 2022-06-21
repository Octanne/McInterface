<?php
session_start();
header('Content-type: application/json');

$sshPassword = "";
$sshUser = "";
$sshAddress = "";
$directoryPath = "";
include_once "settings.php";

$response = [];

if (isset($_GET['srv'])) {
    $serverName = $_GET["srv"];

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
            $response['message'] = "Connexion SSH impossible !";
        }else{
            if (!ssh2_auth_password($connectionSSH, $sshUser, $sshPassword)) {
                $response['status'] = "authError";
                $response['message'] = "Authentification SSH impossible !";
            } else {
                $sftp = ssh2_sftp($connectionSSH);
                $server_path ='ssh2.sftp://' . intval($sftp) . "$directoryPath/$serverName";

                $stream = null;
                if ($pingServ->getStatut()) {
                    $fileName = $server_path . "/logs/screen.log";
                    if(file_exists($fileName)){
                        try {
                            $stream = fopen($fileName, 'r');
                        }
                        catch(Exception $e) {
                            $stream = null;
                        }
                    }
                }
                if($stream == null) {
                    $fileName = $server_path . "/logs/latest.log";
                    if (file_exists($fileName)) {
                        try {
                            $stream = fopen($fileName, 'r');
                        }
                        catch(Exception $e) {
                            $stream = null;
                        }
                    }
                }
                
                if($stream) {
                    // Output one line until end-of-file
                    $consoleLines = [];
                    $lineNb = 0;
                    $lineToStart = 0;
                    if (isset($_GET['line']) && is_numeric($_GET['line'])) $lineToStart = (int)$_GET['line'];
                    while (!feof($stream)) {
                        $line = fgets($stream);
                        if ($lineNb >= $lineToStart) {
                            if ($line == "> \n" || $line == "> ") continue;
                            $line = preg_replace("/\s*$/",'',$line);
                            if($line != ""){
                                $consoleLines[] = $line;
                            }
                        }
                        $lineNb++;
                    }
                    fclose($stream);
                    if (count($consoleLines) > 0 && $consoleLines[count($consoleLines) - 1] == '') 
                    {
                        array_pop($consoleLines);
                        $lineNb--;
                    }

                    $response['status'] = "success";
                    $response['beginIndex'] = $lineToStart;
                    $response['endIndex'] = $lineNb - 1;
                    $response['servStatus'] = $pingServ->getStatut() ? "Online" : "Offline";
                    $response['consoleLines'] = $consoleLines;
                } else {
                    $response['status'] = "error";
                    $response['message'] = "Le fichier latest.log n'est pas disponible !";
                }
            }
        }
    } else {
        $response['status'] = "error";
        $response['message'] = "Authentifiez-vous pour accéder à cette page !";
    }
} else {
    $response['status'] = "error";
    $response['message'] = "Préciser un serveur !";
}

echo json_encode($response);