<?php
session_start();
$name= $_GET['server'];
if($_SESSION["isLogin"] == false && $_SESSION['levelAuthorize'] >= $serverLevelAuthorize){
	header('Location: /index.php?log=restricted');
}
require "settings.php";
$connectionSSH = ssh2_connect($sshAddress, 22);
if($connectionSSH){
	if(ssh2_auth_password($connectionSSH, $sshUser, $sshPassword)){
		$sftp = ssh2_sftp($connectionSSH);
		$stream = fopen('ssh2.sftp://' . intval($sftp) . "$directoryPath/$name/logs/latest.log", 'r');
		if($stream){
			// Output one line until end-of-file
			while(!feof($stream)) { ?>
				<li style="list-style-type: none;"><?php echo fgets($stream) ?></li>
			<?php }
			fclose($stream);
		}else{?>
			<li style="list-style-type: none;">Les logs sont inaccessible. ($stream flux invalid)</li><?php
		}
	}else{?>
		<li style="list-style-type: none;">Authentification au serveur invalide. (check password & username)</li><?php
	}
}else{?>
	<li style="list-style-type: none;">Connexion au serveur impossible. (check PORT & IP address)</li><?php
}
?>