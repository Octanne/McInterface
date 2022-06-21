function btnConsole(serverName){
    window.location="console.php?server="+serverName;
}
function btnBoot(serverName){
    document.getElementById("btn"+serverName).disabled = true;
    document.getElementById("btnBoot"+serverName).disabled = true;
    alertMsg("Démarage du serveur "+serverName+" en cours...", "info");
    sendOrder(serverName, "boot");
}
function btnReboot(serverName){
    document.getElementById("btn"+serverName).disabled = true;
    document.getElementById("btnReboot"+serverName).disabled = true;
    document.getElementById("btnStop"+serverName).disabled = true;
    alertMsg("Redémarage du serveur "+serverName+" en cours...", "info");
    sendOrder(serverName, "reboot");
}
function btnStop(serverName){
    document.getElementById("btn"+serverName).disabled = true;
    document.getElementById("btnReboot"+serverName).disabled = true;
    document.getElementById("btnStop"+serverName).disabled = true;
    alertMsg("Arrêt du serveur "+serverName+" en cours...", "info");
    sendOrder(serverName, "stop");
}

function alertMsg(msg, cls){
    $("#alertMessage").fadeOut("slow", function(){
        $("#alertMessage").attr("class", "d-flex justify-content-center align-items-center alert alert-"+cls);
        $("#alertMessage").html(msg);
        $("#alertMessage").fadeIn("slow", function(){});
    });
}

function tryLogin()  {
    console.log("Login...");
    $.post("login.php", {login: document.forms['login'].elements['login'].value, password: document.forms['login'].elements['password'].value})
        .done(function(htmlResponse){
            document.write(htmlResponse);
            console.log("Login !");
        });
    return false;
}

function sendOrder(server, order){
  $.post("rcon/action.php", { odr:order, srv:server })
    .done(function(json){
      if(json.status){
        if(json.status == 'success'){
            alertMsg(json.message, "info");
            $('#controlServ'+server).load('rcon/controlserv.php?mode=home&server='+server, function() {
            /// can add another function here
            });
        }
        else if(json.status == 'commandError'){
          alertMsg("L'instruction n'a pas été reconnue par le système...", "warning");
          $('#controlServ'+server).load('rcon/controlserv.php?mode=home&server='+server, function() {
          /// can add another function here
          });          
        }
        else if(json.status == 'connexionError'){
          alertMsg("La connexion au serveur n'a pu être établie (check PORT & IP address)", "warning");
          $('#controlServ'+server).load('rcon/controlserv.php?mode=home&server='+server, function() {
          /// can add another function here
          });
        }
        else if(json.status == 'authError'){
          alertMsg("Authentification au serveur impossible (check password & username)", "warning");
          $('#controlServ'+server).load('rcon/controlserv.php?mode=home&server='+server, function() {
          /// can add another function here
          });
        }
        else if(json.status == 'error'){
            alertMsg(json.message, "danger");
            $('#controlServ'+server).load('rcon/controlserv.php?mode=home&server='+server, function() {
                /// can add another function here
            });
        }
        else{
          alertMsg("Erreur Inconnue...", "danger");
          $('#controlServ'+server).load('rcon/controlserv.php?mode=home&server='+server, function() {
          /// can add another function here
          });
        }
      }
      else{
        alertMsg("Aucun statut renvoyé...", "danger");
        $('#controlServ'+server).load('rcon/controlserv.php?mode=home&server='+server, function() {
        /// can add another function here
        });
      }
    }).fail(function() {
        alertMsg("RCON erreur post FAILED !", "danger");
        $('#controlServ'+server).load('rcon/controlserv.php?mode=home&server='+server, function() {
        /// can add another function here
        });
    });
}

$(document).ready(function(){
  
});