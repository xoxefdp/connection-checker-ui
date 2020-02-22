const { app, BrowserWindow, ipcMain } = require('electron')
const os = require('os');

let mainWindow;

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
      devTools: false,
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(`file://${__dirname}/index.html`)
})



function requestlocalInterfaces() {
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
        console.log(ifname + ':' + alias, iface.address)
      } else {
        localInterfaces.push({
          name: ifname,
          address: iface.address
        })
        console.log(ifname, iface.address)
      }
      ++alias
    });
  });

  console.log(localInterfaces)
  mainWindow.webContents.send("send-lan-ip", localInterfaces);
}


ipcMain.on('request-lan-ip', (event) => {
  requestlocalInterfaces()
})

ipcMain.on('network-status', (event, status) => {
  console.log(status)
})
