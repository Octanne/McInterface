<?php
session_start();
header('Content-type: application/json');

$serverName = $_POST["srv"];
$action = $_POST["odr"];
if(isset($_POST["cmd"])){
	$command = $_POST["cmd"];
}
$response = array();

$sshPassword = "";
$sshUser = "";
$sshAddress = "";
$directoryPath = "";
include_once "settings.php";
include_once 'MinecraftPing.php';
$port = 0;
$host = "";
$serverLevelAuthorize = 0;
include_once "server/$serverName.php";

if(!($_SESSION["isLogin"] == false && $_SESSION['levelAuthorize'] >= $serverLevelAuthorize)){
	ini_set('display_errors', 1);
	$hostPing = $host;
	$portPing = $port;
	$pingServ = new MinecraftPing($host, $port);	
	$statutServ = $pingServ->getStatut();
	$connectionSSH = ssh2_connect($sshAddress, 22);

	if (!$connectionSSH) {
		$response['status'] = "connexionError";
	}else{
		if (!ssh2_auth_password($connectionSSH, $sshUser, $sshPassword)) {
			$response['status'] = "authError";
		}else {
			$stream = ssh2_shell ($connectionSSH, 'xterm', null, 200, 200, SSH2_TERM_UNIT_CHARS);
			// Hook into the error stream
			$errorStream = ssh2_fetch_stream($stream, SSH2_STREAM_STDERR);  
			// Block the streams so we wait until they complete
			stream_set_blocking ($stream, true);
			stream_set_blocking($errorStream, true);
		
			//A Revoir LE REBOOT
			if($action == "reboot"){
				fwrite ($stream, "cd $directoryPath/$serverName && ./boot.sh irestart" . PHP_EOL );
				sleep(2);
                while(!$pingServ->getStatut()){
					sleep(1);
				}
				fwrite ($stream, "exit" . PHP_EOL );
				$response['status'] = "success";
				$response['message'] = "Redémarrage du serveur $serverName terminé !";
			}else if($action == "boot"){
				fwrite ($stream, "cd $directoryPath/$serverName && ./boot.sh start" . PHP_EOL );
				sleep(1);
				fwrite ($stream, "exit" . PHP_EOL );
				while(!$pingServ->getStatut()){
				}
				$response['status'] = "success";
				$response['message'] = "Démarrage du serveur $serverName terminé !";
			}else if($action == "stop"){
				fwrite ($stream, "cd $directoryPath/$serverName && ./boot.sh stop" . PHP_EOL );
				sleep(1);
				fwrite ($stream, "exit" . PHP_EOL );
				$response['status'] = "success";
				$response['message'] = "Le serveur $serverName s'est correctement arrété !";
			}else if($action == "command"){
				if (!$statutServ) {
					$response['status'] = "offlineError";
				}else{
					$serverName = strtolower ($serverName);
					$commandBegin = "screen -S $serverName -X stuff \"";
					$commandFinal = $commandBegin . $command . '\r"';
					ssh2_exec($connectionSSH, "$commandFinal");
					fwrite ($stream, "exit" . PHP_EOL );
					$response['status'] = "success";
					$response['message'] = "La commande '$command' a été exécutée...";	
				}
			}
			else{
				$response['status'] = "commandError";
			}	
		}
	}
}else{
	header('Location: /index.php?log=restricted');
}
echo json_encode($response);
?>