<?php session_start();
$name = $_GET['server'];
require 'MinecraftPing.php';
require "server/$name.php";
$pingServ = new MinecraftPing($host, $port);
$statutServ = $pingServ->getStatut();
?>
<h1 class="card-title pricing-card-title">Accéder à</h1>
<?php
if($statutServ){ ?>
<ul class="list-unstyled mt-3 mb-4">
    <li> </li>
</ul>                  
<button type="button" onclick="btnConsole('<?php echo $name ?>')" class="btn btn-lg btn-block btn-primary" id="btn<?php echo $name ?>">Console</button>
<ul class="list-unstyled mt-3 mb-4">
    <li> </li>
</ul>
<button type="button" onclick="btnReboot('<?php echo $name ?>')" name="<?php echo $name ?>" class="btn btn-lg btn-block btn-success" id="btnReboot<?php echo $name ?>">Redémarer</button>
<button type="button" onclick="btnStop('<?php echo $name ?>')" class="btn btn-lg btn-block btn-danger" id="btnStop<?php echo $name ?>">Arrêter</button>
<?php } else{ ?>
<div style="padding-top: 9%;">
    <button type="button" onclick="btnConsole('<?php echo $name ?>')" class="btn btn-lg btn-block btn-primary" id="btn<?php echo $name ?>">Console</button>
    <ul class="list-unstyled mt-3 mb-4"><li> </li></ul>         
    <button type="button" onclick="btnBoot('<?php echo $name ?>')" class="btn btn-lg btn-block btn-success" id="btnBoot<?php echo $name ?>">Démarrer</button>                      
</div>
<?php } ?>