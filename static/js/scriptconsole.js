var logUpdateOnLoad = false;

$(document).ready(function () {
  timingLoad();
  setInterval(timingLoad, 2500);

  var panelLog = document.getElementById('panelLog');
  var autoScrolling = 0;
  setTimeout(() => { autoScrolling = Date.now() + 1000; }, 100);
  function setScrollLock(lock) { document.getElementById("chkAutoScroll").checked = lock; }
  function isAtBottom() { return panelLog.scrollHeight < panelLog.clientHeight + panelLog.scrollTop + 10; }
  function onUserScroll() { setScrollLock(isAtBottom()); }
  panelLog.addEventListener('scroll', (event) => {
    if (Date.now() - autoScrolling > 500) onUserScroll();
  });

  function sendTextCommand() {
    if ($("#txtCommand").val() !== "") {
      $("#btnSend").prop("disabled", true);
      sendCommand(getServerName(), $("#txtCommand").val());
      $("#txtCommand").val("");
    }
  }

  $("#txtCommand").keyup(function (e) {
    if (e.keyCode == 13) {
      sendTextCommand();
    }
  });

  $("#btnSend").click(() => sendTextCommand());

  $("#btnClearLog").click(function () {
    $("#groupLog").empty();
    alertInfo("La console a été vidée");
  });
});

var logIndex = 0;
function timingLoad() {
  if (logUpdateOnLoad) return;
  else logUpdateOnLoad = true;
  var path = "rcon/logs_console.php?srv=" + getServerName() + "&line=" + logIndex;
  $.get(path).done(function (jsonResponse) {
    const inputs = jsonResponse.consoleLines;

    if (inputs) {
      inputs.forEach(addRawLog);
    }
    else {
      addLog(`${getLogTextTime()} Le serveur n'est pas accessible : ${jsonResponse.message}`);
    }
    if (jsonResponse.endIndex + 1 < logIndex) {
      $("#groupLog").empty();
      alertInfo("La console a été vidée");
      logIndex = 0;
      timingLoad();
    }
    else {
      logIndex = jsonResponse.endIndex + 1;
    }
    logUpdateOnLoad = false;
    if (isScrollLock()) {
      scrollToBottom();
    }
  });
}

function normaliseInt(n, numberOfDigits) {
  var s = n.toString();
  while (s.length < numberOfDigits) s = "0" + s;
  return s;
}
function getLogTextTime() {
  const now = new Date();
  var h = normaliseInt(now.getHours(), 2);
  var m = normaliseInt(now.getMinutes(), 2);
  var s = normaliseInt(now.getSeconds(), 2);
  return `[${h}:${m}:${s}]`;
}

function addLog(html) {
  var li = document.createElement('li');
  li.innerHTML = html;
  document.getElementById('groupLog').appendChild(li);
}

const colors = {
  '30': '000',
  '31': 'f00',
  '32': '0f0',
  '33': 'ff0',
  '34': '00f',
  '35': 'f0f',
  '36': '0ff',
  '37': 'fff',
  '90': '000',
  '91': 'f00',
  '92': '0f0',
  '93': 'ff0',
  '94': '00f',
  '95': 'f0f',
  '96': '0ff',
  '97': 'fff',
};

class SGRStyle {
  textColor = '';
  bgColor = '';
  fontWeight = '';
  fontStyle = '';
  underlined = false;
  overlined = false;
  magic = false;

  constructor() { }

  getStyles() {
    return [
      this.textColor ? `color: #${this.textColor};` : '',
      this.bgColor ? `background-color: #${this.bgColor};` : '',
    ].filter(v => v).join(' ');
  }
  getClasses() {
    return [
      this.fontWeight ? `font-weight-${this.fontWeight}` : '',
      this.fontStyle ? `font-${this.fontStyle}` : '',
      this.underlined ? `text-decoration-underlined` : '',
      this.overlined ? `text-decoration-overlined` : '',
      this.magic ? 'text-magic' : '',
    ].filter(v => v).join(' ');
  }

