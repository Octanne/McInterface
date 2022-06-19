$(document).ready(function(){
  timingLoad();
  setInterval(timingLoad, 2000);
  function timingLoad() {
  var pathArray = window.location.href.split('=');
  var path = "rcon/logs.php?server="+pathArray[1];
    $('#groupLog').load(path, function() {
      if(document.getElementById("chkAutoScroll").checked == true){
        document.getElementById("panelLog").scroll({
          top: document.getElementById("panelLog").scrollHeight,
          left: 0,
          behavior: 'smooth'
        });
      }
    });
  }
  
  $("#txtCommand").bind("enterKey",function(){
    sendCommand(window.location.href.split('=')[1], $("#txtCommand").val());
  });

  $("#txtCommand").keyup(function(e){
    if(e.keyCode == 13){
      $(this).trigger("enterKey");
      $(this).val("");
    }
  });

  $("#btnSend").click(function(){
    if($("#txtCommand").val() !== ""){
      $("#btnSend").prop("disabled", true);
    }
    sendCommand(window.location.href.split('=')[1], $("#txtCommand").val());
  });

  $("#btnClearLog").click(function() {
    $("#groupConsole").empty();
    alertInfo("La console a été vidé");
  });
});

function alertMsg(msg, cls){
  $("#alertMessage").fadeOut("slow", function(){
    $("#alertMessage").attr("class", "d-flex justify-content-center align-items-center alert alert-"+cls);
    $("#alertMessage").html('<span>'+ msg + '</span>');
    $("#alertMessage").fadeIn("slow", function(){});
  });
}
function alertSuccess(msg){
  alertMsg(msg, "success");
}
function alertInfo(msg){
  alertMsg(msg, "info");
}
function alertWarning(msg){
  alertMsg(msg, "warning");
}
function alertDanger(msg){
  alertMsg(msg, "danger");
}

function btnBoot(serverName){
  document.getElementById("btnBoot").disabled = true;
  alertMsg("Démarage du serveur "+serverName+" en cours...", "info");
  sendOrder(serverName, "boot");
}
function btnReboot(serverName){
  document.getElementById("btnReboot").disabled = true;
  document.getElementById("btnStop").disabled = true;
  alertMsg("Redémarage du serveur "+serverName+" en cours...", "info");
  sendOrder(serverName, "reboot");
}
function btnStop(serverName){
  document.getElementById("btnReboot").disabled = true;
  document.getElementById("btnStop").disabled = true;
  alertMsg("Arrêt du serveur "+serverName+" en cours...", "info");
  sendOrder(serverName, "stop");
}

function sendOrder(server, order){
  $.post("rcon/action.php", { odr:order, srv:server })
      .done(function(json){
        if(json.status){
          if(json.status == 'success'){
            alertMsg(json.message, "info");
            $('#controlServ').load('rcon/controlserv.php?mode=console&server='+server, function() {
              /// can add another function here
            });
          }
          else if(json.status == 'commandError'){
            alertMsg("L'instruction n'a pas été reconnue par le système...", "warning");
            $('#controlServ').load('rcon/controlserv.php?mode=console&server='+server, function() {
              /// can add another function here
            });
          }
          else if(json.status == 'connexionError'){
            alertMsg("La connexion au serveur n'a pu être établie (check PORT & IP address)", "warning");
            $('#controlServ').load('rcon/controlserv.php?mode=console&server='+server, function() {
              /// can add another function here
            });
          }
          else if(json.status == 'authError'){
            alertMsg("Authentification au serveur impossible (check password & username)", "warning");
            $('#controlServ').load('rcon/controlserv.php?mode=console&server='+server, function() {
              /// can add another function here
            });
          }
          else{
            alertMsg("Erreur Inconnue...", "danger");
            $('#controlServ').load('rcon/controlserv.php?mode=console&server='+server, function() {
              /// can add another function here
            });
          }
        }
        else{
          alertMsg("Aucun statut renvoyé...", "danger");
          $('#controlServ').load('rcon/controlserv.php?mode=console&server='+server, function() {
            /// can add another function here
          });
        }
      }).fail(function() {
    alertMsg("RCON erreur post FAILED !", "danger");
    $('#controlServ').load('rcon/controlserv.php?mode=console&server='+server, function() {
      /// can add another function here
    });
  });
}

function sendCommand(server, command){
  $.post("rcon/action.php", { cmd:command, srv:server, odr:'command' })
    .done(function(json){
      if(json.status){
        if(json.status == 'success'){
          alertSuccess(json.message);
          var pathArray = window.location.href.split('=');
          var path = "rcon/logs.php?server="+pathArray[1];
          $('#groupLog').load(path, function() {
          /// can add another function here
          });
        }
        else if(json.status == 'commandError'){
          alertWarning("L'instruction n'a pas été reconnue par le système...");
        }
        else if(json.status == 'connexionError'){
          alertWarning("La connexion au serveur n'a pu être établie (check PORT & IP address)");
        }
        else if(json.status == 'authError'){
          alertWarning("Authentification au serveur impossible (check password & username)");
        }
        else if(json.status == 'offlineError'){
          alertDanger("Le serveur "+ server + " est hors-ligne (démarrer le d'abord)");
        }
        else{
          alertDanger("Erreur Inconnue..."); 
        }
      }
      else{
        alertDanger("Aucun statut renvoyé...");
      }
    }).fail(function() {
      alertDanger("RCON erreur post FAILED !");
    });
}