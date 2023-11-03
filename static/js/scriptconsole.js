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
    var txtCommand = document.getElementById("txtCommand");
    var text = txtCommand.value;
    if (text !== "") {
      $("#btnSend").prop("disabled", true);
      sendCommand(getServerName(), text);
      commandHistory.push(text);
      commandHistoryIndex = null;
      txtCommand.value = '';
    }
    closeAutocomplete();
  }

  getTextCommand().addEventListener('keydown', (e) => {
    if (e.key == 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextCommand();
    }
    else if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
      if (isAutocompleteOpen()) {
        e.preventDefault();
        if (e.key == 'ArrowUp') autoCompletePrevious();
        else autoCompleteNext();
      }
      else {
        if (e.key == 'ArrowUp') {
          var isAtTheFirstLine = getTextCommandLinePosition() == 0;
          if (isAtTheFirstLine || e.ctrlKey) {
            e.preventDefault();
            goHistoryBack();
          }
        }
        else {
          var isAtTheLastLine = getTextCommandLinePosition() == getTextCommandLineCount() - 1;
          if (isAtTheLastLine || e.ctrlKey) {
            e.preventDefault();
            goHistoryForward();
          }
        }
      }
    }
    else if (e.key == 'Tab') {
      if (e.shiftKey) {
        e.preventDefault();
        // insert a tabulation character
        const txtCommand = getTextCommand();
        txtCommand.value = txtCommand.value.substring(0, txtCommand.selectionStart) + '\t' + txtCommand.value.substring(txtCommand.selectionEnd);
      }
      else if (isAutocompleteOpen()) {
        e.preventDefault();
        acceptAutoComplete();
      }
    }
  });
  getTextCommand().addEventListener('keyup', (e) => {
    if (e.key == ' ' && e.ctrlKey) {
      openAutocomplete();
    }
    else if (e.key == 'Escape') {
      closeAutocomplete();
    }
    else if ((e.key.length == 1 && e.key.match(/[a-zA-Z\-_0-9~^@\{\}\[\]\(\) ]/)) || e.key == 'Backspace' || e.key == 'ArrowLeft' || e.key == 'ArrowRight') {
      updateAutoComplete();
    } else {
    }
  });
  getTextCommand().addEventListener('mouseup', (e) => {
    updateAutoComplete();
  });

  $("#btnSend").click(() => sendTextCommand());

  $("#btnClearLog").click(function () {
    $("#groupLog").empty();
    alertInfo("La console a été vidée");
  });

  document.getElementById("autocomplete-container").addEventListener('click', e => {
    const container = document.getElementById("autocomplete-container");
    // check if it was a children of autocomplete-container
    if (e.target?.parentNode == container) {
      var index = Array.from(container.children).indexOf(e.target);
      autoCompleteSelect(index);
      acceptAutoComplete(true);
      updateAutoComplete();
    }
  });

  loadDragBar();
});

