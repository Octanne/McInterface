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
        $("#alertMessage").attr("class", "alert alert-"+cls);
        $("#alertMessage").html(msg);
        $("#alertMessage").fadeIn("slow", function(){});
    });
}

function sendOrder(server, order){
  $.post("rcon/action.php", { odr:order, srv:server })
    .done(function(json){
      if(json.status){
        if(json.status == 'success'){
            alertMsg(json.message, "info");
            $('#ControlServ'+server).load('rcon/controlserv.php?server='+server, function() {
            /// can add another function here
            });
        }
        else if(json.status == 'commandError'){
          alertMsg("L'instruction n'a pas été reconnue par le système...", "warning");
          $('#ControlServ'+server).load('rcon/controlserv.php?server='+server, function() {
          /// can add another function here
          });          
        }
        else if(json.status == 'connexionError'){
          alertMsg("La connexion au serveur n'a pu être établie (check PORT & IP address)", "warning");
          $('#ControlServ'+server).load('rcon/controlserv.php?server='+server, function() {
          /// can add another function here
          });
        }
        else if(json.status == 'authError'){
          alertMsg("Authentification au serveur impossible (check password & username)", "warning");
          $('#ControlServ'+server).load('rcon/controlserv.php?server='+server, function() {
          /// can add another function here
          });
        }
        else{
          alertMsg("Erreur Inconnue...", "danger");
          $('#ControlServ'+server).load('rcon/controlserv.php?server='+server, function() {
          /// can add another function here
          });
        }
      }
      else{
        alertMsg("Aucun statut renvoyé...", "danger");
        $('#ControlServ'+server).load('rcon/controlserv.php?server='+server, function() {
        /// can add another function here
        });
      }
    }).fail(function() {
        alertMsg("RCON erreur post FAILED !", "danger");
        $('#ControlServ'+server).load('rcon/controlserv.php?server='+server, function() {
        /// can add another function here
        });
    });
}

$(document).ready(function(){
  
});