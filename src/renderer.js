const { ipcRenderer } = require('electron')
const { startChecker, getConnectionState, ConnectionState, ConnectionEvent } = require('connection-checker')
const { requestLogger } = require('the-browser-logger')

const NETWORK_REQUEST_TIMEOUT = 2000

function logger() {
  return requestLogger('connection-checker-ui')
}

function applicationClose() {
  ipcRenderer.send('application-close')
}

function updateUIValues(elementID, state) {
  document.getElementById(elementID).innerText = state
}

function updateBodyClass(newClass) {
  document.getElementsByTagName('body')[0].className = newClass
}

function WANIpCheck() {
  ipcRenderer.send('request-wan-ip')
}


function LANIpCheck() {
  ipcRenderer.send('request-lan-ip')
}

ipcRenderer.on('send-wan-ip', (sender, data) => {
  if (!!data) {
    const ipString = new TextDecoder("utf-8").decode(data);
    updateUIValues('wanIP', ipString)
  } else {
    updateUIValues('wanIP', '?')
  }
})

ipcRenderer.on('send-lan-ip', (sender, localInterfaces) => {
  const lanIPElement = document.getElementById('lanIP')
  lanIPElement.innerHTML = ''

  let ifaceLabel = document.createElement("P")
  ifaceLabel.className = 'network-label'

  const labelText = document.createTextNode('LOCAL')
  ifaceLabel.appendChild(labelText)

  lanIPElement.appendChild(ifaceLabel)
  if (localInterfaces.length >= 1 ) {
    for (let index = 0; index < localInterfaces.length; index++) {
      const iface = localInterfaces[index]

      let ifaceElement = document.createElement("P")
      ifaceElement.className = 'network-value'

      const ifaceData = document.createTextNode(iface.name + ': ' + iface.address)
      ifaceElement.appendChild(ifaceData)

      lanIPElement.appendChild(ifaceElement)
    }
  } else {
    let ifaceElement = document.createElement("P")
    ifaceElement.className = 'network-value'

    const ifaceData = document.createTextNode('?')
    ifaceElement.appendChild(ifaceData)

    lanIPElement.appendChild(ifaceElement)
  }
})

window.addEventListener(ConnectionEvent.ON_NETWORK_CHECKING, function() {
  logger().debug(ConnectionEvent.ON_NETWORK_CHECKING)
  // ipcRenderer.send('network-status', '_onNetworkChecking() ' + getConnectionState())
}, true)

window.addEventListener(ConnectionEvent.ON_NETWORK_CHANGED, function(event) {
  logger().debug(ConnectionEvent.ON_NETWORK_CHANGED)
  // ipcRenderer.send('network-status', '_onNetworkChanged() from state: ' + event.detail.from + ', to state: ' + event.detail.to)
}, true)

window.addEventListener(ConnectionEvent.ON_NETWORK_CONNECTED, function() {
  logger().debug(ConnectionEvent.ON_NETWORK_CONNECTED)
  updateUIValues('network-state', ConnectionState.CONNECTED)
  updateBodyClass(ConnectionState.CONNECTED)
  LANIpCheck()
  WANIpCheck()
  // ipcRenderer.send('network-status', '_onNetworkConnected()')
}, true)

window.addEventListener(ConnectionEvent.ON_NETWORK_DISCONNECTED, function() {
  logger().debug(ConnectionEvent.ON_NETWORK_DISCONNECTED)
  updateUIValues('network-state', ConnectionState.DISCONNECTED)
  updateBodyClass(ConnectionState.DISCONNECTED)
  LANIpCheck()
  WANIpCheck()
  // ipcRenderer.send('network-status', '_onNetworkDisconnected()')
}, true)

window.addEventListener('load', function () {
  startChecker()
})