  /**
   * @param {number} value
   */
  setSGRStyle(value) {
    if (colors[value]) { this.textColor = colors[value]; return; }
    if (colors[value - 10]) { this.bgColor = colors[value - 10]; return; }
    switch (value) {
      case 0:
        this.textColor = '';
        this.bgColor = '';
        this.fontWeight = '';
        this.fontStyle = '';
        this.underlined = false;
        this.overlined = false;
        this.magic = false;
        break;
      case 1: this.fontWeight = 'bold'; break;
      case 2: this.fontWeight = 'lighter'; break;
      case 3: this.fontStyle = 'italic'; break;
      case 4: this.underlined = true; break;
      case 5: this.magic = true; break;
      case 9: this.overlined = true; break;
      case 21: this.fontWeight = 'bold'; break;
      case 22: this.fontWeight = ''; break;
      case 23: this.fontStyle = ''; break;
      case 24: this.underlined = false; break;
      case 39: this.textColor = 0; break;
      case 49: this.bgColor = 0; break;
      case 53: this.overlined = true; break;
      case 55: this.overlined = false; break;
      default:
        console.warn('unknown style', value);
        break;
    }
  }
}

/**
 * @param {string} value
 */
function getStyle(value) {
  if (colors[value]) return 'color: #' + colors[value];
  switch (value) {
    case '0': return 'color: #000; font-weight: normal;'; // reset
    case '1': return 'font-weight: bold;'; // bold
    case '22': return 'font-weight: normal;'; // unbold
    case '39': return 'color: #000;'; // default
    default:
      console.warn(`ANSI/CSI/SGR unknown style: ${value}`);
      return '';
  }
}

/**
 * @param {string} text
 */