var logIndex = 0;
var lastResponse = null;
function timingLoad() {
  if (logUpdateOnLoad) return;
  else logUpdateOnLoad = true;
  var path = "rcon/logs_console.php?srv=" + getServerName() + "&line=" + logIndex;
  $.get(path).done(function (jsonResponse) {
    /**
     * @type {string[]}
     */
    const inputs = jsonResponse.consoleLines;

    if (lastResponse !== null && jsonResponse.servStatus !== lastResponse.servStatus) {
      $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + getServerName(), function () {
        /// can add another function here
      });
    }

    if (inputs) {
      var match;
      for (var i = inputs.length - 1; i > 0; i--) {
        if (match = inputs[i].match(/^\u001bM\u001b\[(\d+)C/)) {
          inputs[i - 1] += '\b' + inputs[i].substring(match[0].length);
          inputs.splice(i, 1);
        }
      }
      const inputsLimit = 10000;
      if (inputs.length > inputsLimit) {
        inputs.filter((v, i) => inputs.length - i - 1 <= inputsLimit).forEach(addRawLog);
      }
      else {
        inputs.forEach(addRawLog);
      }
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
    lastResponse = jsonResponse;
    if (isScrollLock()) {
      scrollToBottom();
    }

    setPlayerList(jsonResponse.players);
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

/**
 * @param {HTMLElement[]} nodes
 */
function addLogsHtml(nodes) {
  var li = document.createElement('li');
  for (const node of nodes) {
    li.appendChild(node);
  }
  document.getElementById('groupLog').appendChild(li);
}

/**
 * @param {string} text
 */
function addLog(text) {
  var li = document.createElement('li');
  li.innerText = text;
  document.getElementById('groupLog').appendChild(li);
}

const colors = {
  '30': '000',
  '31': 'a70000',
  '32': '00a700',
  '33': 'fba700',
  '34': '0000a7',
  '35': 'a700a7',
  '36': '00a7a7',
  '37': 'a7a7a7',
  '90': '545454',
  '91': 'fb5454',
  '92': '54fb54',
  '93': 'fbfb54',
  '94': '5454fb',
  '95': 'fb54fb',
  '96': '54fbfb',
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
      this.textColor ? `color: #${this.textColor}; --color: #${this.textColor};` : '',
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
   * @param {number[]} values
   */
  setSGRStyle(values) {
    if (values.length === 0) return;
    const value = values[0];
    if (colors[value]) { this.textColor = (values[1] === 1 ? colors[value + 60] : null) || colors[value]; return; }
    if (colors[value - 10]) { this.bgColor = (values[1] === 1 ? colors[value - 10 + 60] : null) || colors[value - 10]; return; }
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
        console.warn('ANSI/CSI/SGR unknown style', value, values);
        break;
    }
  }

  /**
   * @param {number[]} values
   */
  setSGRStyles(sgrParam) {
    if (sgrParam[0] === 0) {
      this.setSGRStyle([0]);
      sgrParam.shift();
    }
    this.setSGRStyle(sgrParam);
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
  if (text == '>') return '\b';
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

    var sgrParam = match[2].split(';').map(v => parseInt(v || '0'));
    var after = text.substring(match.index + match[0].length);

    style.setSGRStyles(sgrParam);
    text = after;
  }

  // remove with the backspace (\x08 or \b)
  for (let i = 0; i < output.length; i++) {
    var match;
    while (match = output[i].text.match(/\u001b\[(\d+)D/)) {
      output[i].text = output[i].text.replace(match[0], '\b'.repeat(match[1]));
    }
    while ((match = output[i].text.match(/\x08/))) {
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

  const spans = output.filter(v => v.text).map(({ style, classes, text }) => {
    const span = document.createElement('span');
    span.className = classes;
    span.style.cssText = style;
    span.innerText = text;
    return span;
  });
  return spans;
}

/**
 * @param {string} text
 */
function addRawLog(text) {
  text = text.replace(/\r\n$/, '');
  var nodes = parseTextToHtml(text);
  if (nodes != null && nodes.length > 0 && nodes != '\b') addLogsHtml(nodes);
}

var firstScroll = true;
function isScrollLock() { return document.getElementById("chkAutoScroll").checked; }
function scrollToBottom() {
  autoScrolling = Date.now();
  var panelLog = document.getElementById('panelLog');
  panelLog.scroll({
    top: panelLog.scrollHeight,
    left: 0,
    behavior: firstScroll ? 'auto' : 'smooth'
  });
  if (firstScroll) firstScroll = false;
}

function getServerName() {
  queryString = window.location.search;
  urlParams = new URLSearchParams(queryString);
  return urlParams.get('server');
}

function resetAlertMsg() {
  $("#alertMessage").fadeOut("slow", function () {
    $("#alertMessage").attr("class", "d-flex justify-content-center align-items-center alert alert-info");
    $("#alertMessage").html('<strong>Gestionnaire des serveurs (ObeProd)</strong>');
    $("#alertMessage").fadeIn("slow", function () { });
  });
}
var timeoutReset = null;
/**
 * @param {string} msg
 * @param {string} cls CSS Class
 * @param {number} resetTimeout
 */
function alertMsg(msg, cls, resetTimeout) {
  log(`${cls.toUpperCase()}: ${msg}`);
  if (timeoutReset) clearTimeout(timeoutReset);
  timeoutReset = null;
  $("#alertMessage").fadeOut("slow", function () {
    $("#alertMessage").attr("class", "d-flex justify-content-center align-items-center alert alert-" + cls);
    $("#alertMessage").html('<span>' + msg + '</span>');
    $("#alertMessage").fadeIn("slow", function () {
      timeoutReset = setTimeout(resetAlertMsg, resetTimeout);
    });
  });
}
function getDateTime() {
  return new Date().toLocaleString();
}
function log(msg) {
  console.log(`[${getDateTime()}] ${msg}`);
}
function alertSuccess(msg) {
  alertMsg(msg, "success", 10000);
}
function alertInfo(msg) {
  alertMsg(msg, "info", 10000);
}
function alertWarning(msg) {
  alertMsg(msg, "warning", 60000);
}
function alertDanger(msg) {
  alertMsg(msg, "danger", 60000);
}

function btnBoot(serverName) {
  document.getElementById("btnBoot").disabled = true;
  alertInfo("Démarrage du serveur " + serverName + " en cours...");
  sendOrder(serverName, "boot");
}
function btnReboot(serverName) {
  document.getElementById("btnReboot").disabled = true;
  document.getElementById("btnStop").disabled = true;
  alertInfo("Redémarrage du serveur " + serverName + " en cours...");
  sendOrder(serverName, "reboot");
}
function btnStop(serverName) {
  document.getElementById("btnReboot").disabled = true;
  document.getElementById("btnStop").disabled = true;
  alertInfo("Arrêt du serveur " + serverName + " en cours...");
  sendOrder(serverName, "stop");
}

function sendOrder(server, order) {
  $.post("rcon/action.php", { odr: order, srv: server })
    .done(function (json) {
      if (json?.status) {
        if (json.status == 'success') {
          alertInfo(json.message);
          $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
            /// can add another function here
          });
        }
        else if (json.status == 'commandError') {
          alertWarning("L'instruction n'a pas été reconnue par le système...");
          $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
            /// can add another function here
          });
        }
        else if (json.status == 'connexionError') {
          alertWarning("La connexion au serveur n'a pu être établie (check PORT & IP address)");
          $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
            /// can add another function here
          });
        }
        else if (json.status == 'authError') {
          alertWarning("Authentification au serveur impossible (check password & username)");
          $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
            /// can add another function here
          });
        }
        else if (json.status == 'error') {
          alertDanger(json.message);
          $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
            /// can add another function here
          });
        }
        else {
          alertDanger("Erreur Inconnue...");
          $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
            /// can add another function here
          });
        }
      }
      else {
        alertDanger("Aucun statut renvoyé...");
        $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
          /// can add another function here
        });
      }
    }).fail(function (...e) {
      alertDanger("RCON erreur post FAILED !");
      console.log('Order ' + order + ' sent to ' + server + ' FAILED !', e);
      $('#controlServ').load('rcon/controlserv.php?mode=console&server=' + server, function () {
        /// can add another function here
      });
    });
}

