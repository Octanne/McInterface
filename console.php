<?php
session_start();
$serverList = [];
require_once "rcon/settings.php";

if (!isset($_GET['server']) || (!in_array($_GET['server'],$serverList))) {
    header('Location: index.php?log=restricted');
} else {
    $name = $_GET["server"];
    $serverLevelAuthorize = 0;
    $port = 0;
    $host = "";
    require_once 'rcon/server/' . $name . '.php';

    if((isset($_SESSION['levelAuthorize']) && isset($_SESSION['isLogin']) && $_SESSION["isLogin"]
            && $_SESSION['levelAuthorize'] < $serverLevelAuthorize) ||
        !isset($_SESSION['isLogin'])){
        header('Location: index.php?log=restricted');
    } else {
        require 'rcon/MinecraftPing.php';
        $pingServ = new MinecraftPing($host, $port);
        $statutServ = $pingServ->getStatut();

        if ($statutServ) {
            $serverActionsButtons = <<<HTML
            <a style="size: 12px; padding-top: 0.25em;" class="btn btn-default" title="Redémarrer" id="btnReboot" onclick="btnReboot('$name');">
                <span class="glyphicon glyphicon-repeat"></span>
            </a>
            <a style="size: 12px; padding-top: 0.25em;" class="btn btn-default" title="Arrêter" id="btnStop" onclick="btnStop('$name');">
                <span class="glyphicon glyphicon-stop"></span>
            </a>
            HTML;
        } else {
            $serverActionsButtons = <<<HTML
            <a style="size: 12px; padding-top: 0.25em;" class="btn btn-default" title="Démarrer" id="btnBoot" onclick="btnBoot('$name');">
                <span class="glyphicon glyphicon-play"></span>
            </a>
            HTML;
        }

        $html = <<<HTML
        <!DOCTYPE HTML>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title>$name | Console</title>
                <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" integrity="sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB" crossorigin="anonymous">
                <link rel="stylesheet" type="text/css" href="static/css/bootstrap.min.css">
                <link rel="stylesheet" type="text/css" href="static/css/pricing.css">
                <link rel="stylesheet" type="text/css" href="static/css/style.css">
            
                <script type="text/javascript" src="static/js/jquery-1.12.0.min.js"></script>
                <script type="text/javascript" src="static/js/jquery-migrate-1.2.1.min.js"></script>
                <script type="text/javascript" src="static/js/jquery-ui-1.12.0.min.js"></script>
                <script type="text/javascript" src="static/js/bootstrap.min.js"></script>
                <script type="text/javascript" src="static/js/scriptconsole.js"></script>
            
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="shortcut icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+5pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjY1RTYzOTA2ODZDRjExREJBNkUyRDg4N0NFQUNCNDA3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI0N0JDRjhEMDY5MTExRTI5OUZEQTZGODg4RDc1ODdCIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI0N0JDRjhDMDY5MTExRTI5OUZEQTZGODg4RDc1ODdCIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowMTgwMTE3NDA3MjA2ODExODA4M0ZFMkJBM0M1RUU2NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowNjgwMTE3NDA3MjA2ODExODA4M0U3NkRBMDNEMDVDMSIvPiA8ZGM6dGl0bGU+IDxyZGY6QWx0PiA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPmdseXBoaWNvbnM8L3JkZjpsaT4gPC9yZGY6QWx0PiA8L2RjOnRpdGxlPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgFdWUIAAAExSURBVHjaxFUBEcIwDFxRMAmVMAnBQSVMAhImAQlIQAJzUBzgAByU9C7jspCsZdc7cvfHyNbPLcn/upRSVwOMiEiEW+05R4c3wznX48+T5/Cc6yrioJBNCBBpUJ4D+R8xflUQbbiwNuRrjzghHiy/IOcy4YC4svy44mTkk0KyF2Hh5S26de0i1rRoLya1RVTANyjQc065RcF45TvimFeT1vNIOS3C1xblqnRD25ZoCK8X4vs8T1z9orFYeGXYUHconI2OLswoKRbFlX5S8i9BFlK0irlAAhu3Q4F/5v0Ea8hy9diQrefB0sFoDWuRPxGPBvnKJrQCQ2uhyQLXBgXOlptCQzcdNKvwDd3UW27KhzyxgW5aQm5L8YMj5O8rLAGUBQn//+gbfvQS9jzXDuMtwAATXCNvATubRQAAAABJRU5ErkJggg==" />
            </head>
            <body>
                <div class="container-fluid" id="content">
                    <div style="font-size: 25px; line-height: 1em;" class="alert alert-info d-flex 
                        justify-content-center align-items-center" id="alertMessage">
                        <strong>Gestionnaire des serveurs (ObeProd)</strong>
                    </div>
                    <div id="consoleRow">
                        <div class="panel panel-default" id="consoleContent">
                            <div class="panel-heading">
                                <h3 class="panel-title pull-left">
                                    <span style="line-height: 1.17em;"  class="glyphicon glyphicon-console"></span> Console | $name
                                </h3>
                                <div class="btn-group btn-group-xs pull-right" id="controlServ">
                                    $serverActionsButtons
                                    <a style="size: 12px; padding-top: 0.25em;" class="btn btn-default" title="Home" href="index.php">
                                        <span class="glyphicon glyphicon-home"></span>
                                    </a>
                                    <a style="size: 12px; padding-top: 0.25em; margin-left: 1em;" class="btn btn-default" title="Déconnexion" href="disconnect.php">
                                        <span class="glyphicon glyphicon-user"></span>
                                        <span class="hidden-xs"> Déconnexion</span>
                                    </a>
                                </div>
                            </div>
                            <div class="panel-body" style="top: 44px;">
                                <div class="panel-log" id="panelLog" style="margin: 0%;">
                                    <ul class="list-group" id="groupLog" style="margin: 0%;"></ul>
                                </div>
                            </div>
                        </div>
                        <div class="input-group" id="consoleCommand">
                            <span class="input-group-addon">
                                <input id="chkAutoScroll" type="checkbox" checked="true" autocomplete="off" /><span class="glyphicon glyphicon-arrow-down"></span>
                            </span>
                            <div id="txtCommandResults"></div>
                            <input type="text" class="form-control" id="txtCommand" />
                            <div class="input-group-btn">
                              <button type="button" class="btn btn-primary" id="btnSend"><span class="glyphicon glyphicon-send"></span><span class="hidden-xs"> Envoyer</span></button>
                              <button type="button" class="btn btn-warning" id="btnClearLog"><span class="glyphicon glyphicon-erase"></span><span class="hidden-xs"> Effacer</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>
        HTML;
        echo $html;
    }
}