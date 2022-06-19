<?php
session_start();
$directoryPath = "";
$sshAddress = "";
$sshUser = "";
$sshPassword = "";
$serverList = [];
require "settings.php";

$html = "";

if (isset($_GET['server']) && in_array($_GET['server'],$serverList)) {
    $serverLevelAuthorize = 0;
    $name = $_GET['server'];
    require 'server/' . $name . '.php';
    if(!isset($_SESSION['isLogin']) || (!$_SESSION['isLogin'] && $_SESSION['levelAuthorize'] < $serverLevelAuthorize)) {
        $html .= <<<HTML
        <li style="list-style-type: none;">Authentifiez-vous pour accéder à cette page.</li>
        HTML;
    } else {
        $connectionSSH = ssh2_connect($sshAddress, 22);
        if($connectionSSH) {
            if(ssh2_auth_password($connectionSSH, $sshUser, $sshPassword)) {
                $sftp = ssh2_sftp($connectionSSH);
                $stream = fopen('ssh2.sftp://' . intval($sftp) . "$directoryPath/$name/logs/latest.log", 'r');
                if($stream) {
                    // Output one line until end-of-file
                    while(!feof($stream)) {
                        $line = fgets($stream);
                        $html .= <<<HTML
                        <li style="list-style-type: none;">$line</li>
                        HTML;
                    }
                    fclose($stream);
                } else {
                    $html .= <<<HTML
                    <li style="list-style-type: none;">Les logs sont inaccessible. ($stream flux invalid)</li>
                    HTML;
                }
            } else {
                $html .= <<<HTML
                <li style="list-style-type: none;">Authentification au serveur invalide. (check password & username)</li>
                HTML;
            }
        } else {
            $html .= <<<HTML
            <li style="list-style-type: none;">Connexion au serveur impossible. (check PORT & IP address)</li>
            HTML;
        }
    }
} else {
    $html .= <<<HTML
    <li style="list-style-type: none;">Préciser un serveur valide !</li>
    HTML;
}

echo $html;