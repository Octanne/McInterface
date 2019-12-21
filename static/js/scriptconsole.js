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
    $("#alertMessage").attr("class", "alert alert-"+cls);
    $("#alertMessage").html(msg);
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