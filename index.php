<?php
session_start();


if (isset($_SESSION['isLogin']) && $_SESSION['isLogin']) {
    require_once 'rcon/MinecraftPing.php';
    $serverList = [];
    require_once 'rcon/settings.php';

    $menuActionBar = <<<HTML
        <h3 class="panel-title">
            <span class="glyphicon glyphicon-tasks"></span> Liste des serveurs
        </h3>
        <div class="btn-group btn-group-xs">
            <a style="size: 12px; padding-top: 0.3em;" class="btn btn-default" href="disconnect.php">
                <span class="glyphicon glyphicon-user"></span>
                <span class="hidden-xs"> Déconnexion</span>
            </a>
        </div>
    HTML;

    $generateServCards = "";
    foreach ($serverList as $name) {
        $port = 0;
        $host = "";
        $serverLevelAuthorize = 0;
        require "rcon/server/$name.php";

        if ($_SESSION['levelAuthorize'] >= $serverLevelAuthorize) {
            $pingServ = new MinecraftPing($host, $port);
            ini_set('display_errors', 0);
            $statusServ = $pingServ->getStatut();
            if ($statusServ) {
                $servButtons = <<<HTML
                <ul class="list-unstyled mt-3 mb-4">
                    <li> </li>
                </ul>                  
                <button type="button" onclick="btnConsole('$name')" class="btn btn-lg btn-block btn-primary" id="btn$name">Console</button>
                <ul class="list-unstyled mt-3 mb-4">
                    <li> </li>
                </ul>
                <button type="button" onclick="btnReboot('$name')" name="$name" class="btn btn-lg btn-block btn-success" id="btnReboot$name">Redémarer</button>
                <button type="button" onclick="btnStop('$name')" class="btn btn-lg btn-block btn-danger" id="btnStop$name">Arrêter</button>
                HTML;
            } else {
                $servButtons = <<<HTML
                <ul class="list-unstyled mt-3 mb-4">
                    <li> </li>
                </ul> 
                <button type="button" onclick="btnConsole('$name')" class="btn btn-lg btn-block btn-primary" id="btn$name">Console</button>
                <ul class="list-unstyled mt-3 mb-4">
                    <li> </li>
                </ul>         
                <button type="button" onclick="btnBoot('$name')" class="btn btn-lg btn-block btn-success" id="btnBoot$name">Démarrer</button>
                HTML;
            }

            $cardModel = <<<HTML
            <div class="col-xl-3 col-lg-4 col-md-12 mb-3">
                <div class="card box-shadow text-center" style="height: 24em;">
                    <div class="card-header">
                        <h4 class="my-0 font-weight-normal">$name</h4>
                    </div>
                    <div class="card-body d-flex flex-column justify-content-center">
                        <div id="controlServ$name">  
                            <h1 class="card-title pricing-card-title">Actions</h1>
                            $servButtons               
                        </div>
                    </div>
                </div>
            </div>
            HTML;

            $generateServCards .= <<<HTML
            $cardModel
            HTML;
        }
    }

    $bodyContents = <<<HTML
    <div class="panel-body row justify-content-start flex-fill">
        $generateServCards
    </div>
    HTML;
} else {
    $menuActionBar = <<<HTML
        <h3 class="panel-title pull-left">
            <span class="glyphicon glyphicon-console"></span> Connectez-vous pour accéder au serveur...
        </h3>
        <div class="btn-group btn-group-xs pull-right">
            
        </div>
    HTML;

    if (isset($_GET["log"])) {
        if ($_GET["log"] == 'denied') {
            $logAlert = <<<HTML
                <div class="alert alert-warning p-2 m-0 mb-1 text-center h4" style="line-height: 1em;"><strong>Identifiant incorrect !</strong></div>
            HTML;
        } else if ($_GET["log"] == 'restricted') {
            $logAlert = <<<HTML
                <div class="alert alert-danger p-2 m-0 mb-1 text-center h4" style="line-height: 1em;"><strong>Accès non autorisé !</strong></div>
            HTML;
        } else if ($_GET["log"] == 'disconnect') {
            $logAlert = <<<HTML
                <div class="alert alert-info p-2 m-0 mb-1 text-center h4" style="line-height: 1em;"><strong>Déconnexion effectuée !</strong></div>
            HTML;
        } else {
            $logAlert = <<<HTML
                <div class="alert alert-secondary p-2 m-0 mb-1 text-center h4" style="line-height: 1em;"><strong>Saisisser vos identifiants</strong></div>
            HTML;
        }
    } else {
        $logAlert = <<<HTML
                <div class="alert alert-secondary p-2 m-0 mb-1 text-center h4" style="line-height: 1em;"><strong>Saisisser vos identifiants</strong></div>
            HTML;
    }

    $bodyContents = <<<HTML
    <div class="panel-body row justify-content-center align-items-center flex-fill">
       <div class="col-xl-3 col-lg-4 col-md-12">
            <div class="card mb-3 box-shadow">
                <div class="card-header text-center">
                   <h3 class="my-0 font-weight-normal">Connexion</h3>
                </div>
                <div id="loginCard" class="card-body">
                    $logAlert
                    <form name="login" method="post" action="login.php" class="form-group-lg mx-3">
                        <div class="row py-1">
                            <!--<label class="col-4 col-form-label border">Identifiant</label>-->
                            <input class="col card box-shadow form-control" type="text" placeholder="Identifiant" name="login" required/>
                        </div>
                        <div class="row py-1">
                            <!--<label class="col-4 col-form-label">Mot de passe</label>-->
                            <input class="col card box-shadow form-control" type="password" placeholder="Mode de passe..." name="password" required/>
                        </div>
                        <div class="row pt-4">
                            <input value="Connexion" type="submit" class="col btn btn-lg btn-secondary" id="loginButton">
                        </div>
                    </form>
                </div>
            </div>
        </div>                        
    </div>
    HTML;
}

$html = <<<HTML
<!DOCTYPE HTML>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <title>Gestionnaire des serveurs</title>
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
        <div class="container-fluid d-flex flex-column" id="content">
            <div class="alert alert-info d-flex justify-content-center align-items-center" id="alertMessage">
                <strong>Gestionnaire des serveurs (ObeProd)</strong>
            </div>
            <div id="consoleRow" class="flex-fill d-flex flex-column">
                <div class="panel panel-default flex-fill d-flex flex-column" id="consoleContent">
                    <div class="panel-heading d-flex justify-content-between">
                        $menuActionBar
                    </div>
                    $bodyContents
                </div>
            </div>
        </div>
    </body>
</html>
HTML;

echo $html;


