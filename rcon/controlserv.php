<?php
session_start();

if (isset($_GET['server']) && isset($_GET['mode'])) {
    $name = $_GET['server'];
    $mode = $_GET['mode'];
    $host = "";
    $port = 0;
    require 'MinecraftPing.php';
    require "server/$name.php";

    $pingServ = new MinecraftPing($host, $port);
    $statutServ = $pingServ->getStatut();

    if ($mode == 'console') {
        if ($statutServ) {
            $html = <<<HTML
            <a style="size: 12px; padding-top: 0.25em;" class="btn btn-default" title="Redémarrer" id="btnReboot" onclick="btnReboot('$name');">
                <span class="glyphicon glyphicon-repeat"></span>
            </a>
            <a style="size: 12px; padding-top: 0.25em;" class="btn btn-default" title="Arrêter" id="btnStop" onclick="btnStop('$name');">
                <span class="glyphicon glyphicon-stop"></span>
            </a>

            <a style="size: 12px; padding-top: 0.25em;" class="btn btn-default" title="Home" href="index.php">
                <span class="glyphicon glyphicon-home"></span>
            </a>
            <a style="size: 12px; padding-top: 0.25em; margin-left: 1em;" class="btn btn-default" title="Déconnexion" href="disconnect.php">
                <span class="glyphicon glyphicon-user"></span>
                <span class="hidden-xs"> Déconnexion</span>
            </a>
            HTML;
        } else {
            $html = <<<HTML
            <a style="size: 12px; padding-top: 0.25em;" class="btn btn-default" title="Démarrer" id="btnBoot" onclick="btnBoot('$name');">
                <span class="glyphicon glyphicon-play"></span>
            </a>

            <a style="size: 12px; padding-top: 0.25em;" class="btn btn-default" title="Home" href="index.php">
                <span class="glyphicon glyphicon-home"></span>
            </a>
            <a style="size: 12px; padding-top: 0.25em; margin-left: 1em;" class="btn btn-default" title="Déconnexion" href="disconnect.php">
                <span class="glyphicon glyphicon-user"></span>
                <span class="hidden-xs"> Déconnexion</span>
            </a>
            HTML;
        }
        echo $html;
    } else if ($mode == 'home') {
        if ($statutServ) {
            $actionArea = <<<HTML
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
            $actionArea = <<<HTML
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

        $html = <<<HTML
        <h1 class="card-title pricing-card-title">Actions</h1>
        $actionArea
        HTML;

        echo $html;
    }
} else echo "Préciser server et mode";



