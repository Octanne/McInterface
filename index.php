<?php
session_start();
if(isset($_SESSION['isLogin']) && $_SESSION['isLogin'] == true){
  require 'rcon/MinecraftPing.php';
  require 'rcon/settings.php'; 
}
?>
<!DOCTYPE HTML>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <title>Gestionnaire RCON</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" integrity="sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="static/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="static/css/pricing.css">
    <link rel="stylesheet" type="text/css" href="static/css/style.css">
    <script type="text/javascript" src="static/js/jquery-1.12.0.min.js"></script>
    <script type="text/javascript" src="static/js/jquery-migrate-1.2.1.min.js"></script>
    <script type="text/javascript" src="static/js/jquery-ui-1.12.0.min.js"></script>
    <script type="text/javascript" src="static/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="static/js/script.js"></script>
    
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="shortcut icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+5pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjY1RTYzOTA2ODZDRjExREJBNkUyRDg4N0NFQUNCNDA3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI0N0JDRjhEMDY5MTExRTI5OUZEQTZGODg4RDc1ODdCIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI0N0JDRjhDMDY5MTExRTI5OUZEQTZGODg4RDc1ODdCIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowMTgwMTE3NDA3MjA2ODExODA4M0ZFMkJBM0M1RUU2NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowNjgwMTE3NDA3MjA2ODExODA4M0U3NkRBMDNEMDVDMSIvPiA8ZGM6dGl0bGU+IDxyZGY6QWx0PiA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPmdseXBoaWNvbnM8L3JkZjpsaT4gPC9yZGY6QWx0PiA8L2RjOnRpdGxlPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgFdWUIAAAExSURBVHjaxFUBEcIwDFxRMAmVMAnBQSVMAhImAQlIQAJzUBzgAByU9C7jspCsZdc7cvfHyNbPLcn/upRSVwOMiEiEW+05R4c3wznX48+T5/Cc6yrioJBNCBBpUJ4D+R8xflUQbbiwNuRrjzghHiy/IOcy4YC4svy44mTkk0KyF2Hh5S26de0i1rRoLya1RVTANyjQc065RcF45TvimFeT1vNIOS3C1xblqnRD25ZoCK8X4vs8T1z9orFYeGXYUHconI2OLswoKRbFlX5S8i9BFlK0irlAAhu3Q4F/5v0Ea8hy9diQrefB0sFoDWuRPxGPBvnKJrQCQ2uhyQLXBgXOlptCQzcdNKvwDd3UW27KhzyxgW5aQm5L8YMj5O8rLAGUBQn//+gbfvQS9jzXDuMtwAATXCNvATubRQAAAABJRU5ErkJggg==" />
</head>
<body>
  <div class="container-fluid" id="content">
    <div style="text-align:center; font-size: 25px;" class="alert alert-info" id="alertMessage">
      <strong>Gestionnaire Minecraft (RCON)</strong>
    </div>
    <div style="margin-top: 15px;" id="consoleRow">
      <div class="panel panel-default" id="consoleContent">
        <div class="panel-heading">
          <h3 class="panel-title pull-left"><span class="glyphicon glyphicon-console"></span> Les Serveurs</h3>
          <div class="btn-group btn-group-xs pull-right">
            <?php if(isset($_SESSION['isLogin']) && $_SESSION['isLogin'] == true){ ?>
            <a style="font-size: 12px; size: 12px;" class="btn btn-default" href="disconnect.php"><span class="glyphicon glyphicon-user"></span><span class="hidden-xs"> Déconnexion</span></a>
            <?php } ?>
          </div>
        </div>
        <div class="panel-body" <?php if(!isset($_SESSION['isLogin']) || $_SESSION['isLogin'] == false){ ?> style="box-align: center;" <?php } ?>>
        <?php
        if(isset($_SESSION['isLogin']) && $_SESSION['isLogin'] == true){ ?>
          <div class="card-deck mb-4 text-center">
            <?php
            $servNumber = -1;
            foreach ($serverList as $name) {
              $servNumber+=1;
              if($servNumber % 4 == 0){ ?>
                </div>
                <div class="card-deck mb-4 text-center">
              <?php }
              require "rcon/server/$name.php";
              $hostPing = $host;
              $portPing = $port;
              
              $pingServ = new MinecraftPing($hostPing, $portPing);
              ini_set('display_errors', 0);
              $statutServ = $pingServ->getStatut();
              
              
              if($_SESSION['levelAuthorize'] >= $serverLevelAuthorize){ ?>
                <div class="card mb-3 box-shadow">
                <div class="card-header">
                   <h4 class="my-0 font-weight-normal"><?php echo $name ?></h4>
                </div>
                <div id="ControlServ<?php echo $name?>" class="card-body">
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
                 </div>
                </div>
              <?php }
              ini_set('display_errors', 1);
            }
            ?>
          </div>
        <?php } else{ ?>
          <div class="card box-shadow" style="text-align: center; height: auto; width: 15%; margin-top: 15px; margin-left: 40%; margin-right: 0%;">
            <div class="card-header">
              <h2 class="my-0 font-weight-normal">Connexion</h2>
            </div>
            <div class="card-body" style="text-align: left;">     
              <?php if(isset($_GET["log"]) && $_GET["log"] == 'denied'){ ?>
              <div class="alert alert-danger">Identifiant incorrect</div>
              <?php } ?>
              <?php if(isset($_GET["log"]) && $_GET["log"] == 'restricted'){ ?>
              <div class="alert alert-danger">Accès restreint</div>
              <?php } ?>
              <?php if(isset($_GET["log"]) && $_GET["log"] == 'deconnect'){ ?>
              <div class="alert alert-info">Déconnexion réussi</div>
              <?php } ?>
              <form action="login.php" method="post">
              <input style="width: 100%; height: 40px; padding-left: 5px;" class="card box-shadow" type="text" placeholder="Login" name="login"/>
              <input style="width: 100%; height: 40px; padding-left: 5px; margin-top: 6px;" class="card box-shadow" type="password" placeholder="Password" name="password"/>
              <input value="Connexion" type="submit" style="color: black; width: 100%; height: 40px; margin-top: 15px; padding: 2px;" class="btn btn-lg btn-block btn-primary" id="login">
              </form>
            </div>
          </div>
        <?php } ?>
        </div>
      </div>
      </div>
    </div>
  </div>
</body>
</html>
<?php
if(isset($_SESSION["action"]) && $_SESSION["action"] != ""){
  sleep(1);
  $_SESSION["action"] = "";
  ?>
  <script>
    $("#alertMessage").fadeOut("slow", function(){
        $("#alertMessage").attr("class", "alert alert-info");
        $("#alertMessage").html("<strong>Gestionnaire Minecraft (RCON)</strong>");
        $("#alertMessage").fadeIn("slow", function(){});
    });
  </script>
<?php } ?>