function sendCommand(server, command) {
  command = command.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

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
          alertDanger("Le serveur " + server + " est hors-ligne (démarrez le d'abord)");
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

/** @return {HTMLTextAreaElement} */
function getTextCommand() { return document.getElementById("txtCommand"); }
function getTextCommandLinePosition() {
  var txtCommand = getTextCommand();
  return txtCommand.value.substring(0, txtCommand.selectionStart).split('\n').length - 1;
}
function getTextCommandLineCount() {
  var txtCommand = getTextCommand();
  return txtCommand.value.split('\n').length;
}
function fillTextCommand(text, selectIndex) {
  var txtCommand = getTextCommand();
  txtCommand.value = text;
  txtCommand.selectionStart = selectIndex ?? text.length;
  txtCommand.selectionEnd = selectIndex ?? text.length;
}
var commandHistory = [];
var tempCommand = '';
var commandHistoryIndex = 0;
function goHistoryBack() {
  if (commandHistoryIndex == null) {
    if (commandHistory.length == 0) return;
    tempCommand = getTextCommand().value;
    commandHistoryIndex = commandHistory.length;
  }
  if (commandHistoryIndex > 0) {
    commandHistoryIndex--;
    fillTextCommand(commandHistory[commandHistoryIndex]);
  }
}
function goHistoryForward() {
  if (commandHistoryIndex == null) return;
  if (commandHistoryIndex + 1 < commandHistory.length) {
    commandHistoryIndex++;
    fillTextCommand(commandHistory[commandHistoryIndex], 0);
  }
  else {
    commandHistoryIndex = null;
    fillTextCommand(tempCommand, 0);
  }
}


/** @param {{id:string,name:string}[]} players */
function setPlayerList(players) {
  const playerList = document.getElementById('playerList');
  /** @type {HTMLDivElement[]} */
  const playerListChildren = Array.from(playerList.children);

  players ??= [];
  for (const player of players) {
    const playerId = player.id;
    const playerName = player.name;
    let head = playerListChildren.find(child => child.uuid == playerId);
    if (head) {
      // update the player
      head.title = playerName;
      head.name = playerName;
    }
    else {
      head = document.createElement('div');
      head.className = 'playerHead';
      head.title = playerName;
      head.uuid = playerId;
      head.name = playerName;
      const img = document.createElement('img');
      img.src = `https://mc-heads.net/head/${playerId}/16`;
      img.alt = playerName;
      head.appendChild(img);
      const span = document.createElement('span');
      span.innerText = playerName;
      head.appendChild(span);
      head.style.opacity = 0;
      head.addEventListener('load', () => head.style.removeProperty('opacity'), true);
      setTimeout(() => head.style.removeProperty('opacity'), 1000);

      // insert the player at the right position (ordered by name)
      let insertBefore = null;
      for (const child of playerList.children) {
        if (child.name > playerName) {
          insertBefore = child;
          break;
        }
      }
      if (insertBefore == null) {
        playerList.appendChild(head);
      }
      else {
        playerList.insertBefore(head, insertBefore);
      }
    }
  }
  // remove the players in the DOM which are not in the list
  // Array.from(playerList.children).filter(head => !players.find(player => player.id == head.uuid)).forEach(head => playerList.removeChild(head));
  setAutocompletePlayerList(players);
}

/** @type {HTMLSpanElement} */
var autoCompleteSelected = null;
function openAutocomplete() {
  const autocompleteDOM = document.getElementById('autocomplete-container');
  var textCommand = getTextCommand();
  var commandLine = textCommand.value;
  /** @type {string[]} */
  var autocompleteList = getAutocompleteList(commandLine, textCommand.selectionEnd);
  if (autocompleteList.length == 0) {
    autocompleteDOM.setAttribute('empty', '');
  }
  else {
    autocompleteDOM.removeAttribute('empty');
    autocompleteDOM.innerHTML = '';
    for (const item of autocompleteList) {
      const itemDOM = document.createElement('span');
      itemDOM.innerHTML = item;
      autocompleteDOM.appendChild(itemDOM);
    }
    if (autoCompleteSelected != null) {
      // select the item with the same text
      var text = autoCompleteSelected.innerText || '';
      autoCompleteSelected = Array.from(autocompleteDOM.children).find(child => child.textContent.startsWith(text) || text.startsWith(child.textContent)) || null;
    }
    if (autoCompleteSelected == null) {
      autoCompleteSelected = autocompleteDOM.firstChild;
    }
    autoCompleteSelected?.setAttribute?.('selected', '');
  }
  var lastSpaceIndex = commandLine.lastIndexOf(' ');
  autocompleteDOM.style.setProperty('--cursor-x', lastSpaceIndex == -1 ? 0 : lastSpaceIndex + 1);
}
function isAutocompleteOpen() { return autoCompleteSelected != null; }
function updateAutoComplete() {
  if (isAutocompleteOpen()) {
    openAutocomplete();
  }
}
function closeAutocomplete() {
  const autocompleteDOM = document.getElementById('autocomplete-container');
  autocompleteDOM.setAttribute('empty', '');
  autocompleteDOM.innerHTML = '';
  autoCompleteSelected = null;
}
function autoCompletePrevious() {
  if (autoCompleteSelected == null) return;
  autoCompleteSelected.removeAttribute('selected');
  autoCompleteSelected = autoCompleteSelected.previousElementSibling || autoCompleteSelected;
  autoCompleteSelected.setAttribute('selected', '');
}
function autoCompleteNext() {
  if (autoCompleteSelected == null) return;
  autoCompleteSelected.removeAttribute('selected');
  autoCompleteSelected = autoCompleteSelected.nextElementSibling || autoCompleteSelected;
  autoCompleteSelected.setAttribute('selected', '');
}
function autoCompleteSelect(index) {
  autoCompleteSelected?.removeAttribute('selected');
  const autocompleteDOM = document.getElementById('autocomplete-container');
  autoCompleteSelected = autocompleteDOM.children[index] || null;
  autoCompleteSelected?.setAttribute('selected', '');
}
function acceptAutoComplete(insertSpace = false) {
  if (autoCompleteSelected == null) return;
  const commandLine = getTextCommand().value;
  var lastSpaceIndex = commandLine.lastIndexOf(' ');
  var newCommandLine = commandLine.substring(0, lastSpaceIndex + 1) + autoCompleteSelected.textContent;
  if (insertSpace) newCommandLine += ' ';
  fillTextCommand(newCommandLine);
}

// DragBar
/** @type {[{dragbar:HTMLElement, wrapper:HTMLElement, boxA:HTMLElement, min:number, max:number, horizontal:boolean}]} */
var dragbars = [];
/** @type {{dragbar:HTMLElement, wrapper:HTMLElement, boxA:HTMLElement, min:number, max:number, horizontal:boolean}} */
var dragbarDragging = null;
function loadDragBar() {
  const dragbarsDOM = document.getElementsByClassName('dragbar');
  for (const dragbar of dragbarsDOM) {
    const wrapper = dragbar.parentElement;
    const boxA = wrapper.children[0];
    const horizontal = dragbar.classList.contains('dragbar-horizontal');
    dragbars.push({ dragbar, wrapper, boxA, min: 0, max: 10000, horizontal });
  }
}
document.addEventListener('mousedown', function (e) {
  // If mousedown event is fired from a dragbar
  const dragbar = dragbars.find(dragbar => dragbar.dragbar == e.target);
  if (dragbar) {
    dragbarDragging = dragbar;
    const min_ratio = dragbar.dragbar.getAttribute('min_ratio') || '0';
    const max_ratio = dragbar.dragbar.getAttribute('max_ratio') || '1';
    var minSizeBoxA = (dragbar.dragbar.getAttribute('min_size_boxA') || '0px').replace('px', '');
    var maxSizeBoxA = (dragbar.dragbar.getAttribute('max_size_boxA') || '10000px').replace('px', '');
    var minSizeBoxB = (dragbar.dragbar.getAttribute('min_size_boxB') || '0px').replace('px', '');
    var maxSizeBoxB = (dragbar.dragbar.getAttribute('max_size_boxB') || '10000px').replace('px', '');
    const wrapperSize = dragbar.horizontal ? dragbar.wrapper.clientHeight : dragbar.wrapper.clientWidth;
    dragbar.min = Math.max(minSizeBoxA, wrapperSize * min_ratio, wrapperSize - maxSizeBoxB - 28);
    dragbar.max = Math.min(maxSizeBoxA, wrapperSize * max_ratio, wrapperSize - minSizeBoxB - 28);
  }
  else {
    dragbarDragging = null;
  }
});

document.addEventListener('mousemove', function (e) {
  if (!dragbarDragging) return false;

  if (!dragbarDragging.horizontal) {
    // Get offset
    var containerOffsetLeft = dragbarDragging.wrapper.offsetLeft;

    // Get x-coordinate of pointer relative to container
    var pointerRelativeXpos = e.clientX - containerOffsetLeft;

    // Resize box A
    // * 8px is the left/right spacing between .handler and its inner pseudo-element
    // * Set flex-grow to 0 to prevent it from growing
    var width = Math.min(Math.max(dragbarDragging.min, pointerRelativeXpos - 8), dragbarDragging.max);
    dragbarDragging.boxA.style.width = width + 'px';
    dragbarDragging.boxA.style.minWidth = width + 'px';
    dragbarDragging.boxA.style.maxWidth = width + 'px';
  }
  else {
    var containerOffsetTop = dragbarDragging.wrapper.offsetTop;
    var pointerRelativeYpos = e.clientY - containerOffsetTop;
    var height = Math.min(Math.max(dragbarDragging.min, pointerRelativeYpos - 8), dragbarDragging.max);
    dragbarDragging.boxA.style.height = height + 'px';
    dragbarDragging.boxA.style.minHeight = height + 'px';
    dragbarDragging.boxA.style.maxHeight = height + 'px';
  }
  dragbarDragging.boxA.style.flexGrow = 0;
});

document.addEventListener('mouseup', function (e) {
  // Turn off dragging
  dragbarDragging = null;
});

document.addEventListener('mousedown', function (e) {
  // Close autocomplete
  closeAutocomplete();
});