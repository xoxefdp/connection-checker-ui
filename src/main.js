const { app, BrowserWindow, ipcMain, net } = require('electron')
const os = require('os')

let mainWindow;

function requestWanInterface() {
  const request = net.request('https://bot.whatismyipaddress.com')
  request.on('response', (response) => {
    // console.log(`STATUS: ${response.statusCode}`)
    // console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
    // console.log(`RESPONSE: ${JSON.stringify(response)}`)
    response.on('data', (data) => {
      // console.log(`BODY: ${data}`)
      mainWindow.webContents.send("send-wan-ip", data);
    })
    response.on('error', (error) => {
      // console.log(`ERROR response: ${JSON.stringify(error)}`)
      mainWindow.webContents.send("send-wan-ip", null);
    })
    response.on('end', () => {
      // console.log('No more data in response.')
    })
  })
  request.on('error', (error) => {
    // console.log(`ERROR request: ${JSON.stringify(error)}`)
    mainWindow.webContents.send("send-wan-ip", null);
  })
  request.end()
}

function requestLocalInterfaces() {
  const networkInterfaces = os.networkInterfaces()
  let localInterfaces = []
  Object.keys(networkInterfaces).forEach( (ifname) => {
    let alias = 0;
    networkInterfaces[ifname].forEach( (iface) => {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        return;
      }
      if (alias >= 1) {
        localInterfaces.push({
          name: ifname + ':' + alias,
          address: iface.address
        })
        // console.log(ifname + ':' + alias, iface.address)
      } else {
        localInterfaces.push({
          name: ifname,
          address: iface.address
        })
        // console.log(ifname, iface.address)
      }
      ++alias
    });
  });

  // console.log(localInterfaces)
  mainWindow.webContents.send("send-lan-ip", localInterfaces);
}

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    title: 'Connection Checker UI',
    width: 360,
    height: 360,
    frame: false,
    x: 0,
    y: 0,
    resizable: false,
    webPreferences: {
      // devTools: false,
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(`file://${__dirname}/index.html`)
})

ipcMain.on('request-wan-ip', (event) => {
  // console.log('request-wan-ip')
  requestWanInterface()
})

ipcMain.on('request-lan-ip', (event) => {
  // console.log('request-lan-ip')
  requestLocalInterfaces()
})

ipcMain.on('network-status', (event, status) => {
  // console.log('network-status')
  // console.log(status)
})

ipcMain.on('application-close', (event) => {
  // console.log('application-close')
  app.quit()
})