function parseTextToHtml(text) {
  // The text uses CSI (Control Sequence Introducer) to define styles.
  // https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences
  text = text
    .replace(/^\u001b\[m/, '')
    .replace(/\u001b\[K/g, '')
    .replace(/\u001b\[\?\d+h/g, '')
    .replace(/\u001b\[\?\d+l/g, '')
    .replace(/\u001b\=/, '')
    .replace(/\u001b>/, '')
    .replace(/^> \s+/, '');
  /**
   * @type {{style:string, classes:string, text:string}[]}
   */
  var output = [];
  var style = new SGRStyle();
  var match;
  while ((match = text.match(/(\u001b\[|\x1B\[)([\d;]*)m/)) || text.length) {
    var before = match ? text.substring(0, match.index) : text;
    if (before) {
      var added = false;
      if (output.length > 0) {
        // Add to the previous span
        var previous = output[output.length - 1];
        if (style.getStyles() == previous.style && style.getClasses() == previous.classes) {
          previous.text += before;
          added = true;
        }
      }
      if (!added) {
        // Or create a new span
        output.push({
          style: style.getStyles(),
          classes: style.getClasses(),
          text: before,
        });
        added = true;
      }
    }
    if (!match) break;

    var sgrParam = match[2];
    var after = text.substring(match.index + match[0].length);

    sgrParam.split(';').forEach(param => style.setSGRStyle(parseInt(param || '0')));
    text = after;
  }

  var iSafe = 0;
  // remove with the backspace (\x08)
  for (let i = 0; i < output.length; i++) {
    var match;
    while ((match = output[i].text.match(/\x08/))) {
      iSafe++;
      if (match.index > 0) {
        // Remove the previous character and the backspace
        output[i].text = output[i].text.substring(0, match.index - 1) + output[i].text.substring(match.index + 1);
      }
      else {
        // Remove the last character of the previous span
        var previousNotEmpty = output.filter((v, previousIndex) => v.text.length > 0 && previousIndex < i).slice(-1)[0];
        if (previousNotEmpty) {
          previousNotEmpty.text = previousNotEmpty.text.substring(0, previousNotEmpty.text.length - 1);
        }
        // Remove the backspace
        output[i].text = output[i].text.substring(1);
      }
    }
    output[i].text = output[i].text.replace(/[^\x08]\x08/g, '');
  }
  // remove empty
  output = output.filter(v => v.text.length > 0);

  const spans = output.filter(v => v.text).map(({ style, classes, text }) => `<span${classes ? ` class="${classes}"` : ''}${style ? ` style="${style}"` : ''}>${text}</span>`);
  return spans.join('');
}

/**
 * @param {string} text
 */
function addRawLog(text) {
  text = text.replace(/\r\n$/, '');
  var textBetweenReset = text.split('\\u001b\[0m').filter(text => text != '');

  var html = textBetweenReset.map(text => parseTextToHtml(text)).join('\n');
  addLog(html);
}

function isScrollLock() { return document.getElementById("chkAutoScroll").checked; }
function scrollToBottom() {
  autoScrolling = Date.now();
  var panelLog = document.getElementById('panelLog');
  panelLog.scroll({
    top: panelLog.scrollHeight,
    left: 0,
    behavior: 'smooth'
  });
}

function getServerName() {
  queryString = window.location.search;
  urlParams = new URLSearchParams(queryString);
  return urlParams.get('server');
}

function alertMsg(msg, cls) {
  $("#alertMessage").fadeOut("slow", function () {
    $("#alertMessage").attr("class", "d-flex justify-content-center align-items-center alert alert-" + cls);
    $("#alertMessage").html('<span>' + msg + '</span>');
    $("#alertMessage").fadeIn("slow", function () { });
  });
}
function alertSuccess(msg) {
  alertMsg(msg, "success");
}
function alertInfo(msg) {
  alertMsg(msg, "info");
}
function alertWarning(msg) {
  alertMsg(msg, "warning");
}
function alertDanger(msg) {
  alertMsg(msg, "danger");
}

function btnBoot(serverName) {
  document.getElementById("btnBoot").disabled = true;
  alertMsg("Démarage du serveur " + serverName + " en cours...", "info");
  sendOrder(serverName, "boot");
}
function btnReboot(serverName) {
  document.getElementById("btnReboot").disabled = true;
  document.getElementById("btnStop").disabled = true;
  alertMsg("Redémarage du serveur " + serverName + " en cours...", "info");
  sendOrder(serverName, "reboot");
}
function btnStop(serverName) {
  document.getElementById("btnReboot").disabled = true;
  document.getElementById("btnStop").disabled = true;
  alertMsg("Arrêt du serveur " + serverName + " en cours...", "info");
  sendOrder(serverName, "stop");
}

function sendOrder(server, order) {
  $.post("rcon/action.php", { odr: order, srv: server })
    .done(function (json) {
      if (json.status) {
        if (json.status == 'success') {
          alertMsg(json.message, "info");
          $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
            /// can add another function here
          });
        }
        else if (json.status == 'commandError') {
          alertMsg("L'instruction n'a pas été reconnue par le système...", "warning");
          $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
            /// can add another function here
          });
        }
        else if (json.status == 'connexionError') {
          alertMsg("La connexion au serveur n'a pu être établie (check PORT & IP address)", "warning");
          $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
            /// can add another function here
          });
        }
        else if (json.status == 'authError') {
          alertMsg("Authentification au serveur impossible (check password & username)", "warning");
          $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
            /// can add another function here
          });
        }
        else if (json.status == 'error') {
          alertMsg(json.message, "danger");
          $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
            /// can add another function here
          });
        }
        else {
          alertMsg("Erreur Inconnue...", "danger");
          $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
            /// can add another function here
          });
        }
      }
      else {
        alertMsg("Aucun statut renvoyé...", "danger");
        $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
          /// can add another function here
        });
      }
    }).fail(function () {
      alertMsg("RCON erreur post FAILED !", "danger");
      $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
        /// can add another function here
      });
    });
}

function sendCommand(server, command) {
  $.post("rcon/action.php", { cmd: command, srv: server, odr: 'command' })
    .done(function (json) {
      $("#btnSend").prop("disabled", false);
      if (json.status) {
        if (json.status == 'success') {
          alertSuccess("La commande a été exécutée...");
          setTimeout(timingLoad, 500);
        }
        else if (json.status == 'commandError') {
          alertWarning("L'instruction n'a pas été reconnue par le système...");
        }
        else if (json.status == 'connexionError') {
          alertWarning("La connexion au serveur n'a pu être établie (check PORT & IP address)");
        }
        else if (json.status == 'authError') {
          alertWarning("Authentification au serveur impossible (check password & username)");
        }
        else if (json.status == 'offlineError') {
          alertDanger("Le serveur " + server + " est hors-ligne (démarrer le d'abord)");
        }
        else {
          alertDanger("Erreur Inconnue...");
        }
      }
      else {
        alertDanger("Aucun statut renvoyé...");
      }
    }).fail(function () {
      alertDanger("RCON erreur post FAILED !");
    });
}