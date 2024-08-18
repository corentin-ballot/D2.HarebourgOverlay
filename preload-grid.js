const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
send: (channel, data) => {
    ipcRenderer.send(channel, data);
},
on: (channel, func) => {
    ipcRenderer.on(channel, func);
},
disableMouseEvent: 
    () => ipcRenderer.send('disable-mouse-event'),
enableMouseEvent: 
    () => ipcRenderer.send('enable-mouse-event'),
});